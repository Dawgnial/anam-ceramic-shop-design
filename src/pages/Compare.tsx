import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useCompare } from "@/contexts/CompareContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, ChevronLeft, Scale } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Compare() {
  const { items, removeFromCompare, clearCompare } = useCompare();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Banner */}
      <div className="w-full h-[165px] flex items-center justify-center" style={{ backgroundColor: '#DDDDDD' }}>
        <h1 className="text-black text-4xl font-bold">مقایسه محصولات</h1>
      </div>

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <button onClick={() => navigate('/')} className="hover:text-foreground">
            خانه
          </button>
          <ChevronLeft className="w-4 h-4" />
          <span className="text-foreground font-medium">مقایسه محصولات</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 container mx-auto px-4 py-8">
        {items.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <div className="flex flex-col items-center justify-center space-y-6">
                <Scale className="w-24 h-24 text-muted-foreground" />
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold">لیست مقایسه خالی است</h2>
                  <p className="text-muted-foreground">
                    هیچ محصولی برای مقایسه اضافه نشده است
                  </p>
                  <Button 
                    onClick={() => navigate('/shop')}
                    style={{ backgroundColor: '#B3886D' }}
                  >
                    مشاهده محصولات
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {items.length.toLocaleString('fa-IR')} محصول در لیست مقایسه
              </h2>
              <Button
                variant="destructive"
                onClick={() => {
                  clearCompare();
                  toast.success('لیست مقایسه پاک شد');
                }}
              >
                پاک کردن همه
              </Button>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px]">ویژگی</TableHead>
                    {items.map((item) => (
                      <TableHead key={item.id} className="text-center min-w-[200px]">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="float-left"
                          onClick={() => {
                            removeFromCompare(item.id);
                            toast.success('محصول از لیست مقایسه حذف شد');
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">تصویر</TableCell>
                    {items.map((item) => (
                      <TableCell key={item.id} className="text-center">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-32 h-32 object-cover rounded mx-auto"
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">نام محصول</TableCell>
                    {items.map((item) => (
                      <TableCell key={item.id} className="text-center font-semibold">
                        {item.name}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">قیمت</TableCell>
                    {items.map((item) => (
                      <TableCell key={item.id} className="text-center">
                        <span className="text-lg font-bold" style={{ color: '#B3886D' }}>
                          {item.price.toLocaleString('fa-IR')} تومان
                        </span>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
