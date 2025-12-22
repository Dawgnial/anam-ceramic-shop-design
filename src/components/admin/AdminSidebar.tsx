import { Home, Package, FolderTree, ShoppingCart, FileText, Users, Tag, MessageSquare, Warehouse, Truck, LayoutDashboard } from "lucide-react";
import { NavLink } from "@/components/NavLink";

const items = [
  { title: "داشبورد", url: "/admin", icon: LayoutDashboard },
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
    <div className="h-full py-4 sm:py-6 px-2 sm:px-4">
      {/* Header */}
      <div className="mb-6 sm:mb-8 px-2 sm:px-4">
        <h2 className="text-base sm:text-lg font-bold" style={{ color: '#B3886D' }}>
          پنل مدیریت
        </h2>
        <p className="text-xs text-muted-foreground mt-1 hidden sm:block">
          مدیریت فروشگاه آنام
        </p>
      </div>

      {/* Navigation */}
      <nav className="space-y-1 sm:space-y-2">
        {items.map((item) => (
          <NavLink
            key={item.title}
            to={item.url}
            end={item.url === "/admin"}
            className="flex items-center gap-3 sm:gap-3 px-3 sm:px-4 py-3 sm:py-3 rounded-xl sm:rounded-lg transition-all hover:bg-muted/50 group"
            activeClassName="bg-[#B3886D]/10 font-medium border-r-4 border-[#B3886D]"
            style={{ color: '#896A59' }}
          >
            <div className="flex items-center justify-center w-10 h-10 sm:w-auto sm:h-auto rounded-lg bg-muted/30 sm:bg-transparent group-hover:bg-[#B3886D]/10 transition-colors">
              <item.icon className="h-6 w-6 sm:h-5 sm:w-5" />
            </div>
            <span className="text-sm sm:text-base font-medium">{item.title}</span>
          </NavLink>
        ))}
      </nav>

      {/* Quick Link to Site */}
      <div className="mt-6 sm:mt-8 px-2 sm:px-4">
        <NavLink
          to="/"
          className="flex items-center gap-3 px-3 sm:px-4 py-3 rounded-xl sm:rounded-lg border border-dashed border-muted-foreground/30 text-muted-foreground hover:bg-muted/50 transition-all"
        >
          <div className="flex items-center justify-center w-10 h-10 sm:w-auto sm:h-auto rounded-lg bg-muted/30 sm:bg-transparent">
            <Home className="h-6 w-6 sm:h-5 sm:w-5" />
          </div>
          <span className="text-sm sm:text-base">بازگشت به سایت</span>
        </NavLink>
      </div>
    </div>
  );
}
