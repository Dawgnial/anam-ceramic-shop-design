import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { toPersianNumber } from "@/lib/utils";

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
  const [refId, setRefId] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const verifyPayment = async () => {
      const authority = searchParams.get("Authority");
      const paymentStatus = searchParams.get("Status");
      const pendingId = searchParams.get("pending_id");
      const verificationToken = searchParams.get("token");

      console.log("Payment callback params:", { authority, paymentStatus, pendingId, hasToken: !!verificationToken });

      if (paymentStatus !== "OK") {
        setStatus("failed");
        setErrorMessage("پرداخت توسط کاربر لغو شد");
        return;
      }

      if (!authority || !pendingId || !verificationToken) {
        setStatus("failed");
        setErrorMessage("اطلاعات پرداخت نامعتبر است");
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke("zarinpal-verify", {
          body: { authority, pending_id: pendingId, token: verificationToken },
        });

        console.log("Verify response:", data, error);

        if (error) {
          setStatus("failed");
          setErrorMessage("خطا در تأیید پرداخت");
          return;
        }

        if (data.success) {
          setStatus("success");
          setRefId(data.ref_id?.toString() || null);
          setOrderId(data.order_id || null);
          clearCart();
        } else {
          setStatus("failed");
          setErrorMessage(data.error || "پرداخت ناموفق بود");
        }
      } catch (err) {
        console.error("Error verifying payment:", err);
        setStatus("failed");
        setErrorMessage("خطا در ارتباط با سرور");
      }
    };

    verifyPayment();
  }, [searchParams, clearCart]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto text-center">
          {status === "loading" && (
            <div className="space-y-4">
              <Loader2 className="h-16 w-16 animate-spin mx-auto text-primary" style={{ color: '#B3886D' }} />
              <h2 className="text-2xl font-bold">در حال بررسی پرداخت...</h2>
              <p className="text-muted-foreground">لطفاً صبر کنید</p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-6">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-green-600">پرداخت موفق</h2>
              <p className="text-muted-foreground">سفارش شما با موفقیت ثبت شد</p>
              
              {refId && (
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">کد پیگیری:</p>
                  <p className="text-xl font-bold" dir="ltr">{toPersianNumber(refId)}</p>
                </div>
              )}

              <div className="flex gap-4 justify-center pt-4">
                <Button
                  onClick={() => navigate("/profile")}
                  style={{ backgroundColor: '#B3886D' }}
                  className="text-white"
                >
                  مشاهده سفارشات
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/")}
                >
                  بازگشت به صفحه اصلی
                </Button>
              </div>
            </div>
          )}

          {status === "failed" && (
            <div className="space-y-6">
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
                <XCircle className="h-12 w-12 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-red-600">پرداخت ناموفق</h2>
              <p className="text-muted-foreground">{errorMessage}</p>

              <div className="flex gap-4 justify-center pt-4">
                <Button
                  onClick={() => navigate("/checkout")}
                  style={{ backgroundColor: '#B3886D' }}
                  className="text-white"
                >
                  تلاش مجدد
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/cart")}
                >
                  بازگشت به سبد خرید
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PaymentCallback;
