import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
      <Card>
        <CardHeader>
          <CardTitle>ویژگی‌های محصول</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">در حال بارگذاری...</p>
        </CardContent>
      </Card>
    );
  }

  if (features.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>ویژگی‌های محصول</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature) => (
            <div key={feature.id} className="flex items-center justify-between p-3 border rounded-lg">
              <span className="font-medium text-muted-foreground">{feature.feature_key}</span>
              <span className="font-semibold">{feature.feature_value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
