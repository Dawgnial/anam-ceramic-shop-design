import { Home, Package, FolderTree, ShoppingCart, FileText, Users, Tag, MessageSquare, Warehouse, Truck } from "lucide-react";
import { NavLink } from "@/components/NavLink";

const items = [
  { title: "خانه", url: "/", icon: Home },
  { title: "محصولات", url: "/admin/products", icon: Package },
  { title: "موجودی انبار", url: "/admin/inventory", icon: Warehouse },
  { title: "دسته‌بندی‌ها", url: "/admin/categories", icon: FolderTree },
  { title: "سفارشات", url: "/admin/orders", icon: ShoppingCart },
  { title: "هزینه ارسال", url: "/admin/shipping", icon: Truck },
  { title: "نظرات", url: "/admin/reviews", icon: MessageSquare },
  { title: "کوپن‌های تخفیف", url: "/admin/coupons", icon: Tag },
  { title: "بلاگ", url: "/admin/blog", icon: FileText },
  { title: "مشتریان", url: "/admin/customers", icon: Users },
];

export function AdminSidebar() {
  return (
    <div className="h-full py-6 px-4">
      <div className="mb-8">
        <h2 className="text-lg font-bold px-4" style={{ color: '#B3886D' }}>پنل مدیریت</h2>
      </div>

      <nav className="space-y-2">
        {items.map((item) => (
          <NavLink
            key={item.title}
            to={item.url}
            end={item.url === "/"}
            className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-muted/50"
            activeClassName="bg-muted font-medium"
            style={{ color: '#B3886D' }}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.title}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
