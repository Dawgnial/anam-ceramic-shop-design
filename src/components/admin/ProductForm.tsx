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
  category_id: z.string().uuid("لطفا یک دسته‌بندی انتخاب کنید"),
  colors: z.array(z.string()).optional(),
  images: z.array(z.string()).min(1, "حداقل یک عکس آپلود کنید"),
  is_featured: z.boolean().default(false),
  discount_percentage: z.number().min(0, "تخفیف نمی‌تواند منفی باشد").max(100, "تخفیف نمی‌تواند بیشتر از ۱۰۰ درصد باشد").optional().nullable(),
  in_stock: z.boolean().default(true),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  defaultValues?: Partial<ProductFormValues>;
  onSubmit: (values: ProductFormValues) => Promise<void>;
  submitLabel: string;
}

const availableColors = [
  { value: "سفید", label: "سفید" },
  { value: "مشکی", label: "مشکی" },
  { value: "قهوه‌ای", label: "قهوه‌ای" },
  { value: "آبی", label: "آبی" },
  { value: "سبز", label: "سبز" },
  { value: "زرد", label: "زرد" },
  { value: "نارنجی", label: "نارنجی" },
  { value: "قرمز", label: "قرمز" },
  { value: "صورتی", label: "صورتی" },
  { value: "بنفش", label: "بنفش" },
];

export function ProductForm({ defaultValues, onSubmit, submitLabel }: ProductFormProps) {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      description: defaultValues?.description || "",
      price: defaultValues?.price || 0,
      stock: defaultValues?.stock,
      category_id: defaultValues?.category_id || "",
      colors: defaultValues?.colors || [],
      images: defaultValues?.images || [],
      is_featured: defaultValues?.is_featured || false,
      discount_percentage: defaultValues?.discount_percentage,
      in_stock: defaultValues?.in_stock ?? true,
    },
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

  const handleColorToggle = (color: string) => {
    const currentColors = form.getValues('colors');
    if (currentColors.includes(color)) {
      form.setValue('colors', currentColors.filter(c => c !== color));
    } else {
      form.setValue('colors', [...currentColors, color]);
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
              <FormLabel>نام محصول</FormLabel>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>قیمت (تومان)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="۰"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>موجودی (اختیاری)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="۰"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="category_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>دسته‌بندی</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="یک دسته‌بندی انتخاب کنید" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="colors"
          render={({ field }) => (
            <FormItem>
              <FormLabel>رنگ‌های موجود (اختیاری)</FormLabel>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {availableColors.map((color) => (
                  <Button
                    key={color.value}
                    type="button"
                    variant={field.value?.includes(color.value) ? "default" : "outline"}
                    className="w-full"
                    onClick={() => handleColorToggle(color.value)}
                  >
                    {color.label}
                  </Button>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="images"
          render={({ field }) => (
            <FormItem>
              <FormLabel>تصاویر محصول</FormLabel>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="discount_percentage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>درصد تخفیف (اختیاری)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="۰"
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

        <Button type="submit" className="w-full" style={{ backgroundColor: '#B3886D' }}>
          {submitLabel}
        </Button>
      </form>
    </Form>
  );
}
