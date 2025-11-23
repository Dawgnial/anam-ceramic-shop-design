import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2 } from "lucide-react";

interface ProductFeaturesProps {
  productId: string;
}

export function ProductFeatures({ productId }: ProductFeaturesProps) {
  const { data: features = [], isLoading } = useQuery({
    queryKey: ['product-features', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_features')
        .select('*')
        .eq('product_id', productId);

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <Card className="bg-white shadow-sm">
        <CardHeader className="border-b bg-[#FCF8F4]">
          <CardTitle className="text-2xl font-bold">ویژگی‌های محصول</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-lg border">
                <Skeleton className="w-5 h-5 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (features.length === 0) {
    return null;
  }

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader className="border-b bg-[#FCF8F4]">
        <CardTitle className="text-2xl font-bold">ویژگی‌های محصول</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature) => (
            <div 
              key={feature.id} 
              className="flex items-start gap-3 p-4 rounded-lg border hover:border-[#B3886D] hover:bg-[#FCF8F4] transition-all group"
            >
              <CheckCircle2 
                className="w-5 h-5 mt-0.5 flex-shrink-0 text-[#B3886D] group-hover:scale-110 transition-transform" 
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  {feature.feature_key}
                </div>
                <div className="font-semibold text-foreground break-words">
                  {feature.feature_value}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
