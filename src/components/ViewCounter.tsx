import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Eye } from "lucide-react";
import { toPersianNumber } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface ViewCounterProps {
  productId: string;
  viewCount: number;
}

export function ViewCounter({ productId, viewCount }: ViewCounterProps) {
  const { user } = useAuth();

  useEffect(() => {
    const trackView = async () => {
      // Generate a session ID for anonymous users
      let sessionId = localStorage.getItem('session_id');
      if (!sessionId) {
        sessionId = crypto.randomUUID();
        localStorage.setItem('session_id', sessionId);
      }

      // Check if this session already viewed this product
      const viewKey = `viewed_${productId}`;
      if (sessionStorage.getItem(viewKey)) {
        return; // Already viewed in this session
      }

      // Track the view
      await supabase
        .from('product_views')
        .insert({
          product_id: productId,
          user_id: user?.id || null,
          session_id: sessionId,
        });

      // Mark as viewed in this session
      sessionStorage.setItem(viewKey, 'true');
    };

    trackView();
  }, [productId, user?.id]);

  return (
    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <Eye className="w-4 h-4" />
      <span>{toPersianNumber(viewCount)} نفر این محصول را دیده‌اند</span>
    </div>
  );
}