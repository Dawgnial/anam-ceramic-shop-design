import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminProducts() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold">مدیریت محصولات</h2>
          <p className="text-muted-foreground mt-2">
            افزودن، ویرایش و حذف محصولات
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>محصولات</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              این بخش در حال توسعه است...
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
