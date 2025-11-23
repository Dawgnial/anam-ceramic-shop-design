import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, MessageSquare, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface ProductReviewsProps {
  productId: string;
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");

  // Fetch approved reviews
  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ['product-reviews', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('product_id', productId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Fetch product rating stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['product-rating-stats', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products_with_ratings')
        .select('average_rating, review_count')
        .eq('id', productId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Submit review mutation
  const submitReviewMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('برای ارسال نظر باید وارد شوید');
      if (rating === 0) throw new Error('لطفا امتیاز را انتخاب کنید');
      if (!comment.trim()) throw new Error('لطفا نظر خود را بنویسید');

      const { error } = await supabase
        .from('product_reviews')
        .insert({
          product_id: productId,
          user_id: user.id,
          rating,
          comment: comment.trim(),
          is_approved: false,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('نظر شما با موفقیت ارسال شد و پس از تایید نمایش داده خواهد شد');
      setRating(0);
      setComment('');
      queryClient.invalidateQueries({ queryKey: ['product-reviews', productId] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleSubmitReview = () => {
    submitReviewMutation.mutate();
  };

  const renderStars = (value: number, interactive = false, size = 20) => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      const filled = interactive 
        ? starValue <= (hoverRating || rating)
        : starValue <= Math.round(value);

      return (
        <Star
          key={index}
          className={`transition-colors ${interactive ? 'cursor-pointer' : ''}`}
          size={size}
          fill={filled ? '#FFD700' : 'none'}
          stroke={filled ? '#FFD700' : '#D1D5DB'}
          onClick={interactive ? () => setRating(starValue) : undefined}
          onMouseEnter={interactive ? () => setHoverRating(starValue) : undefined}
          onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
        />
      );
    });
  };

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader className="border-b bg-[#FCF8F4]">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-[#B3886D]" />
          <CardTitle className="text-2xl font-bold">نظرات و امتیازدهی مشتریان</CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-8">
        {/* Rating Summary */}
        {statsLoading ? (
          <div className="bg-[#FCF8F4] rounded-lg p-6">
            <div className="flex items-center gap-6">
              <div className="text-center space-y-3">
                <Skeleton className="h-16 w-24 mx-auto" />
                <Skeleton className="h-6 w-32 mx-auto" />
                <Skeleton className="h-4 w-20 mx-auto" />
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-[#FCF8F4] rounded-lg p-6">
            {stats && stats.review_count > 0 ? (
              <div className="grid md:grid-cols-2 gap-8">
                {/* Rating Score */}
                <div className="text-center md:text-right space-y-3">
                  <div className="flex items-center justify-center md:justify-start gap-3">
                    <TrendingUp className="w-8 h-8 text-[#B3886D]" />
                    <div>
                      <div className="text-5xl font-bold" style={{ color: '#B3886D' }}>
                        {stats.average_rating?.toFixed(1).replace('.', '٫')}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        از ۵٫۰
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center md:justify-start">
                    {renderStars(stats.average_rating || 0, false, 28)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    براساس {stats.review_count.toLocaleString('fa-IR')} نظر
                  </div>
                </div>

                {/* Rating Distribution */}
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const count = reviews.filter((r) => r.rating === stars).length;
                    const percentage = stats.review_count > 0 ? (count / stats.review_count) * 100 : 0;
                    
                    return (
                      <div key={stars} className="flex items-center gap-3">
                        <span className="text-sm font-medium w-12 text-left">
                          {stars.toLocaleString('fa-IR')} ستاره
                        </span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-[#B3886D] h-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-12">
                          {count.toLocaleString('fa-IR')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  هنوز نظری ثبت نشده است. اولین نفری باشید که نظر می‌دهد!
                </p>
              </div>
            )}
          </div>
        )}

        <Separator />

        {/* Submit Review Form */}
        {user ? (
          <div className="space-y-4 bg-gray-50 rounded-lg p-6">
            <h4 className="text-xl font-bold flex items-center gap-2">
              <Star className="w-5 h-5 text-[#B3886D]" />
              ثبت نظر جدید
            </h4>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">امتیاز شما</label>
            <div className="flex gap-1">
              {renderStars(rating, true, 32)}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">نظر شما</label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="نظر خود را در مورد این محصول بنویسید..."
              rows={5}
              className="resize-none"
            />
          </div>

            <Button
              onClick={handleSubmitReview}
              disabled={submitReviewMutation.isPending}
              className="w-full md:w-auto"
              style={{ backgroundColor: '#B3886D' }}
            >
              {submitReviewMutation.isPending ? 'در حال ارسال...' : 'ارسال نظر'}
            </Button>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-6 text-center border-2 border-dashed">
            <Star className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">
              برای ثبت نظر باید وارد حساب کاربری خود شوید
            </p>
          </div>
        )}

        <Separator />

        {/* Reviews List */}
        <div className="space-y-6">
          <h4 className="text-xl font-bold flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#B3886D]" />
            نظرات کاربران
            {reviews.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                ({reviews.length.toLocaleString('fa-IR')} نظر)
              </span>
            )}
          </h4>
          
          {reviewsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-16 w-full" />
                </div>
              ))}
            </div>
          ) : reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div 
                  key={review.id} 
                  className="border rounded-lg p-5 space-y-3 hover:border-[#B3886D] hover:shadow-md transition-all bg-white"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      {renderStars(review.rating, false, 18)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString('fa-IR')}
                    </div>
                  </div>
                  
                  <p className="text-sm leading-relaxed text-foreground">
                    {review.comment}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground font-medium">
                هنوز نظری ثبت نشده است
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                اولین نفری باشید که نظر می‌دهید!
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
