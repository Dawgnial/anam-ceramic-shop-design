import { Skeleton } from "./skeleton";
import { Card, CardContent, CardFooter } from "./card";

export function BlogCardSkeleton() {
  return (
    <Card className="overflow-hidden flex flex-col h-full">
      <CardContent className="p-0">
        <Skeleton className="w-full h-36 sm:h-40 md:h-48" />
      </CardContent>
      <CardFooter className="gap-2 sm:gap-3 p-4 sm:p-5 md:p-6 flex-col flex items-center justify-between flex-1">
        <div className="flex flex-col items-center gap-2 sm:gap-3 w-full">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
        </div>
        <Skeleton className="h-9 w-28 mt-4" />
      </CardFooter>
    </Card>
  );
}

export function BlogGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <BlogCardSkeleton key={i} />
      ))}
    </div>
  );
}
