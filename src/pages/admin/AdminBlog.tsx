import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BlogPostForm } from "@/components/admin/BlogPostForm";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function AdminBlog() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingPost, setDeletingPost] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: posts, isLoading } = useQuery({
    queryKey: ['admin-blog-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (values: any) => {
      const slug = values.title
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\u0600-\u06FF\w-]/g, '');

      const { error } = await supabase
        .from('blog_posts')
        .insert([{ ...values, slug }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['published-blog-posts'] });
      toast.success('پست با موفقیت اضافه شد');
      setDialogOpen(false);
    },
    onError: (error) => {
      console.error('Error creating post:', error);
      toast.error('خطا در افزودن پست');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: any }) => {
      const slug = values.title
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\u0600-\u06FF\w-]/g, '');

      const { error } = await supabase
        .from('blog_posts')
        .update({ ...values, slug })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['published-blog-posts'] });
      toast.success('پست با موفقیت ویرایش شد');
      setDialogOpen(false);
      setEditingPost(null);
    },
    onError: (error) => {
      console.error('Error updating post:', error);
      toast.error('خطا در ویرایش پست');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['published-blog-posts'] });
      toast.success('پست با موفقیت حذف شد');
      setDeleteDialogOpen(false);
      setDeletingPost(null);
    },
    onError: (error) => {
      console.error('Error deleting post:', error);
      toast.error('خطا در حذف پست');
    },
  });

  const handleSubmit = (values: any) => {
    if (editingPost) {
      updateMutation.mutate({ id: editingPost.id, values });
    } else {
      createMutation.mutate(values);
    }
  };

  const handleEdit = (post: any) => {
    setEditingPost(post);
    setDialogOpen(true);
  };

  const handleDelete = (post: any) => {
    setDeletingPost(post);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deletingPost) {
      deleteMutation.mutate(deletingPost.id);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-xl sm:text-3xl font-bold">مدیریت بلاگ</h2>
            <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
              افزودن، ویرایش و حذف پست‌های بلاگ
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingPost(null);
              setDialogOpen(true);
            }}
            style={{ backgroundColor: '#B3886D' }}
            className="w-full sm:w-auto"
          >
            <Plus className="ml-2 h-4 w-4" />
            افزودن پست جدید
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">پست‌های بلاگ</CardTitle>
          </CardHeader>
          <CardContent className="p-2 sm:p-6">
            {isLoading ? (
              <div className="text-center py-8">در حال بارگذاری...</div>
            ) : !posts || posts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                هیچ پستی ثبت نشده است
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>تصویر</TableHead>
                        <TableHead>عنوان</TableHead>
                        <TableHead>خلاصه</TableHead>
                        <TableHead>وضعیت</TableHead>
                        <TableHead>تاریخ</TableHead>
                        <TableHead>عملیات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {posts.map((post: any) => (
                        <TableRow key={post.id}>
                          <TableCell>
                            <img
                              src={post.image_url || '/placeholder.svg'}
                              alt={post.title}
                              className="w-16 h-16 object-cover rounded"
                            />
                          </TableCell>
                          <TableCell className="font-medium max-w-xs">
                            {post.title}
                          </TableCell>
                          <TableCell className="max-w-md">
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {post.excerpt}
                            </p>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={post.is_published ? "default" : "secondary"}
                              style={post.is_published ? { backgroundColor: '#28A745' } : undefined}
                            >
                              {post.is_published ? 'منتشر شده' : 'پیش‌نویس'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(post.created_at).toLocaleDateString('fa-IR')}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() => handleEdit(post)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="destructive"
                                onClick={() => handleDelete(post)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden space-y-3">
                  {posts.map((post: any) => (
                    <Card key={post.id} className="overflow-hidden">
                      <CardContent className="p-3">
                        <div className="flex gap-3">
                          <img
                            src={post.image_url || '/placeholder.svg'}
                            alt={post.title}
                            className="w-20 h-20 object-cover rounded flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm line-clamp-2">{post.title}</h3>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {post.excerpt}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge 
                                variant={post.is_published ? "default" : "secondary"}
                                style={post.is_published ? { backgroundColor: '#28A745' } : undefined}
                                className="text-xs"
                              >
                                {post.is_published ? 'منتشر شده' : 'پیش‌نویس'}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(post.created_at).toLocaleDateString('fa-IR')}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(post)}
                            className="flex-1"
                          >
                            <Pencil className="h-4 w-4 ml-1" />
                            ویرایش
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(post)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open);
        if (!open) {
          setEditingPost(null);
        }
      }}>
        <DialogContent className="w-full max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">
              {editingPost ? 'ویرایش پست' : 'افزودن پست جدید'}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {editingPost
                ? 'اطلاعات پست را ویرایش کنید'
                : 'اطلاعات پست جدید را وارد کنید'}
            </DialogDescription>
          </DialogHeader>
          <BlogPostForm
            key={editingPost?.id || 'new'}
            defaultValues={editingPost || undefined}
            onSubmit={handleSubmit}
            submitLabel={editingPost ? 'ذخیره تغییرات' : 'افزودن پست'}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف پست</AlertDialogTitle>
            <AlertDialogDescription>
              آیا مطمئن هستید که می‌خواهید پست "{deletingPost?.title}" را حذف کنید؟
              این عملیات قابل بازگشت نیست.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>لغو</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
