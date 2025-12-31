import { useState } from "react";
import { Settings, Bell, Mail, Volume2, BellRing, Save, Loader2 } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface AdminSetting {
  id: string;
  setting_key: string;
  setting_value: string;
}

export default function AdminNotificationSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [adminEmail, setAdminEmail] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [browserEnabled, setBrowserEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [inappEnabled, setInappEnabled] = useState(true);

  // Fetch settings
  const { isLoading } = useQuery({
    queryKey: ['admin-notification-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*');

      if (error) throw error;
      
      const settings = data as AdminSetting[];
      
      settings.forEach((setting) => {
        switch (setting.setting_key) {
          case 'admin_email':
            setAdminEmail(setting.setting_value);
            break;
          case 'notification_sound':
            setSoundEnabled(setting.setting_value === 'true');
            break;
          case 'notification_browser':
            setBrowserEnabled(setting.setting_value === 'true');
            break;
          case 'notification_email':
            setEmailEnabled(setting.setting_value === 'true');
            break;
          case 'notification_inapp':
            setInappEnabled(setting.setting_value === 'true');
            break;
        }
      });
      
      return settings;
    },
  });

  // Save settings mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const updates = [
        { key: 'admin_email', value: adminEmail },
        { key: 'notification_sound', value: soundEnabled.toString() },
        { key: 'notification_browser', value: browserEnabled.toString() },
        { key: 'notification_email', value: emailEnabled.toString() },
        { key: 'notification_inapp', value: inappEnabled.toString() },
      ];

      for (const update of updates) {
        const { error } = await supabase
          .from('admin_settings')
          .update({ setting_value: update.value, updated_at: new Date().toISOString() })
          .eq('setting_key', update.key);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "تنظیمات ذخیره شد",
        description: "تنظیمات اعلان‌ها با موفقیت به‌روزرسانی شد.",
      });
      queryClient.invalidateQueries({ queryKey: ['admin-notification-settings'] });
    },
    onError: (error) => {
      toast({
        title: "خطا",
        description: "خطا در ذخیره تنظیمات: " + error.message,
        variant: "destructive",
      });
    },
  });

  // Test notification
  const testNotification = () => {
    // Play sound
    if (soundEnabled) {
      const audio = new Audio('/notification-sound.mp3');
      audio.volume = 0.5;
      audio.play().catch(console.error);
    }

    // Show toast
    if (inappEnabled) {
      toast({
        title: "🛒 تست نوتیفیکیشن!",
        description: "این یک نوتیفیکیشن آزمایشی است.",
        duration: 5000,
      });
    }

    // Show browser notification
    if (browserEnabled && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('🛒 تست نوتیفیکیشن!', {
          body: 'این یک نوتیفیکیشن آزمایشی است.',
          icon: '/favicon.png',
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            new Notification('🛒 تست نوتیفیکیشن!', {
              body: 'این یک نوتیفیکیشن آزمایشی است.',
              icon: '/favicon.png',
            });
          }
        });
      }
    }
  };

  // Request browser notification permission
  const requestPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toast({
          title: "دسترسی فعال شد",
          description: "نوتیفیکیشن مرورگر با موفقیت فعال شد.",
        });
      } else {
        toast({
          title: "دسترسی رد شد",
          description: "لطفاً دسترسی نوتیفیکیشن را در تنظیمات مرورگر فعال کنید.",
          variant: "destructive",
        });
      }
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#B3886D' }} />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold" style={{ color: '#B3886D' }}>
              تنظیمات اعلان‌ها
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base mt-1">
              مدیریت نحوه دریافت اعلان‌های سفارشات جدید
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button variant="outline" onClick={testNotification} className="w-full sm:w-auto">
              <BellRing className="h-4 w-4 ml-2" />
              تست نوتیفیکیشن
            </Button>
            <Button 
              onClick={() => saveMutation.mutate()} 
              disabled={saveMutation.isPending}
              style={{ backgroundColor: '#B3886D' }}
              className="w-full sm:w-auto"
            >
              {saveMutation.isPending ? (
                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 ml-2" />
              )}
              ذخیره تغییرات
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Email Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                ایمیل اطلاع‌رسانی
              </CardTitle>
              <CardDescription>
                ایمیلی که اعلان سفارشات به آن ارسال می‌شود
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="email-enabled">فعال‌سازی ایمیل</Label>
                <Switch
                  id="email-enabled"
                  checked={emailEnabled}
                  onCheckedChange={setEmailEnabled}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-email">آدرس ایمیل</Label>
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="admin@example.com"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  disabled={!emailEnabled}
                  dir="ltr"
                />
                <p className="text-xs text-muted-foreground">
                  برای ارسال ایمیل نیاز به تأیید دامنه در Resend دارید
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Sound Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="h-5 w-5" />
                صدای اعلان
              </CardTitle>
              <CardDescription>
                پخش صدا هنگام دریافت سفارش جدید
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="sound-enabled">فعال‌سازی صدا</Label>
                <Switch
                  id="sound-enabled"
                  checked={soundEnabled}
                  onCheckedChange={setSoundEnabled}
                />
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  const audio = new Audio('/notification-sound.mp3');
                  audio.volume = 0.5;
                  audio.play().catch(console.error);
                }}
                disabled={!soundEnabled}
              >
                <Volume2 className="h-4 w-4 ml-2" />
                پخش نمونه
              </Button>
            </CardContent>
          </Card>

          {/* Browser Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                نوتیفیکیشن مرورگر
              </CardTitle>
              <CardDescription>
                نمایش نوتیفیکیشن حتی وقتی تب دیگری باز است
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="browser-enabled">فعال‌سازی نوتیفیکیشن مرورگر</Label>
                <Switch
                  id="browser-enabled"
                  checked={browserEnabled}
                  onCheckedChange={setBrowserEnabled}
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">وضعیت:</span>
                {typeof window !== 'undefined' && 'Notification' in window ? (
                  <span className={`text-sm font-medium ${
                    Notification.permission === 'granted' 
                      ? 'text-green-600' 
                      : Notification.permission === 'denied'
                      ? 'text-red-600'
                      : 'text-yellow-600'
                  }`}>
                    {Notification.permission === 'granted' 
                      ? '✓ فعال' 
                      : Notification.permission === 'denied'
                      ? '✕ رد شده'
                      : '! نیاز به تأیید'}
                  </span>
                ) : (
                  <span className="text-sm text-red-600">پشتیبانی نمی‌شود</span>
                )}
              </div>
              {typeof window !== 'undefined' && 'Notification' in window && Notification.permission !== 'granted' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={requestPermission}
                  disabled={!browserEnabled}
                >
                  درخواست دسترسی
                </Button>
              )}
            </CardContent>
          </Card>

          {/* In-App Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                نوتیفیکیشن داخلی
              </CardTitle>
              <CardDescription>
                نمایش اعلان داخل سایت (Toast)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="inapp-enabled">فعال‌سازی نوتیفیکیشن داخلی</Label>
                <Switch
                  id="inapp-enabled"
                  checked={inappEnabled}
                  onCheckedChange={setInappEnabled}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                این نوتیفیکیشن فقط وقتی که پنل ادمین باز است نمایش داده می‌شود
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Info Card */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <BellRing className="h-8 w-8 text-muted-foreground flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-2">نحوه عملکرد سیستم اعلان</h3>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>هنگام ثبت سفارش جدید، صدای زنگ پخش می‌شود (در صورت فعال بودن)</li>
                  <li>نوتیفیکیشن داخلی در گوشه صفحه نمایش داده می‌شود</li>
                  <li>نوتیفیکیشن مرورگر حتی وقتی در تب دیگری هستید نمایش داده می‌شود</li>
                  <li>آیکون زنگ در هدر با تعداد اعلان‌های خوانده‌نشده به‌روز می‌شود</li>
                  <li>ایمیل با جزئیات سفارش به آدرس تنظیم‌شده ارسال می‌شود</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
