import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

const Auth = () => {
  const [captcha, setCaptcha] = useState({ num1: 0, num2: 0, answer: 0 });
  const [userAnswer, setUserAnswer] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    generateCaptcha();
  }, []);

  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10);
    const num2 = Math.floor(Math.random() * 10);
    const operation = Math.random() > 0.5 ? 'add' : 'subtract';
    const answer = operation === 'add' ? num1 + num2 : num1 - num2;
    setCaptcha({ num1, num2, answer });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Banner */}
      <div className="w-full h-[165px] flex items-center justify-center" style={{ backgroundColor: '#DDDDDD' }}>
        <h1 className="text-black text-4xl font-bold">حساب کاربری من</h1>
      </div>

      {/* Content */}
      <div className="flex-1 container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Login Section - Left */}
          <div className="border-l border-gray-300 pl-8">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-center">ورود</h2>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  شماره موبایل <span className="text-red-500">*</span>
                </label>
                <Input type="tel" placeholder="شماره موبایل خود را وارد کنید" />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  لطفا پاسخ را به عدد انگلیسی وارد کنید:
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {captcha.num1} {captcha.num1 >= captcha.num2 ? '-' : '+'} {captcha.num2} =
                  </span>
                  <Input 
                    type="text" 
                    className="w-24" 
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox 
                  id="remember" 
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <label htmlFor="remember" className="text-sm cursor-pointer">
                  مرا به خاطر بسپار
                </label>
              </div>

              <Button 
                className="w-full text-white"
                style={{ backgroundColor: '#B3886D' }}
              >
                ورود با رمز عبور
              </Button>
            </div>
          </div>

          {/* Register Section - Right */}
          <div className="pr-8">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-center">ثبت نام</h2>
              
              <p className="text-center text-muted-foreground leading-relaxed">
                ثبت نام در این سایت به شما امکان می دهد تا به وضعیت سفارش و تاریخ سفارش خود دسترسی پیدا کنید. فقط فیلدهای زیر را پر کنید ، و بدون هیچ وقت حساب جدیدی را برای شما ایجاد خواهیم کرد. ما فقط از شما اطلاعات لازم را می خواهیم تا سریع تر و آسان تر روند خرید را انجام دهید.
              </p>

              <Button 
                className="w-full text-white"
                style={{ backgroundColor: '#B3886D' }}
              >
                عضویت
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Auth;
