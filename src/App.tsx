import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext";
import { CompareProvider } from "./contexts/CompareContext";
import { WishlistProvider } from "./contexts/WishlistContext";
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import AboutUs from "./pages/AboutUs";
import Wishlist from "./pages/Wishlist";
import Compare from "./pages/Compare";
import Cart from "./pages/Cart";
import Blog from "./pages/Blog";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import StoreRules from "./pages/StoreRules";
import ContactUs from "./pages/ContactUs";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();
// Providers wrapped: Auth > Compare > Wishlist > Cart

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <CompareProvider>
          <WishlistProvider>
            <CartProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/about" element={<AboutUs />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/compare" element={<Compare />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/store-rules" element={<StoreRules />} />
                  <Route path="/contact" element={<ContactUs />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </TooltipProvider>
            </CartProvider>
          </WishlistProvider>
        </CompareProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
