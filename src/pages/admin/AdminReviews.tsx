import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Check, X } from "lucide-react";
import { toast } from "sonner";

function AdminReviewsContent() {
  const queryClient = useQueryClient();

  // Fetch all reviews (approved and pending)
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_reviews')
        .select(`
          *,
          products (name, slug)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Approve review mutation
  const approveMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const { error } = await supabase
        .from('product_reviews')
        .update({ is_approved: true })
        .eq('id', reviewId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('نظر با موفقیت تایید شد');
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
    },
    onError: () => {
      toast.error('خطا در تایید نظر');
    },
  });

  // Reject/Delete review mutation
  const rejectMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const { error } = await supabase
        .from('product_reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('نظر با موفقیت حذف شد');
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
    },
    onError: () => {
      toast.error('خطا در حذف نظر');
    },
  });

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {Array.from({ length: 5 }, (_, index) => (
          <Star
            key={index}
            size={16}
            fill={index < rating ? '#FFD700' : 'none'}
            stroke={index < rating ? '#FFD700' : '#D1D5DB'}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#B3886D' }}></div>
          <p>در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  const pendingReviews = reviews.filter((r) => !r.is_approved);
  const approvedReviews = reviews.filter((r) => r.is_approved);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">مدیریت نظرات</h2>
        <p className="text-muted-foreground">
          تایید یا رد نظرات کاربران
        </p>
      </div>

      {/* Pending Reviews */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold">
            نظرات در انتظار تایید ({pendingReviews.length.toLocaleString('fa-IR')})
          </h3>
        </div>

        {pendingReviews.length > 0 ? (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">محصول</TableHead>
                  <TableHead className="text-right">امتیاز</TableHead>
                  <TableHead className="text-right">نظر</TableHead>
                  <TableHead className="text-right">تاریخ</TableHead>
                  <TableHead className="text-right">عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingReviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell className="font-medium">
                      {review.products?.name || 'محصول حذف شده'}
                    </TableCell>
                    <TableCell>
                      {renderStars(review.rating)}
                    </TableCell>
                    <TableCell className="max-w-md">
                      <p className="text-sm line-clamp-2">{review.comment}</p>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString('fa-IR')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => approveMutation.mutate(review.id)}
                          disabled={approveMutation.isPending}
                          style={{ backgroundColor: '#28A745' }}
                        >
                          <Check className="w-4 h-4 ml-1" />
                          تایید
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => rejectMutation.mutate(review.id)}
                          disabled={rejectMutation.isPending}
                        >
                          <X className="w-4 h-4 ml-1" />
                          رد
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="border rounded-lg p-8 text-center text-muted-foreground">
            نظری در انتظار تایید نیست
          </div>
        )}
      </div>

      {/* Approved Reviews */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold">
            نظرات تایید شده ({approvedReviews.length.toLocaleString('fa-IR')})
          </h3>
        </div>

        {approvedReviews.length > 0 ? (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">محصول</TableHead>
                  <TableHead className="text-right">امتیاز</TableHead>
                  <TableHead className="text-right">نظر</TableHead>
                  <TableHead className="text-right">تاریخ</TableHead>
                  <TableHead className="text-right">وضعیت</TableHead>
                  <TableHead className="text-right">عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {approvedReviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell className="font-medium">
                      {review.products?.name || 'محصول حذف شده'}
                    </TableCell>
                    <TableCell>
                      {renderStars(review.rating)}
                    </TableCell>
                    <TableCell className="max-w-md">
                      <p className="text-sm line-clamp-2">{review.comment}</p>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString('fa-IR')}
                    </TableCell>
                    <TableCell>
                      <Badge variant="default" style={{ backgroundColor: '#28A745' }}>
                        تایید شده
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => rejectMutation.mutate(review.id)}
                        disabled={rejectMutation.isPending}
                      >
                        <X className="w-4 h-4 ml-1" />
                        حذف
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="border rounded-lg p-8 text-center text-muted-foreground">
            نظر تایید شده‌ای وجود ندارد
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminReviews() {
  return (
    <AdminLayout>
      <AdminReviewsContent />
    </AdminLayout>
  );
}
