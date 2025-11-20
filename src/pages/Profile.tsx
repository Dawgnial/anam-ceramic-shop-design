import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User, Lock, Phone, Calendar, Package, ShoppingBag } from "lucide-react";
import { toPersianNumber } from "@/lib/utils";

type Order = {
  id: string;
  total_amount: number;
  status: string;
  shipping_address: string;
  created_at: string;
  items: OrderItem[];
};

type OrderItem = {
  id: string;
  product_name: string;
  product_image: string | null;
  quantity: number;
  price: number;
};

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
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      loadProfile();
      loadOrders();
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

  const loadOrders = async () => {
    try {
      setOrdersLoading(true);
      
      // Fetch orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Fetch order items for each order
      const ordersWithItems = await Promise.all(
        (ordersData || []).map(async (order) => {
          const { data: itemsData, error: itemsError } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', order.id);

          if (itemsError) throw itemsError;

          return {
            ...order,
            items: itemsData || []
          };
        })
      );

      setOrders(ordersWithItems);
    } catch (error: any) {
      toast({
        title: "خطا",
        description: "خطا در بارگذاری تاریخچه سفارشات",
        variant: "destructive",
      });
    } finally {
      setOrdersLoading(false);
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: 'در انتظار پرداخت',
      processing: 'در حال پردازش',
      shipped: 'ارسال شده',
      delivered: 'تحویل داده شده',
      cancelled: 'لغو شده'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      pending: '#F59E0B',
      processing: '#3B82F6',
      shipped: '#8B5CF6',
      delivered: '#10B981',
      cancelled: '#EF4444'
    };
    return colorMap[status] || '#6B7280';
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
        <div className="max-w-4xl mx-auto">
          
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile">اطلاعات کاربری</TabsTrigger>
              <TabsTrigger value="orders">تاریخچه سفارشات</TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
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
            </TabsContent>

            {/* Orders History Tab */}
            <TabsContent value="orders">
              <Card className="border-2" style={{ borderColor: '#B3886D' }}>
                <CardHeader className="border-b" style={{ borderColor: '#F9F3F0' }}>
                  <CardTitle className="text-2xl flex items-center gap-2" style={{ color: '#896A59' }}>
                    <Package className="w-6 h-6" />
                    تاریخچه سفارشات
                  </CardTitle>
                  <CardDescription>لیست سفارشات و وضعیت آنها</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {ordersLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-pulse text-lg">در حال بارگذاری...</div>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-12">
                      <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium mb-2">هنوز سفارشی ثبت نکرده‌اید</h3>
                      <p className="text-muted-foreground mb-4">با خرید از فروشگاه، تاریخچه سفارشات شما اینجا نمایش داده می‌شود</p>
                      <Button
                        onClick={() => navigate('/shop')}
                        style={{ backgroundColor: '#B3886D' }}
                        className="text-white"
                      >
                        مشاهده محصولات
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div
                          key={order.id}
                          className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                          style={{ borderColor: '#B3886D' }}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">
                                شماره سفارش: <span className="font-mono">{order.id.slice(0, 8)}</span>
                              </p>
                              <p className="text-sm text-muted-foreground">
                                تاریخ: {new Date(order.created_at).toLocaleDateString('fa-IR')}
                              </p>
                            </div>
                            <div
                              className="px-3 py-1 rounded-full text-sm font-medium text-white"
                              style={{ backgroundColor: getStatusColor(order.status) }}
                            >
                              {getStatusText(order.status)}
                            </div>
                          </div>

                          {/* Order Items */}
                          <div className="space-y-2 mb-4">
                            {order.items.map((item) => (
                              <div key={item.id} className="flex items-center gap-3 p-2 bg-muted/50 rounded">
                                {item.product_image && (
                                  <img
                                    src={item.product_image}
                                    alt={item.product_name}
                                    className="w-12 h-12 object-cover rounded"
                                  />
                                )}
                                <div className="flex-1">
                                  <p className="font-medium text-sm">{item.product_name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    تعداد: {toPersianNumber(item.quantity)} × {toPersianNumber(item.price)} تومان
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Order Total */}
                          <div className="flex items-center justify-between pt-4 border-t">
                            <span className="text-sm font-medium">مجموع:</span>
                            <span className="text-lg font-bold" style={{ color: '#896A59' }}>
                              {toPersianNumber(order.total_amount)} تومان
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Profile;