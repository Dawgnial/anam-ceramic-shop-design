import { Home, Package, FolderTree, ShoppingCart, FileText, Users } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "خانه", url: "/", icon: Home },
  { title: "محصولات", url: "/admin/products", icon: Package },
  { title: "دسته‌بندی‌ها", url: "/admin/categories", icon: FolderTree },
  { title: "سفارشات", url: "/admin/orders", icon: ShoppingCart },
  { title: "بلاگ", url: "/admin/blog", icon: FileText },
  { title: "مشتریان", url: "/admin/customers", icon: Users },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon">
      <SidebarTrigger className="m-2 self-end" />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>پنل مدیریت</SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="hover:bg-muted/50"
                      activeClassName="bg-muted font-medium"
                      style={{ color: '#B3886D' }}
                    >
                      <item.icon className="ml-2 h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
