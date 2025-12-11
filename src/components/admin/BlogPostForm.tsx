import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "./ImageUpload";
import { RichTextEditor } from "./RichTextEditor";
import { useState } from "react";

const blogPostSchema = z.object({
  title: z.string().min(1, "عنوان الزامی است"),
  excerpt: z.string().min(1, "خلاصه الزامی است"),
  content: z.string().min(1, "محتوا الزامی است"),
  image_url: z.string().optional(),
  is_published: z.boolean().default(false),
});

type BlogPostFormValues = z.infer<typeof blogPostSchema>;

interface BlogPostFormProps {
  defaultValues?: Partial<BlogPostFormValues>;
  onSubmit: (values: BlogPostFormValues) => void;
  submitLabel?: string;
}

export function BlogPostForm({
  defaultValues,
  onSubmit,
  submitLabel = "ذخیره",
}: BlogPostFormProps) {
  const form = useForm<BlogPostFormValues>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: defaultValues || {
      title: "",
      excerpt: "",
      content: "",
      image_url: "",
      is_published: false,
    },
  });

  const [images, setImages] = useState<string[]>(
    defaultValues?.image_url ? [defaultValues.image_url] : []
  );

  const handleImageChange = (newImages: string[]) => {
    setImages(newImages);
    form.setValue("image_url", newImages[0] || "");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>عنوان پست</FormLabel>
              <FormControl>
                <Input placeholder="عنوان پست را وارد کنید" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="excerpt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>خلاصه پست</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="خلاصه کوتاهی از پست..."
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>محتوای کامل پست</FormLabel>
              <FormControl>
                <RichTextEditor
                  content={field.value}
                  onChange={field.onChange}
                  placeholder="محتوای کامل پست را وارد کنید..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="image_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>تصویر پست</FormLabel>
              <FormControl>
                <ImageUpload
                  images={images}
                  onImagesChange={handleImageChange}
                  maxImages={1}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_published"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>انتشار پست</FormLabel>
                <div className="text-sm text-muted-foreground">
                  پست برای کاربران نمایش داده شود
                </div>
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

        <Button type="submit" style={{ backgroundColor: '#B3886D' }} className="w-full">
          {submitLabel}
        </Button>
      </form>
    </Form>
  );
}
