import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

// Validation schemas
const phoneSchema = z.string().regex(/^09\d{9}$/, 'شماره موبایل باید با 09 شروع شود و 11 رقم باشد');
const passwordSchema = z.string().min(8, 'رمز عبور باید حداقل ۸ کاراکتر باشد');

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [captcha, setCaptcha] = useState({ num1: 0, num2: 0, answer: 0, operation: 'add' as 'add' | 'subtract' });
  const [userAnswer, setUserAnswer] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const { signUp, signIn, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    generateCaptcha();
    
    // Redirect if already logged in
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operation = Math.random() > 0.5 ? 'add' : 'subtract' as 'add' | 'subtract';
    const answer = operation === 'add' ? num1 + num2 : num1 - num2;
    setCaptcha({ num1, num2, answer, operation });
  };

  const validatePhone = (value: string) => {
    const result = phoneSchema.safeParse(value);
    if (!result.success) {
      setPhoneError(result.error.errors[0].message);
      return false;
    }
    setPhoneError("");
    return true;
  };

  const validatePassword = (value: string) => {
    const result = passwordSchema.safeParse(value);
    if (!result.success) {
      setPasswordError(result.error.errors[0].message);
      return false;
    }
    setPasswordError("");
    return true;
  };

  const handleSubmit = async () => {
    // Validate captcha
    if (parseInt(userAnswer) !== captcha.answer) {
      toast({
        title: "خطا",
        description: "پاسخ کپچا صحیح نیست",
        variant: "destructive",
      });
      generateCaptcha();
      setUserAnswer("");
      return;
    }

    // Validate phone and password
    const isPhoneValid = validatePhone(phone);
    const isPasswordValid = validatePassword(password);

    if (!isPhoneValid || !isPasswordValid) {
      toast({
        title: "خطا",
        description: "لطفا خطاهای فرم را برطرف کنید",
        variant: "destructive",
      });
      return;
    }

    if (isSignUp) {
      const { error } = await signUp(phone, password);
      if (error) {
        toast({
          title: "خطا در ثبت نام",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "موفق",
          description: "ثبت نام با موفقیت انجام شد",
        });
      }
    } else {
      const { error } = await signIn(phone, password);
      if (error) {
        toast({
          title: "خطا در ورود",
          description: "شماره موبایل یا رمز عبور اشتباه است",
          variant: "destructive",
        });
      } else {
        toast({
          title: "موفق",
          description: "ورود با موفقیت انجام شد",
        });
      }
    }
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
          {/* Login/Register Section - Left */}
          <div className="border-l border-gray-300 pl-8">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-center">{isSignUp ? "ثبت نام" : "ورود"}</h2>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  شماره موبایل <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <Input 
                    type="tel" 
                    placeholder="09123456789"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (phoneError) validatePhone(e.target.value);
                    }}
                    onBlur={() => validatePhone(phone)}
                    className={`flex-1 ${phoneError ? 'border-red-500' : ''}`}
                  />
                  <div className="w-16 flex items-center justify-center border rounded-md bg-muted">
                    +۹۸
                  </div>
                </div>
                {phoneError && <p className="text-red-500 text-xs">{phoneError}</p>}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  رمز عبور <span className="text-red-500">*</span>
                </label>
                <Input 
                  type="password" 
                  placeholder="رمز عبور خود را وارد کنید (حداقل ۸ کاراکتر)"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) validatePassword(e.target.value);
                  }}
                  onBlur={() => validatePassword(password)}
                  className={passwordError ? 'border-red-500' : ''}
                />
                {passwordError && <p className="text-red-500 text-xs">{passwordError}</p>}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  لطفا پاسخ را به عدد انگلیسی وارد کنید:
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">
                    {captcha.num1} {captcha.operation === 'add' ? '+' : '-'} {captcha.num2} =
                  </span>
                  <Input 
                    type="number" 
                    className="w-24" 
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="؟"
                  />
                </div>
              </div>

              {!isSignUp && (
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
              )}

              {isSignUp && (
                <p className="text-sm text-muted-foreground text-center leading-relaxed">
                  از داده های شخصی شما برای پشتیبانی از تجربه شما در سراسر این وب سایت ، مدیریت دسترسی به حساب کاربری خود ، و اهداف دیگری که در سیاست حفظ حریم خصوصی ما شرح داده می شود ، استفاده می شود.
                </p>
              )}

              <Button 
                className="w-full text-white"
                style={{ backgroundColor: '#B3886D' }}
                onClick={handleSubmit}
              >
                {isSignUp ? "ثبت نام" : "ورود با رمز عبور"}
              </Button>

              {isSignUp && (
                <div className="text-center text-muted-foreground text-sm">
                  دیدن که در سیاست حفظ حریم خصوصی ما سرح داده می شود ، استفاده می شود.
                </div>
              )}
            </div>
          </div>

          {/* Register Info Section - Right */}
          <div className="pr-8">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-center">ثبت نام</h2>
              
              <p className="text-center text-muted-foreground leading-relaxed">
                ثبت نام در این سایت به شما امکان می دهد تا به وضعیت سفارش و تاریخ سفارش خود دسترسی پیدا کنید. فقط فیلدهای زیر را پر کنید ، و بدون هیچ وقت حساب جدیدی را برای شما ایجاد خواهیم کرد. ما فقط از شما اطلاعات لازم را می خواهیم تا سریع تر و آسان تر روند خرید را انجام دهید.
              </p>

              <div className="flex justify-center">
                <Button 
                  className="rounded-full px-8 py-2 h-auto"
                  style={{ backgroundColor: '#EFEFEF', color: '#000' }}
                  onClick={() => setIsSignUp(!isSignUp)}
                >
                  {isSignUp ? "ورود" : "عضویت"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Auth;
