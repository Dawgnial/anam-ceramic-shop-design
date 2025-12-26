import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ZARINPAL_REQUEST_URL = "https://api.zarinpal.com/pg/v4/payment/request.json";

// Generate a secure random verification token
function generateVerificationToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

interface PaymentRequest {
  amount: number;
  description: string;
  mobile: string;
  callback_url: string;
  order_data: {
    shipping_address: string;
    items: Array<{
      product_name: string;
      product_image: string;
      quantity: number;
      price: number;
    }>;
    coupon_id?: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get merchant ID from environment variable
    const merchantId = Deno.env.get("ZARINPAL_MERCHANT_ID");
    console.log("Merchant ID from env:", merchantId, "Length:", merchantId?.length);
    
    if (!merchantId || merchantId.length < 36) {
      console.error("ZARINPAL_MERCHANT_ID not configured or invalid. Value:", merchantId);
      return new Response(
        JSON.stringify({ error: "Payment configuration error - invalid merchant ID" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract and validate JWT token
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("Missing or invalid authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized - missing authentication token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    
    // Create Supabase client to verify token and get user
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Use anon key client to verify the user's token
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });
    
    // Get the authenticated user from the token
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    
    if (authError || !user) {
      console.error("Invalid token or user not found:", authError);
      return new Response(
        JSON.stringify({ error: "Unauthorized - invalid authentication token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use the authenticated user's ID - NOT from request body
    const authenticatedUserId = user.id;
    console.log("Authenticated user ID:", authenticatedUserId);

    const { amount, description, mobile, callback_url, order_data }: PaymentRequest = await req.json();

    console.log("Payment request received:", { amount, description, mobile, userId: authenticatedUserId });

    // Validate required fields
    if (!amount || !callback_url || !order_data) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with service role for database operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate a secure verification token for callback validation
    const verificationToken = generateVerificationToken();

    // Store pending order data using the authenticated user's ID
    const { data: pendingOrder, error: pendingError } = await supabase
      .from("pending_payments")
      .insert({
        user_id: authenticatedUserId, // Use authenticated user ID, not from request
        amount: amount,
        shipping_address: order_data.shipping_address,
        items: order_data.items,
        coupon_id: order_data.coupon_id || null,
        status: "pending",
        verification_token: verificationToken
      })
      .select()
      .single();

    if (pendingError) {
      console.error("Error storing pending order:", pendingError);
      return new Response(
        JSON.stringify({ error: "Failed to store order data" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Call ZarinPal API
    const zarinpalResponse = await fetch(ZARINPAL_REQUEST_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        merchant_id: merchantId,
        amount: amount,
        description: description || "خرید از فروشگاه آنام",
        callback_url: `${callback_url}?pending_id=${pendingOrder.id}&token=${verificationToken}`,
        metadata: {
          mobile: mobile,
          order_id: pendingOrder.id,
        },
      }),
    });

    const zarinpalData = await zarinpalResponse.json();
    console.log("ZarinPal response:", zarinpalData);

    if (zarinpalData.data && zarinpalData.data.code === 100) {
      const authority = zarinpalData.data.authority;
      
      // Update pending order with authority
      await supabase
        .from("pending_payments")
        .update({ authority: authority })
        .eq("id", pendingOrder.id);

      const paymentUrl = `https://www.zarinpal.com/pg/StartPay/${authority}`;

      return new Response(
        JSON.stringify({ 
          success: true, 
          authority: authority,
          payment_url: paymentUrl 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      console.error("ZarinPal error:", zarinpalData);
      
      // Delete pending order on failure
      await supabase
        .from("pending_payments")
        .delete()
        .eq("id", pendingOrder.id);

      return new Response(
        JSON.stringify({ 
          error: "Payment request failed", 
          details: zarinpalData.errors || zarinpalData 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error: unknown) {
    console.error("Error in zarinpal-request:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});