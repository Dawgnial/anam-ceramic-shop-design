import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "./ImageUpload";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const productSchema = z.object({
  name: z.string().min(3, "نام محصول باید حداقل ۳ کاراکتر باشد"),
  description: z.string().optional(),
  price: z.number().min(1000, "قیمت باید حداقل ۱۰۰۰ تومان باشد"),
  stock: z.number().min(0, "موجودی نمی‌تواند منفی باشد").optional(),
  category_ids: z.array(z.string().uuid()).min(1, "حداقل یک دسته‌بندی انتخاب کنید"),
  images: z.array(z.string()).min(1, "حداقل یک عکس آپلود کنید"),
  is_featured: z.boolean().default(false),
  discount_percentage: z.number().min(0, "تخفیف نمی‌تواند منفی باشد").max(100, "تخفیف نمی‌تواند بیشتر از ۱۰۰ درصد باشد").optional().nullable(),
  in_stock: z.boolean().default(true),
  low_stock_threshold: z.number().min(0).optional(),
  // New fields - made optional for backwards compatibility
  weight: z.number().min(1, "وزن محصول الزامی است").optional(),
  weight_with_packaging: z.number().min(1, "وزن با بسته‌بندی الزامی است").optional(),
  unit_quantity: z.number().min(1, "مقدار واحد باید حداقل ۱ باشد").optional(),
  unit_type: z.string().default("عددی"),
  has_variations: z.boolean().default(false),
  preparation_days: z.number().min(1, "زمان آماده‌سازی الزامی است").optional(),
  // Badge fields
  badge_new: z.boolean().default(false),
  badge_bestseller: z.boolean().default(false),
  badge_special_discount: z.boolean().default(false),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  defaultValues?: Partial<ProductFormValues>;
  onSubmit: (values: ProductFormValues) => Promise<void>;
  submitLabel: string;
}

const unitTypes = [
  { value: "عددی", label: "عددی" },
  { value: "کیلوگرم", label: "کیلوگرم" },
  { value: "گرم", label: "گرم" },
  { value: "متر", label: "متر" },
  { value: "سانتی‌متر", label: "سانتی‌متر" },
  { value: "بسته", label: "بسته" },
  { value: "جفت", label: "جفت" },
  { value: "دست", label: "دست" },
];

export function ProductForm({ defaultValues, onSubmit, submitLabel }: ProductFormProps) {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      description: defaultValues?.description ?? "",
      price: defaultValues?.price,
      stock: defaultValues?.stock,
      category_ids: defaultValues?.category_ids ?? [],
      images: defaultValues?.images ?? [],
      is_featured: defaultValues?.is_featured ?? false,
      discount_percentage: defaultValues?.discount_percentage,
      in_stock: defaultValues?.in_stock ?? true,
      low_stock_threshold: defaultValues?.low_stock_threshold,
      weight: defaultValues?.weight,
      weight_with_packaging: defaultValues?.weight_with_packaging,
      unit_quantity: defaultValues?.unit_quantity,
      unit_type: defaultValues?.unit_type ?? "عددی",
      has_variations: defaultValues?.has_variations ?? false,
      preparation_days: defaultValues?.preparation_days,
      badge_new: defaultValues?.badge_new ?? false,
      badge_bestseller: defaultValues?.badge_bestseller ?? false,
      badge_special_discount: defaultValues?.badge_special_discount ?? false,
    },
    values: defaultValues ? {
      name: defaultValues.name ?? "",
      description: defaultValues.description ?? "",
      price: defaultValues.price!,
      stock: defaultValues.stock,
      category_ids: defaultValues.category_ids ?? [],
      images: defaultValues.images ?? [],
      is_featured: defaultValues.is_featured ?? false,
      discount_percentage: defaultValues.discount_percentage,
      in_stock: defaultValues.in_stock ?? true,
      low_stock_threshold: defaultValues.low_stock_threshold,
      weight: defaultValues.weight,
      weight_with_packaging: defaultValues.weight_with_packaging,
      unit_quantity: defaultValues.unit_quantity,
      unit_type: defaultValues.unit_type ?? "عددی",
      has_variations: defaultValues.has_variations ?? false,
      preparation_days: defaultValues.preparation_days,
      badge_new: defaultValues.badge_new ?? false,
      badge_bestseller: defaultValues.badge_bestseller ?? false,
      badge_special_discount: defaultValues.badge_special_discount ?? false,
    } : undefined,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  const handleCategoryToggle = (categoryId: string) => {
    const currentCategories = form.getValues('category_ids');
    if (currentCategories.includes(categoryId)) {
      form.setValue('category_ids', currentCategories.filter(c => c !== categoryId));
    } else {
      form.setValue('category_ids', [...currentCategories, categoryId]);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>نام محصول *</FormLabel>
              <FormControl>
                <Input placeholder="نام محصول را وارد کنید" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>توضیحات (اختیاری)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="توضیحات محصول را وارد کنید"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category_ids"
          render={({ field }) => (
            <FormItem>
              <FormLabel>دسته‌بندی‌ها *</FormLabel>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {categories?.map((category) => (
                  <Button
                    key={category.id}
                    type="button"
                    variant={field.value?.includes(category.id) ? "default" : "outline"}
                    className="w-full"
                    onClick={() => handleCategoryToggle(category.id)}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
              <FormDescription>
                حداقل یک دسته‌بندی برای محصول انتخاب کنید
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="images"
          render={({ field }) => (
            <FormItem>
              <FormLabel>تصاویر محصول *</FormLabel>
              <FormControl>
                <ImageUpload
                  images={field.value}
                  onImagesChange={field.onChange}
                  maxImages={5}
                />
              </FormControl>
              <FormDescription>
                اولین عکس به عنوان تصویر اصلی محصول نمایش داده می‌شود
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Unit and Quantity Section */}
        <div className="border rounded-lg p-4 space-y-4">
          <h3 className="font-semibold text-lg">مقدار و واحد فروش</h3>
          <FormDescription>
            محصولی که مشتریت به سبد خریدش اضافه می‌کنه بر اساس واحد و مقدار و قیمت اینجا براش محاسبه میشه
          </FormDescription>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="unit_quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>مقدار *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="مثال: ۱"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="unit_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>واحد فروش *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="انتخاب واحد" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {unitTypes.map((unit) => (
                        <SelectItem key={unit.value} value={unit.value}>
                          {unit.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Variations Toggle */}
        <FormField
          control={form.control}
          name="has_variations"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">تنوع رنگ و سایز و... داره؟</FormLabel>
                <FormDescription>
                  اگر محصول رنگ‌ها یا سایزهای مختلف دارد فعال کنید
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Price Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>قیمت محصول (تومان) *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="قیمت به تومان"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="discount_percentage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>درصد تخفیف (اختیاری)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="درصد تخفیف (۰ تا ۱۰۰)"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "" || val === null || val === undefined) {
                        field.onChange(undefined);
                      } else {
                        const parsed = parseInt(val);
                        field.onChange(isNaN(parsed) ? undefined : parsed);
                      }
                    }}
                  />
                </FormControl>
                <FormDescription>
                  درصد تخفیف بین ۰ تا ۱۰۰
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Stock Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>موجودی (اختیاری)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="تعداد موجودی"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="in_stock"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">موجود در انبار</FormLabel>
                  <FormDescription>
                    وضعیت موجودی محصول
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Shipping Info Section */}
        <div className="border rounded-lg p-4 space-y-4">
          <h3 className="font-semibold text-lg">اطلاعات ارسال</h3>
          <FormDescription>
            هزینه ارسال بر اساس وزن محصولات محاسبه می‌شود. لطفا دقت کنید که دقیق بزنید.
          </FormDescription>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>وزن محصول چند گرم است؟ *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="مثال: ۱۸۰۰"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        className="pl-12"
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                        گرم
                      </span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="weight_with_packaging"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>وزن محصول با بسته‌بندی چند گرم است؟ *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="مثال: ۲۵۰۰"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        className="pl-12"
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                        گرم
                      </span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="preparation_days"
            render={({ field }) => (
              <FormItem>
                <FormLabel>زمان آماده‌سازی *</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="مثال: ۵ روز"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      className="pl-12"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      روز
                    </span>
                  </div>
                </FormControl>
                <FormDescription>
                  چند روز طول می‌کشد تا محصول آماده ارسال شود؟
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="is_featured"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">محصول ویژه</FormLabel>
                <FormDescription>
                  این محصول در بخش محصولات ویژه نمایش داده شود
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Badge Section */}
        <div className="border rounded-lg p-4 space-y-4">
          <h3 className="font-semibold text-lg">برچسب‌های ویژه</h3>
          <FormDescription>
            برچسب‌هایی که روی کارت محصول نمایش داده می‌شوند
          </FormDescription>

          <FormField
            control={form.control}
            name="badge_new"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel className="text-sm">برچسب "جدید"</FormLabel>
                  <FormDescription className="text-xs">
                    برای محصولات تازه اضافه شده
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="badge_bestseller"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel className="text-sm">برچسب "پرفروش"</FormLabel>
                  <FormDescription className="text-xs">
                    برای محصولات پرفروش
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="badge_special_discount"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel className="text-sm">برچسب "تخفیف ویژه"</FormLabel>
                  <FormDescription className="text-xs">
                    برای محصولات با تخفیف خاص
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full" style={{ backgroundColor: '#B3886D' }}>
          {submitLabel}
        </Button>
      </form>
    </Form>
  );
}