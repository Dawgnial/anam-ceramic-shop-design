import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Star } from "lucide-react";
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
  const { data: reviews = [] } = useQuery({
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
  const { data: stats } = useQuery({
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
    <div className="space-y-8">
      {/* Rating Summary */}
      <div className="bg-[#FCF8F4] rounded-lg p-6">
        <h3 className="text-2xl font-bold mb-4">نظرات و امتیازدهی</h3>
        
        {stats && stats.review_count > 0 ? (
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-5xl font-bold mb-2" style={{ color: '#B3886D' }}>
                {stats.average_rating?.toFixed(1).replace('.', '٫')}
              </div>
              <div className="flex justify-center mb-2">
                {renderStars(stats.average_rating || 0, false, 24)}
              </div>
              <div className="text-sm text-muted-foreground">
                از {stats.review_count.toLocaleString('fa-IR')} نظر
              </div>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground">هنوز نظری ثبت نشده است. اولین نفری باشید که نظر می‌دهد!</p>
        )}
      </div>

      <Separator />

      {/* Submit Review Form */}
      {user ? (
        <div className="space-y-4">
          <h4 className="text-xl font-bold">ثبت نظر جدید</h4>
          
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
            style={{ backgroundColor: '#B3886D' }}
          >
            {submitReviewMutation.isPending ? 'در حال ارسال...' : 'ارسال نظر'}
          </Button>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <p className="text-muted-foreground">
            برای ثبت نظر باید وارد حساب کاربری خود شوید
          </p>
        </div>
      )}

      <Separator />

      {/* Reviews List */}
      <div className="space-y-6">
        <h4 className="text-xl font-bold">نظرات کاربران</h4>
        
        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    {renderStars(review.rating, false, 16)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(review.created_at).toLocaleDateString('fa-IR')}
                  </div>
                </div>
                
                <p className="text-sm leading-relaxed">{review.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            هنوز نظری ثبت نشده است
          </p>
        )}
      </div>
    </div>
  );
}
