import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext";
import { CompareProvider } from "./contexts/CompareContext";
import { WishlistProvider } from "./contexts/WishlistContext";
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import AboutUs from "./pages/AboutUs";
import Wishlist from "./pages/Wishlist";
import Compare from "./pages/Compare";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminBlog from "./pages/admin/AdminBlog";
import AdminCoupons from "./pages/admin/AdminCoupons";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminInventory from "./pages/admin/AdminInventory";
import StoreRules from "./pages/StoreRules";
import ContactUs from "./pages/ContactUs";
import Profile from "./pages/Profile";
import PaymentCallback from "./pages/PaymentCallback";
import FAQ from "./pages/FAQ";
import BuyingGuide from "./pages/BuyingGuide";
import ShippingMethod from "./pages/ShippingMethod";
import SizeGuide from "./pages/SizeGuide";
import Returns from "./pages/Returns";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();
// Providers wrapped: Auth > Compare > Wishlist > Cart

const App = () => (
  <HelmetProvider>
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
                    <Route path="/product/:slug" element={<ProductDetail />} />
                    <Route path="/about" element={<AboutUs />} />
                    <Route path="/wishlist" element={<Wishlist />} />
                    <Route path="/compare" element={<Compare />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/blog/:slug" element={<BlogPost />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/admin/products" element={<AdminProducts />} />
                    <Route path="/admin/categories" element={<AdminCategories />} />
                    <Route path="/admin/orders" element={<AdminOrders />} />
                    <Route path="/admin/customers" element={<AdminCustomers />} />
                    <Route path="/admin/blog" element={<AdminBlog />} />
                    <Route path="/admin/coupons" element={<AdminCoupons />} />
                    <Route path="/admin/reviews" element={<AdminReviews />} />
                    <Route path="/admin/inventory" element={<AdminInventory />} />
                    <Route path="/store-rules" element={<StoreRules />} />
                    <Route path="/contact" element={<ContactUs />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/payment/callback" element={<PaymentCallback />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/buying-guide" element={<BuyingGuide />} />
                    <Route path="/shipping-method" element={<ShippingMethod />} />
                    <Route path="/size-guide" element={<SizeGuide />} />
                    <Route path="/returns" element={<Returns />} />
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
  </HelmetProvider>
);

export default App;
