import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface OrderNotificationRequest {
  orderId: string;
  totalAmount: number;
  customerPhone: string;
  shippingAddress: string;
  adminEmail: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication - require valid user session
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      console.error("Missing authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized - missing authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate the user's JWT token
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      console.error("Authentication failed:", authError);
      return new Response(
        JSON.stringify({ error: "Unauthorized - invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Authenticated user:", user.id);

    const { orderId, totalAmount, customerPhone, shippingAddress, adminEmail }: OrderNotificationRequest = await req.json();

    console.log("Sending order notification email to:", adminEmail);
    console.log("Order details:", { orderId, totalAmount, customerPhone });

    // Create notification record in database using service role
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const formattedAmount = new Intl.NumberFormat('fa-IR').format(totalAmount);

    await supabase.from("admin_notifications").insert({
      type: "order",
      title: "سفارش جدید",
      message: `سفارش جدید به مبلغ ${formattedAmount} تومان ثبت شد`,
      order_id: orderId,
    });

    if (!adminEmail) {
      console.log("No admin email configured, skipping email notification");
      return new Response(JSON.stringify({ message: "No admin email configured, notification saved" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!RESEND_API_KEY) {
      console.log("No Resend API key configured");
      return new Response(JSON.stringify({ message: "No Resend API key configured" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const orderDate = new Date().toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    // Send email using Resend API directly
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "سفارشات <onboarding@resend.dev>",
        to: [adminEmail],
        subject: `🛒 سفارش جدید - ${formattedAmount} تومان`,
        html: `
          <!DOCTYPE html>
          <html dir="rtl" lang="fa">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: 'Tahoma', 'Arial', sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #B3886D 0%, #896A59 100%); padding: 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">🛒 سفارش جدید دریافت شد!</h1>
              </div>
              
              <!-- Content -->
              <div style="padding: 30px;">
                <div style="background-color: #fdf8f6; border: 1px solid #e8d5cc; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                  <h2 style="color: #896A59; margin: 0 0 10px 0; font-size: 32px; text-align: center;">
                    ${formattedAmount} تومان
                  </h2>
                  <p style="color: #B3886D; margin: 0; text-align: center; font-size: 14px;">مبلغ کل سفارش</p>
                </div>
                
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                      <strong style="color: #374151;">شماره سفارش:</strong>
                    </td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: left; direction: ltr;">
                      <code style="background-color: #f3f4f6; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${orderId.slice(0, 8)}...</code>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                      <strong style="color: #374151;">شماره مشتری:</strong>
                    </td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: left; direction: ltr;">
                      ${customerPhone}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                      <strong style="color: #374151;">تاریخ ثبت:</strong>
                    </td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: left;">
                      ${orderDate}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0;" colspan="2">
                      <strong style="color: #374151;">آدرس ارسال:</strong>
                      <p style="margin: 8px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                        ${shippingAddress}
                      </p>
                    </td>
                  </tr>
                </table>
                
                <div style="margin-top: 30px; text-align: center;">
                  <a href="https://lpwtihfypaajwymgbkko.lovable.app/admin/orders" 
                     style="display: inline-block; background: linear-gradient(135deg, #B3886D 0%, #896A59 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                    مشاهده در پنل مدیریت
                  </a>
                </div>
              </div>
              
              <!-- Footer -->
              <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                  این ایمیل به صورت خودکار ارسال شده است.
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
      }),
    });

    const emailResult = await emailResponse.json();
    console.log("Email sent successfully:", emailResult);

    return new Response(JSON.stringify({ success: true, emailResult }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-order-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
