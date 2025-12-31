import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, Percent } from "lucide-react";

interface ProductBadgesProps {
  isNew?: boolean;
  isBestseller?: boolean;
  hasSpecialDiscount?: boolean;
  discountPercentage?: number | null;
  className?: string;
}

export function ProductBadges({
  isNew,
  isBestseller,
  hasSpecialDiscount,
  discountPercentage,
  className = "",
}: ProductBadgesProps) {
  const badges = [];

  if (isNew) {
    badges.push(
      <Badge
        key="new"
        className="bg-green-500 hover:bg-green-600 text-white gap-1 px-2 py-1 text-xs"
      >
        <Sparkles className="w-3 h-3" />
        جدید
      </Badge>
    );
  }

  if (isBestseller) {
    badges.push(
      <Badge
        key="bestseller"
        className="bg-orange-500 hover:bg-orange-600 text-white gap-1 px-2 py-1 text-xs"
      >
        <TrendingUp className="w-3 h-3" />
        پرفروش
      </Badge>
    );
  }

  if (hasSpecialDiscount || (discountPercentage && discountPercentage > 0)) {
    badges.push(
      <Badge
        key="discount"
        className="bg-red-500 hover:bg-red-600 text-white gap-1 px-2 py-1 text-xs"
      >
        <Percent className="w-3 h-3" />
        {discountPercentage ? `${discountPercentage}% تخفیف` : 'تخفیف ویژه'}
      </Badge>
    );
  }

  if (badges.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {badges}
    </div>
  );
}