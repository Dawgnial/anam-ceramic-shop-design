import { Card, CardContent, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
const posts = [{
  id: 1,
  title: "هنر سفالگری در ایران",
  excerpt: "سفالگری یکی از قدیمی‌ترین هنرهای ایران است که تاریخی طولانی دارد...",
  image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400&h=300&fit=crop"
}, {
  id: 2,
  title: "نگهداری از ظروف سرامیکی",
  excerpt: "برای حفظ زیبایی و دوام ظروف سرامیکی، نکات مهمی وجود دارد...",
  image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400&h=300&fit=crop"
}, {
  id: 3,
  title: "رنگ‌آمیزی روی سفال",
  excerpt: "تکنیک‌های مختلف رنگ‌آمیزی روی سفال و نقوش سنتی ایرانی...",
  image: "https://images.unsplash.com/photo-1610650876093-a9ec4e8f264b?w=400&h=300&fit=crop"
}];
export const BlogPosts = () => {
  return <section className="h-[716px] bg-background flex items-center">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-foreground mb-12">آخرین پست‌ها</h2>

        <div className="grid md:grid-cols-3 gap-8">
          {posts.map(post => <Card key={post.id} className="overflow-hidden">
              <CardContent className="p-0">
                <img src={post.image} alt={post.title} className="w-full h-48 object-cover" />
              </CardContent>
              <CardFooter className="gap-3 p-6 flex-col flex items-center justify-center">
                <h3 className="font-bold text-lg text-foreground text-center">{post.title}</h3>
                <p className="text-muted-foreground text-sm text-center">{post.excerpt}</p>
                <Button variant="outline" className="text-center font-normal">بیشتر بخوانید</Button>
              </CardFooter>
            </Card>)}
        </div>
      </div>
    </section>;
};