import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, MessageCircle, ChevronDown, ChevronUp, User, Shield } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { toPersianNumber } from "@/lib/utils";

interface ProductQAProps {
  productId: string;
}

export function ProductQA({ productId }: ProductQAProps) {
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [question, setQuestion] = useState("");
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [answer, setAnswer] = useState("");

  // Fetch approved questions with their answers
  const { data: questions = [], isLoading } = useQuery({
    queryKey: ['product-questions', productId],
    queryFn: async () => {
      const { data: questionsData, error: questionsError } = await supabase
        .from('product_questions')
        .select('*')
        .eq('product_id', productId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (questionsError) throw questionsError;

      // Fetch answers for each question
      const questionsWithAnswers = await Promise.all(
        questionsData.map(async (q) => {
          const { data: answersData } = await supabase
            .from('product_answers')
            .select('*')
            .eq('question_id', q.id)
            .or('is_approved.eq.true,is_admin_answer.eq.true')
            .order('created_at', { ascending: true });

          return { ...q, answers: answersData || [] };
        })
      );

      return questionsWithAnswers;
    },
  });

  // Submit question mutation
  const submitQuestionMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('برای ارسال سوال باید وارد شوید');
      if (!question.trim()) throw new Error('لطفا سوال خود را بنویسید');

      const { error } = await supabase
        .from('product_questions')
        .insert({
          product_id: productId,
          user_id: user.id,
          question: question.trim(),
          is_approved: false,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('سوال شما ارسال شد و پس از تایید نمایش داده خواهد شد');
      setQuestion('');
      queryClient.invalidateQueries({ queryKey: ['product-questions', productId] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Submit answer mutation
  const submitAnswerMutation = useMutation({
    mutationFn: async (questionId: string) => {
      if (!user) throw new Error('برای ارسال پاسخ باید وارد شوید');
      if (!answer.trim()) throw new Error('لطفا پاسخ خود را بنویسید');

      const { error } = await supabase
        .from('product_answers')
        .insert({
          question_id: questionId,
          user_id: user.id,
          answer: answer.trim(),
          is_admin_answer: isAdmin,
          is_approved: isAdmin, // Admin answers are auto-approved
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(isAdmin ? 'پاسخ شما ثبت شد' : 'پاسخ شما ارسال شد و پس از تایید نمایش داده خواهد شد');
      setAnswer('');
      setReplyingTo(null);
      queryClient.invalidateQueries({ queryKey: ['product-questions', productId] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const toggleQuestion = (questionId: string) => {
    setExpandedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader className="border-b bg-[#FCF8F4]">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-[#B3886D]" />
          <CardTitle className="text-2xl font-bold">پرسش و پاسخ</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-8">
        {/* Submit Question Form */}
        {user ? (
          <div className="space-y-4 bg-gray-50 rounded-lg p-6">
            <h4 className="text-xl font-bold flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-[#B3886D]" />
              سوال جدید بپرسید
            </h4>
            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="سوال خود را درباره این محصول بنویسید..."
              rows={3}
              className="resize-none"
            />
            <Button
              onClick={() => submitQuestionMutation.mutate()}
              disabled={submitQuestionMutation.isPending}
              style={{ backgroundColor: '#B3886D' }}
            >
              {submitQuestionMutation.isPending ? 'در حال ارسال...' : 'ارسال سوال'}
            </Button>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-6 text-center border-2 border-dashed">
            <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">
              برای پرسیدن سوال باید وارد حساب کاربری خود شوید
            </p>
          </div>
        )}

        <Separator />

        {/* Questions List */}
        <div className="space-y-4">
          <h4 className="text-xl font-bold flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#B3886D]" />
            سوالات کاربران
            {questions.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                ({toPersianNumber(questions.length)} سوال)
              </span>
            )}
          </h4>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border rounded-lg p-4 space-y-3">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          ) : questions.length > 0 ? (
            <div className="space-y-4">
              {questions.map((q: any) => (
                <div
                  key={q.id}
                  className="border rounded-lg overflow-hidden hover:border-[#B3886D] transition-all"
                >
                  {/* Question */}
                  <button
                    onClick={() => toggleQuestion(q.id)}
                    className="w-full text-right p-4 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {new Date(q.created_at).toLocaleDateString('fa-IR')}
                          </span>
                        </div>
                        <p className="font-medium">{q.question}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {q.answers?.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {toPersianNumber(q.answers.length)} پاسخ
                          </Badge>
                        )}
                        {expandedQuestions.has(q.id) ? (
                          <ChevronUp className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Answers */}
                  {expandedQuestions.has(q.id) && (
                    <div className="border-t bg-gray-50 p-4 space-y-4">
                      {q.answers?.length > 0 ? (
                        <div className="space-y-3">
                          {q.answers.map((a: any) => (
                            <div
                              key={a.id}
                              className={`p-3 rounded-lg ${
                                a.is_admin_answer
                                  ? 'bg-[#B3886D]/10 border border-[#B3886D]/30'
                                  : 'bg-white border'
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                {a.is_admin_answer ? (
                                  <>
                                    <Shield className="w-4 h-4 text-[#B3886D]" />
                                    <span className="text-xs font-medium text-[#B3886D]">
                                      پاسخ فروشگاه
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <User className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground">
                                      کاربر
                                    </span>
                                  </>
                                )}
                                <span className="text-xs text-muted-foreground">
                                  • {new Date(a.created_at).toLocaleDateString('fa-IR')}
                                </span>
                              </div>
                              <p className="text-sm">{a.answer}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-2">
                          هنوز پاسخی ثبت نشده است
                        </p>
                      )}

                      {/* Reply Form */}
                      {user && (
                        <div className="pt-3 border-t">
                          {replyingTo === q.id ? (
                            <div className="space-y-3">
                              <Textarea
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                placeholder="پاسخ خود را بنویسید..."
                                rows={2}
                                className="resize-none"
                              />
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => submitAnswerMutation.mutate(q.id)}
                                  disabled={submitAnswerMutation.isPending}
                                  style={{ backgroundColor: '#B3886D' }}
                                >
                                  {submitAnswerMutation.isPending ? 'در حال ارسال...' : 'ارسال پاسخ'}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setReplyingTo(null);
                                    setAnswer('');
                                  }}
                                >
                                  انصراف
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setReplyingTo(q.id)}
                            >
                              <MessageCircle className="w-4 h-4 ml-2" />
                              پاسخ دهید
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <HelpCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground font-medium">
                هنوز سوالی ثبت نشده است
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                اولین نفری باشید که سوال می‌پرسید!
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}