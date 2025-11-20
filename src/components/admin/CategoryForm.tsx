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
import { ImageUpload } from "./ImageUpload";

const categorySchema = z.object({
  name: z.string().min(2, "نام دسته‌بندی باید حداقل ۲ کاراکتر باشد"),
  description: z.string().optional(),
  image_url: z.string().optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  defaultValues?: Partial<CategoryFormValues>;
  onSubmit: (values: CategoryFormValues) => Promise<void>;
  submitLabel: string;
}

export function CategoryForm({ defaultValues, onSubmit, submitLabel }: CategoryFormProps) {
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: defaultValues?.name || "",
      description: defaultValues?.description || "",
      image_url: defaultValues?.image_url || "",
    },
  });

  const handleImageChange = (images: string[]) => {
    form.setValue('image_url', images[0] || "");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>نام دسته‌بندی</FormLabel>
              <FormControl>
                <Input placeholder="نام دسته‌بندی را وارد کنید" {...field} />
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
                  placeholder="توضیحات دسته‌بندی را وارد کنید"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                توضیحات کوتاهی در مورد این دسته‌بندی
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="image_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>تصویر دسته‌بندی (اختیاری)</FormLabel>
              <FormControl>
                <ImageUpload
                  images={field.value ? [field.value] : []}
                  onImagesChange={handleImageChange}
                  maxImages={1}
                />
              </FormControl>
              <FormDescription>
                یک تصویر برای نمایش دسته‌بندی انتخاب کنید
              </FormDescription>
              <FormMessage />
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
