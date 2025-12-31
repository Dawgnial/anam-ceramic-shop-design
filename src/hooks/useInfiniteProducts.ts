import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UseInfiniteProductsOptions {
  categoryId?: string | null;
  sortOrder?: string;
  priceRange?: [number, number];
  inStockOnly?: boolean;
  pageSize?: number;
}

export function useInfiniteProducts({
  categoryId,
  sortOrder = 'default',
  priceRange,
  inStockOnly = false,
  pageSize = 12,
}: UseInfiniteProductsOptions) {
  return useInfiniteQuery({
    queryKey: ['infinite-products', categoryId, sortOrder, priceRange, inStockOnly],
    queryFn: async ({ pageParam = 0 }) => {
      let query = supabase
        .from('products')
        .select('*, product_categories(category_id)', { count: 'exact' });

      // Filter by category
      if (categoryId) {
        const { data: productIds } = await supabase
          .from('product_categories')
          .select('product_id')
          .eq('category_id', categoryId);
        
        if (productIds && productIds.length > 0) {
          query = query.in('id', productIds.map(p => p.product_id));
        } else {
          return { data: [], nextPage: undefined, totalCount: 0 };
        }
      }

      // Filter by stock
      if (inStockOnly) {
        query = query.eq('in_stock', true).gt('stock', 0);
      }

      // Filter by price
      if (priceRange) {
        query = query.gte('price', priceRange[0]).lte('price', priceRange[1]);
      }

      // Sort
      switch (sortOrder) {
        case 'price-asc':
          query = query.order('price', { ascending: true });
          break;
        case 'price-desc':
          query = query.order('price', { ascending: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'bestseller':
          query = query.order('sales_count', { ascending: false });
          break;
        case 'popular':
          query = query.order('view_count', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      // Pagination
      query = query.range(pageParam * pageSize, (pageParam + 1) * pageSize - 1);

      const { data, count, error } = await query;

      if (error) throw error;

      return {
        data: data || [],
        nextPage: data && data.length === pageSize ? pageParam + 1 : undefined,
        totalCount: count || 0,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
  });
}