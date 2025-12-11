import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ZARINPAL_MERCHANT_ID = "00873a04-6ad1-4af4-9a0f-2f26909a0132";
const ZARINPAL_REQUEST_URL = "https://api.zarinpal.com/pg/v4/payment/request.json";

interface PaymentRequest {
  amount: number;
  description: string;
  mobile: string;
  callback_url: string;
  order_data: {
    user_id: string;
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
    const { amount, description, mobile, callback_url, order_data }: PaymentRequest = await req.json();

    console.log("Payment request received:", { amount, description, mobile });

    // Validate required fields
    if (!amount || !callback_url || !order_data) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Store pending order data temporarily
    const { data: pendingOrder, error: pendingError } = await supabase
      .from("pending_payments")
      .insert({
        user_id: order_data.user_id,
        amount: amount,
        shipping_address: order_data.shipping_address,
        items: order_data.items,
        coupon_id: order_data.coupon_id || null,
        status: "pending"
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
        merchant_id: ZARINPAL_MERCHANT_ID,
        amount: amount,
        description: description || "خرید از فروشگاه آنام",
        callback_url: `${callback_url}?pending_id=${pendingOrder.id}`,
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
