import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import { AdminSidebar } from "./AdminSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate("/");
    }
  }, [isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#B3886D' }}></div>
          <p>در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen flex w-full" dir="rtl">
      {/* Desktop Sidebar - Fixed 20% width */}
      <aside className="hidden lg:block w-[20%] min-w-[220px] border-l bg-background sticky top-0 h-screen overflow-y-auto">
        <AdminSidebar />
      </aside>

      {/* Main Content - 80% width on desktop */}
      <div className="flex-1 lg:w-[80%] flex flex-col">
        {/* Mobile Header with Menu Toggle */}
        <header className="h-14 sm:h-16 border-b flex items-center justify-between px-3 sm:px-4 bg-background sticky top-0 z-10 lg:justify-start">
          <h1 className="text-base sm:text-xl font-bold" style={{ color: '#B3886D' }}>
            پنل مدیریت آنام
          </h1>
          
          {/* Mobile Menu Toggle */}
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="outline" size="icon" className="h-10 w-10">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85%] max-w-[320px] p-0 flex flex-col h-full overflow-hidden">
              <div className="flex-1 overflow-hidden">
                <AdminSidebar />
              </div>
            </SheetContent>
          </Sheet>
        </header>

        <main className="flex-1 p-3 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
