import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User, Lock, Phone, Calendar } from "lucide-react";

const Profile = () => {
  const { user, session, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [phone, setPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [createdAt, setCreatedAt] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setPhone(data.phone);
        setCreatedAt(new Date(data.created_at).toLocaleDateString('fa-IR'));
      }
    } catch (error: any) {
      toast({
        title: "خطا",
        description: "خطا در بارگذاری اطلاعات پروفایل",
        variant: "destructive",
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ phone })
        .eq('id', user?.id);

      if (error) throw error;

      toast({
        title: "موفق",
        description: "اطلاعات پروفایل با موفقیت به‌روزرسانی شد",
      });
      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: "خطا",
        description: error.message || "خطا در به‌روزرسانی پروفایل",
        variant: "destructive",
      });
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "خطا",
        description: "رمز عبور جدید و تکرار آن یکسان نیستند",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "خطا",
        description: "رمز عبور باید حداقل ۶ کاراکتر باشد",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: "موفق",
        description: "رمز عبور با موفقیت تغییر کرد",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({
        title: "خطا",
        description: error.message || "خطا در تغییر رمز عبور",
        variant: "destructive",
      });
    }
  };

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-lg">در حال بارگذاری...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <Header />
      
      {/* Banner */}
      <div className="w-full h-[165px] flex items-center justify-center" style={{ backgroundColor: '#DDDDDD' }}>
        <h1 className="text-4xl font-bold text-black">پروفایل کاربری</h1>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Profile Info Card */}
          <Card className="border-2" style={{ borderColor: '#B3886D' }}>
            <CardHeader className="border-b" style={{ borderColor: '#F9F3F0' }}>
              <CardTitle className="text-2xl flex items-center gap-2" style={{ color: '#896A59' }}>
                <User className="w-6 h-6" />
                اطلاعات کاربری
              </CardTitle>
              <CardDescription>مشاهده و ویرایش اطلاعات حساب کاربری</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium" style={{ color: '#896A59' }}>
                    <Phone className="w-4 h-4" />
                    شماره موبایل
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={!isEditing}
                      className="flex-1"
                    />
                    <div className="w-16 flex items-center justify-center border rounded-md bg-muted">
                      +۹۸
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium" style={{ color: '#896A59' }}>
                    <Calendar className="w-4 h-4" />
                    تاریخ عضویت
                  </label>
                  <Input
                    value={createdAt}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                {!isEditing ? (
                  <Button
                    onClick={() => setIsEditing(true)}
                    style={{ backgroundColor: '#B3886D' }}
                    className="text-white"
                  >
                    ویرایش اطلاعات
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={handleUpdateProfile}
                      style={{ backgroundColor: '#B3886D' }}
                      className="text-white"
                    >
                      ذخیره تغییرات
                    </Button>
                    <Button
                      onClick={() => {
                        setIsEditing(false);
                        loadProfile();
                      }}
                      variant="outline"
                    >
                      انصراف
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Change Password Card */}
          <Card className="border-2" style={{ borderColor: '#B3886D' }}>
            <CardHeader className="border-b" style={{ borderColor: '#F9F3F0' }}>
              <CardTitle className="text-2xl flex items-center gap-2" style={{ color: '#896A59' }}>
                <Lock className="w-6 h-6" />
                تغییر رمز عبور
              </CardTitle>
              <CardDescription>برای امنیت حساب خود، رمز عبور قوی انتخاب کنید</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              
              <div className="space-y-2">
                <label className="text-sm font-medium" style={{ color: '#896A59' }}>
                  رمز عبور جدید <span className="text-red-500">*</span>
                </label>
                <Input
                  type="password"
                  placeholder="حداقل ۶ کاراکتر"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" style={{ color: '#896A59' }}>
                  تکرار رمز عبور جدید <span className="text-red-500">*</span>
                </label>
                <Input
                  type="password"
                  placeholder="رمز عبور جدید را دوباره وارد کنید"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <Button
                onClick={handleChangePassword}
                disabled={!newPassword || !confirmPassword}
                style={{ backgroundColor: '#B3886D' }}
                className="text-white"
              >
                تغییر رمز عبور
              </Button>
            </CardContent>
          </Card>

        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Profile;