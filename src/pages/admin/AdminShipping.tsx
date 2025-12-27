import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Truck, Box, Save } from "lucide-react";
import { toPersianNumber } from "@/lib/utils";

interface ShippingSetting {
  id: string;
  setting_key: string;
  setting_value: number;
  description: string;
}

const AdminShipping = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<ShippingSetting[]>([]);

  // Form state
  const [regularFirstKg, setRegularFirstKg] = useState("");
  const [regularExtraKg, setRegularExtraKg] = useState("");
  const [snappboxFirstKg, setSnappboxFirstKg] = useState("");
  const [snappboxExtraKg, setSnappboxExtraKg] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("shipping_settings")
        .select("*");

      if (error) throw error;

      setSettings(data || []);

      // Set form values
      data?.forEach((setting) => {
        switch (setting.setting_key) {
          case "regular_first_kg":
            setRegularFirstKg(setting.setting_value.toString());
            break;
          case "regular_extra_kg":
            setRegularExtraKg(setting.setting_value.toString());
            break;
          case "snappbox_first_kg":
            setSnappboxFirstKg(setting.setting_value.toString());
            break;
          case "snappbox_extra_kg":
            setSnappboxExtraKg(setting.setting_value.toString());
            break;
        }
      });
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast({
        title: "خطا",
        description: "خطا در دریافت تنظیمات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = [
        { key: "regular_first_kg", value: parseInt(regularFirstKg) || 0 },
        { key: "regular_extra_kg", value: parseInt(regularExtraKg) || 0 },
        { key: "snappbox_first_kg", value: parseInt(snappboxFirstKg) || 0 },
        { key: "snappbox_extra_kg", value: parseInt(snappboxExtraKg) || 0 },
      ];

      for (const update of updates) {
        const { error } = await supabase
          .from("shipping_settings")
          .update({ setting_value: update.value })
          .eq("setting_key", update.key);

        if (error) throw error;
      }

      toast({
        title: "ذخیره شد",
        description: "تنظیمات هزینه ارسال با موفقیت ذخیره شد",
      });

      fetchSettings();
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "خطا",
        description: "خطا در ذخیره تنظیمات",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">مدیریت هزینه ارسال</h1>
          <p className="text-muted-foreground mt-2">
            تنظیم هزینه‌های ارسال بر اساس وزن
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Regular Shipping */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                ارسال پستی
              </CardTitle>
              <CardDescription>
                هزینه ارسال با پست برای تمام شهرها
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="regularFirstKg">هزینه کیلو اول (تومان)</Label>
                <Input
                  id="regularFirstKg"
                  type="number"
                  value={regularFirstKg}
                  onChange={(e) => setRegularFirstKg(e.target.value)}
                  placeholder="80000"
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  مقدار فعلی: {toPersianNumber(parseInt(regularFirstKg) || 0)} تومان
                </p>
              </div>
              <div>
                <Label htmlFor="regularExtraKg">هزینه هر کیلو اضافی (تومان)</Label>
                <Input
                  id="regularExtraKg"
                  type="number"
                  value={regularExtraKg}
                  onChange={(e) => setRegularExtraKg(e.target.value)}
                  placeholder="40000"
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  مقدار فعلی: {toPersianNumber(parseInt(regularExtraKg) || 0)} تومان
                </p>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 mt-4">
                <p className="text-sm font-medium mb-2">نمونه محاسبه:</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• ۱ کیلو: {toPersianNumber(parseInt(regularFirstKg) || 0)} تومان</li>
                  <li>• ۲ کیلو: {toPersianNumber((parseInt(regularFirstKg) || 0) + (parseInt(regularExtraKg) || 0))} تومان</li>
                  <li>• ۳ کیلو: {toPersianNumber((parseInt(regularFirstKg) || 0) + 2 * (parseInt(regularExtraKg) || 0))} تومان</li>
                  <li>• ۵ کیلو: {toPersianNumber((parseInt(regularFirstKg) || 0) + 4 * (parseInt(regularExtraKg) || 0))} تومان</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Snapp Box Shipping */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Box className="h-5 w-5" />
                اسنپ باکس (مشهد)
              </CardTitle>
              <CardDescription>
                هزینه ارسال با اسنپ باکس فقط برای شهر مشهد
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="snappboxFirstKg">هزینه کیلو اول (تومان)</Label>
                <Input
                  id="snappboxFirstKg"
                  type="number"
                  value={snappboxFirstKg}
                  onChange={(e) => setSnappboxFirstKg(e.target.value)}
                  placeholder="40000"
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  مقدار فعلی: {toPersianNumber(parseInt(snappboxFirstKg) || 0)} تومان
                </p>
              </div>
              <div>
                <Label htmlFor="snappboxExtraKg">هزینه هر کیلو اضافی (تومان)</Label>
                <Input
                  id="snappboxExtraKg"
                  type="number"
                  value={snappboxExtraKg}
                  onChange={(e) => setSnappboxExtraKg(e.target.value)}
                  placeholder="5000"
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  مقدار فعلی: {toPersianNumber(parseInt(snappboxExtraKg) || 0)} تومان
                </p>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 mt-4">
                <p className="text-sm font-medium mb-2">نمونه محاسبه:</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• ۱ کیلو: {toPersianNumber(parseInt(snappboxFirstKg) || 0)} تومان</li>
                  <li>• ۲ کیلو: {toPersianNumber((parseInt(snappboxFirstKg) || 0) + (parseInt(snappboxExtraKg) || 0))} تومان</li>
                  <li>• ۳ کیلو: {toPersianNumber((parseInt(snappboxFirstKg) || 0) + 2 * (parseInt(snappboxExtraKg) || 0))} تومان</li>
                  <li>• ۵ کیلو: {toPersianNumber((parseInt(snappboxFirstKg) || 0) + 4 * (parseInt(snappboxExtraKg) || 0))} تومان</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving}
            style={{ backgroundColor: '#B3886D' }}
            className="text-white"
          >
            {saving ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                در حال ذخیره...
              </>
            ) : (
              <>
                <Save className="ml-2 h-4 w-4" />
                ذخیره تنظیمات
              </>
            )}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminShipping;
