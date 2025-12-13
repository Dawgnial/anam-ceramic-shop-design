import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ZARINPAL_VERIFY_URL = "https://api.zarinpal.com/pg/v4/payment/verify.json";

interface VerifyRequest {
  authority: string;
  pending_id: string;
  token: string;
}

// Constant-time string comparison to prevent timing attacks
function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get merchant ID from environment variable
    const merchantId = Deno.env.get("ZARINPAL_MERCHANT_ID");
    if (!merchantId) {
      console.error("ZARINPAL_MERCHANT_ID not configured");
      return new Response(
        JSON.stringify({ error: "Payment configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { authority, pending_id, token }: VerifyRequest = await req.json();

    console.log("Verify request received:", { authority, pending_id, hasToken: !!token });

    if (!authority || !pending_id || !token) {
      return new Response(
        JSON.stringify({ error: "Missing authority, pending_id, or verification token" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get pending payment data
    const { data: pendingPayment, error: pendingError } = await supabase
      .from("pending_payments")
      .select("*")
      .eq("id", pending_id)
      .single();

    if (pendingError || !pendingPayment) {
      console.error("Pending payment not found:", pendingError);
      return new Response(
        JSON.stringify({ error: "Payment data not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // SECURITY: Verify the token matches the one stored in the database
    // This prevents attackers from guessing pending_id values
    if (!pendingPayment.verification_token || !secureCompare(token, pendingPayment.verification_token)) {
      console.error("Invalid verification token");
      return new Response(
        JSON.stringify({ error: "Invalid verification token" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Already processed?
    if (pendingPayment.status === "completed") {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Payment already verified",
          order_id: pendingPayment.order_id 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Call ZarinPal verify API
    const verifyResponse = await fetch(ZARINPAL_VERIFY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        merchant_id: merchantId,
        amount: pendingPayment.amount,
        authority: authority,
      }),
    });

    const verifyData = await verifyResponse.json();
    console.log("ZarinPal verify response:", verifyData);

    if (verifyData.data && (verifyData.data.code === 100 || verifyData.data.code === 101)) {
      const refId = verifyData.data.ref_id;

      // Create the actual order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: pendingPayment.user_id,
          shipping_address: pendingPayment.shipping_address,
          total_amount: pendingPayment.amount,
          status: "processing"
        })
        .select()
        .single();

      if (orderError) {
        console.error("Error creating order:", orderError);
        return new Response(
          JSON.stringify({ error: "Failed to create order" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Create order items
      const items = pendingPayment.items as Array<{
        product_name: string;
        product_image: string;
        quantity: number;
        price: number;
      }>;

      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_name: item.product_name,
        product_image: item.product_image,
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) {
        console.error("Error creating order items:", itemsError);
      }

      // Update coupon usage if applicable
      if (pendingPayment.coupon_id) {
        const { data: coupon } = await supabase
          .from("coupons")
          .select("used_count")
          .eq("id", pendingPayment.coupon_id)
          .single();

        if (coupon) {
          await supabase
            .from("coupons")
            .update({ used_count: (coupon.used_count || 0) + 1 })
            .eq("id", pendingPayment.coupon_id);
        }
      }

      // Update pending payment status and clear the verification token
      await supabase
        .from("pending_payments")
        .update({ 
          status: "completed", 
          order_id: order.id,
          ref_id: refId.toString(),
          verification_token: null // Clear token after successful verification
        })
        .eq("id", pending_id);

      return new Response(
        JSON.stringify({ 
          success: true, 
          ref_id: refId,
          order_id: order.id 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      // Payment failed
      await supabase
        .from("pending_payments")
        .update({ status: "failed", verification_token: null })
        .eq("id", pending_id);

      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Payment verification failed",
          code: verifyData.data?.code,
          details: verifyData.errors || verifyData 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error: unknown) {
    console.error("Error in zarinpal-verify:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});