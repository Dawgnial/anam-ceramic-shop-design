import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminCategories() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold">مدیریت دسته‌بندی‌ها</h2>
          <p className="text-muted-foreground mt-2">
            افزودن، ویرایش و حذف دسته‌بندی‌ها
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>دسته‌بندی‌ها</CardTitle>
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
