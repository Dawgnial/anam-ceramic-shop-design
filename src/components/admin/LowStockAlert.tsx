import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function LowStockAlert() {
  const navigate = useNavigate();

  const { data: lowStockProducts = [] } = useQuery({
    queryKey: ['low-stock-alert'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('low_stock_products')
        .select('*')
        .limit(5);

      if (error) throw error;
      return data;
    },
    refetchInterval: 60000, // Refetch every minute
  });

  if (lowStockProducts.length === 0) {
    return null;
  }

  return (
    <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-white">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <AlertTriangle className="w-5 h-5" />
          هشدار موجودی پایین
          <Badge variant="destructive" className="mr-auto">
            {lowStockProducts.length.toLocaleString('fa-IR')}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {lowStockProducts.map((product: any) => (
          <div
            key={product.id}
            className="flex items-center gap-3 p-3 bg-white rounded-lg border border-orange-100 hover:border-orange-300 transition-colors"
          >
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-12 h-12 object-cover rounded"
              />
            ) : (
              <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                <Package className="w-6 h-6 text-gray-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{product.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  موجودی: {product.stock?.toLocaleString('fa-IR') || '۰'}
                </Badge>
                {product.stock_shortage > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    کمبود: {product.stock_shortage?.toLocaleString('fa-IR')}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {lowStockProducts.length >= 5 && (
          <Button
            variant="outline"
            className="w-full mt-2"
            onClick={() => navigate('/admin/inventory')}
          >
            مشاهده همه ({lowStockProducts.length.toLocaleString('fa-IR')} محصول)
          </Button>
        )}
      </CardContent>
    </Card>
  );
}