import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const Admin = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Banner */}
      <div className="w-full h-[165px] flex items-center justify-center" style={{ backgroundColor: '#DDDDDD' }}>
        <h1 className="text-black text-4xl font-bold">پنل مدیریت</h1>
      </div>

      {/* Content */}
      <div className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">
            به پنل مدیریت خوش آمدید
          </h2>
          <p className="text-center text-muted-foreground">
            این صفحه در حال توسعه است...
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Admin;