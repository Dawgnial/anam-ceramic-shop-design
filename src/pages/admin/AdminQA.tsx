import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  MessageCircleQuestion,
  Check,
  X,
  Loader2,
  Search,
  MessageSquare,
  Send,
  Eye,
} from "lucide-react";

interface Question {
  id: string;
  product_id: string;
  user_id: string | null;
  question: string;
  is_approved: boolean;
  created_at: string;
  product_name?: string;
  product_image?: string;
  answers_count?: number;
}

interface Answer {
  id: string;
  question_id: string;
  user_id: string | null;
  answer: string;
  is_admin_answer: boolean;
  is_approved: boolean;
  created_at: string;
}

export default function AdminQA() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [newAnswer, setNewAnswer] = useState("");
  const [loadingAnswers, setLoadingAnswers] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch questions
  const { data: questions = [], isLoading: loadingQuestions } = useQuery({
    queryKey: ["admin-questions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_questions")
        .select(`
          *,
          products!product_questions_product_id_fkey(name, images)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get answer counts
      const questionsWithCounts = await Promise.all(
        (data || []).map(async (q: any) => {
          const { count } = await supabase
            .from("product_answers")
            .select("*", { count: "exact", head: true })
            .eq("question_id", q.id);

          return {
            ...q,
            product_name: q.products?.name,
            product_image: q.products?.images?.[0],
            answers_count: count || 0,
          };
        })
      );

      return questionsWithCounts as Question[];
    },
  });

  // Fetch pending answers count
  const { data: pendingAnswersCount = 0 } = useQuery({
    queryKey: ["pending-answers-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("product_answers")
        .select("*", { count: "exact", head: true })
        .eq("is_approved", false)
        .eq("is_admin_answer", false);

      if (error) throw error;
      return count || 0;
    },
  });

  const loadAnswers = async (questionId: string) => {
    try {
      setLoadingAnswers(true);
      const { data, error } = await supabase
        .from("product_answers")
        .select("*")
        .eq("question_id", questionId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setAnswers((data || []) as Answer[]);
    } catch (error) {
      console.error("Error loading answers:", error);
    } finally {
      setLoadingAnswers(false);
    }
  };

  const handleViewQuestion = (question: Question) => {
    setSelectedQuestion(question);
    loadAnswers(question.id);
    setDialogOpen(true);
  };

  const approveQuestionMutation = useMutation({
    mutationFn: async (questionId: string) => {
      const { error } = await supabase
        .from("product_questions")
        .update({ is_approved: true })
        .eq("id", questionId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("سوال تایید شد");
      queryClient.invalidateQueries({ queryKey: ["admin-questions"] });
    },
    onError: () => {
      toast.error("خطا در تایید سوال");
    },
  });

  const rejectQuestionMutation = useMutation({
    mutationFn: async (questionId: string) => {
      // Delete all answers first
      await supabase
        .from("product_answers")
        .delete()
        .eq("question_id", questionId);

      const { error } = await supabase
        .from("product_questions")
        .delete()
        .eq("id", questionId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("سوال حذف شد");
      queryClient.invalidateQueries({ queryKey: ["admin-questions"] });
    },
    onError: () => {
      toast.error("خطا در حذف سوال");
    },
  });

  const approveAnswerMutation = useMutation({
    mutationFn: async (answerId: string) => {
      const { error } = await supabase
        .from("product_answers")
        .update({ is_approved: true })
        .eq("id", answerId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("پاسخ تایید شد");
      if (selectedQuestion) {
        loadAnswers(selectedQuestion.id);
      }
      queryClient.invalidateQueries({ queryKey: ["pending-answers-count"] });
    },
    onError: () => {
      toast.error("خطا در تایید پاسخ");
    },
  });

  const rejectAnswerMutation = useMutation({
    mutationFn: async (answerId: string) => {
      const { error } = await supabase
        .from("product_answers")
        .delete()
        .eq("id", answerId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("پاسخ حذف شد");
      if (selectedQuestion) {
        loadAnswers(selectedQuestion.id);
      }
      queryClient.invalidateQueries({ queryKey: ["pending-answers-count"] });
    },
    onError: () => {
      toast.error("خطا در حذف پاسخ");
    },
  });

  const addAdminAnswerMutation = useMutation({
    mutationFn: async () => {
      if (!selectedQuestion || !newAnswer.trim()) return;

      const { error } = await supabase.from("product_answers").insert({
        question_id: selectedQuestion.id,
        answer: newAnswer.trim(),
        is_admin_answer: true,
        is_approved: true, // Admin answers are auto-approved
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("پاسخ شما ارسال شد");
      setNewAnswer("");
      if (selectedQuestion) {
        loadAnswers(selectedQuestion.id);
      }
      queryClient.invalidateQueries({ queryKey: ["admin-questions"] });
    },
    onError: () => {
      toast.error("خطا در ارسال پاسخ");
    },
  });

  const pendingQuestions = questions.filter((q) => !q.is_approved);
  const approvedQuestions = questions.filter((q) => q.is_approved);

  const filteredPending = pendingQuestions.filter(
    (q) =>
      q.question.includes(searchQuery) ||
      q.product_name?.includes(searchQuery)
  );

  const filteredApproved = approvedQuestions.filter(
    (q) =>
      q.question.includes(searchQuery) ||
      q.product_name?.includes(searchQuery)
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold" style={{ color: "#B3886D" }}>
              مدیریت سوال و پاسخ
            </h1>
            <p className="text-sm text-muted-foreground">
              مدیریت سوالات و پاسخ‌های محصولات
            </p>
          </div>
          <div className="flex gap-2">
            {pendingQuestions.length > 0 && (
              <Badge variant="destructive">
                {pendingQuestions.length} سوال در انتظار تایید
              </Badge>
            )}
            {pendingAnswersCount > 0 && (
              <Badge className="bg-amber-500">
                {pendingAnswersCount} پاسخ در انتظار تایید
              </Badge>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="جستجو در سوالات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
        </div>

        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending" className="gap-2">
              در انتظار تایید
              {pendingQuestions.length > 0 && (
                <Badge variant="secondary" className="mr-1">
                  {pendingQuestions.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved" className="gap-2">
              تایید شده
              <Badge variant="secondary" className="mr-1">
                {approvedQuestions.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            {loadingQuestions ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#B3886D]" />
              </div>
            ) : filteredPending.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <MessageCircleQuestion className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">سوالی در انتظار تایید وجود ندارد</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredPending.map((question) => (
                  <Card key={question.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {question.product_image && (
                          <img
                            src={question.product_image}
                            alt={question.product_name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-muted-foreground mb-1">
                            {question.product_name}
                          </p>
                          <p className="font-medium">{question.question}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(question.created_at).toLocaleDateString("fa-IR")}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewQuestion(question)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-emerald-600 border-emerald-600 hover:bg-emerald-50"
                            onClick={() => approveQuestionMutation.mutate(question.id)}
                            disabled={approveQuestionMutation.isPending}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-600 hover:bg-red-50"
                            onClick={() => rejectQuestionMutation.mutate(question.id)}
                            disabled={rejectQuestionMutation.isPending}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="approved">
            {loadingQuestions ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#B3886D]" />
              </div>
            ) : filteredApproved.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <MessageCircleQuestion className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">سوال تایید شده‌ای وجود ندارد</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredApproved.map((question) => (
                  <Card key={question.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {question.product_image && (
                          <img
                            src={question.product_image}
                            alt={question.product_name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-muted-foreground mb-1">
                            {question.product_name}
                          </p>
                          <p className="font-medium">{question.question}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs text-muted-foreground">
                              {new Date(question.created_at).toLocaleDateString("fa-IR")}
                            </span>
                            <Badge variant="secondary" className="gap-1">
                              <MessageSquare className="w-3 h-3" />
                              {question.answers_count} پاسخ
                            </Badge>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewQuestion(question)}
                        >
                          <Eye className="w-4 h-4 ml-2" />
                          مشاهده
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Question Detail Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageCircleQuestion className="w-5 h-5" />
                جزئیات سوال
              </DialogTitle>
            </DialogHeader>

            {selectedQuestion && (
              <div className="space-y-4">
                {/* Question */}
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      {selectedQuestion.product_image && (
                        <img
                          src={selectedQuestion.product_image}
                          alt={selectedQuestion.product_name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {selectedQuestion.product_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(selectedQuestion.created_at).toLocaleDateString("fa-IR")}
                        </p>
                      </div>
                      {!selectedQuestion.is_approved && (
                        <Badge variant="secondary" className="mr-auto">
                          در انتظار تایید
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="font-medium">{selectedQuestion.question}</p>
                  </CardContent>
                </Card>

                {/* Answers */}
                <div>
                  <h3 className="font-bold mb-3 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    پاسخ‌ها ({answers.length})
                  </h3>

                  {loadingAnswers ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-[#B3886D]" />
                    </div>
                  ) : answers.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-4">
                      هنوز پاسخی ثبت نشده است
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {answers.map((answer) => (
                        <Card
                          key={answer.id}
                          className={answer.is_admin_answer ? "border-[#B3886D]" : ""}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  {answer.is_admin_answer ? (
                                    <Badge style={{ backgroundColor: "#B3886D" }}>
                                      پاسخ ادمین
                                    </Badge>
                                  ) : (
                                    <Badge variant="secondary">کاربر</Badge>
                                  )}
                                  {!answer.is_approved && !answer.is_admin_answer && (
                                    <Badge variant="outline" className="text-amber-600 border-amber-600">
                                      در انتظار تایید
                                    </Badge>
                                  )}
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(answer.created_at).toLocaleDateString("fa-IR")}
                                  </span>
                                </div>
                                <p className="text-sm">{answer.answer}</p>
                              </div>
                              {!answer.is_admin_answer && !answer.is_approved && (
                                <div className="flex gap-1">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 text-emerald-600"
                                    onClick={() => approveAnswerMutation.mutate(answer.id)}
                                  >
                                    <Check className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 text-red-600"
                                    onClick={() => rejectAnswerMutation.mutate(answer.id)}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                {/* Admin Reply */}
                <div className="border-t pt-4">
                  <h3 className="font-bold mb-3">پاسخ ادمین</h3>
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="پاسخ خود را بنویسید..."
                      value={newAnswer}
                      onChange={(e) => setNewAnswer(e.target.value)}
                      className="min-h-[80px] resize-none"
                    />
                    <Button
                      size="icon"
                      onClick={() => addAdminAnswerMutation.mutate()}
                      disabled={addAdminAnswerMutation.isPending || !newAnswer.trim()}
                      className="bg-[#B3886D] hover:bg-[#96705a] h-auto"
                    >
                      {addAdminAnswerMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
