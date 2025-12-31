import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Ticket,
  Send,
  Loader2,
  Plus,
  Clock,
  MessageCircle,
  AlertCircle,
} from "lucide-react";

interface TicketType {
  id: string;
  user_id: string;
  subject: string;
  status: "open" | "in_progress" | "closed";
  priority: "low" | "normal" | "high" | "urgent";
  created_at: string;
  updated_at: string;
  closed_at: string | null;
}

interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_id: string | null;
  sender_type: "user" | "admin";
  message: string;
  attachments: string[] | null;
  is_read: boolean;
  created_at: string;
}

const statusLabels: Record<string, string> = {
  open: "باز",
  in_progress: "در حال بررسی",
  closed: "بسته شده",
};

const statusColors: Record<string, string> = {
  open: "bg-emerald-600",
  in_progress: "bg-amber-500",
  closed: "bg-gray-500",
};

const priorityLabels: Record<string, string> = {
  low: "کم",
  normal: "معمولی",
  high: "بالا",
  urgent: "فوری",
};

export function UserTickets() {
  const { user } = useAuth();
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [newTicketSubject, setNewTicketSubject] = useState("");
  const [newTicketMessage, setNewTicketMessage] = useState("");
  const [newTicketPriority, setNewTicketPriority] = useState("normal");
  const scrollRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Fetch user's tickets
  const { data: tickets = [], isLoading: loadingTickets } = useQuery({
    queryKey: ["user-tickets", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return data as TicketType[];
    },
    enabled: !!user?.id,
  });

  // Realtime subscription for tickets
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel("user-tickets")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "support_tickets", filter: `user_id=eq.${user.id}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["user-tickets"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  // Realtime subscription for messages
  useEffect(() => {
    if (!selectedTicketId) return;

    const channel = supabase
      .channel(`user-ticket-messages-${selectedTicketId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "ticket_messages",
          filter: `ticket_id=eq.${selectedTicketId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as TicketMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedTicketId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadMessages = async (ticketId: string) => {
    try {
      setLoadingMessages(true);
      const { data, error } = await supabase
        .from("ticket_messages")
        .select("*")
        .eq("ticket_id", ticketId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages((data || []) as TicketMessage[]);

      // Mark admin messages as read
      await supabase
        .from("ticket_messages")
        .update({ is_read: true })
        .eq("ticket_id", ticketId)
        .eq("sender_type", "admin");

    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSelectTicket = (ticketId: string) => {
    setSelectedTicketId(ticketId);
    loadMessages(ticketId);
  };

  const createTicketMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !newTicketSubject.trim() || !newTicketMessage.trim()) return;

      // Create ticket
      const { data: ticket, error: ticketError } = await supabase
        .from("support_tickets")
        .insert({
          user_id: user.id,
          subject: newTicketSubject.trim(),
          priority: newTicketPriority,
        })
        .select()
        .single();

      if (ticketError) throw ticketError;

      // Create first message
      const { error: messageError } = await supabase
        .from("ticket_messages")
        .insert({
          ticket_id: ticket.id,
          sender_id: user.id,
          sender_type: "user",
          message: newTicketMessage.trim(),
        });

      if (messageError) throw messageError;

      return ticket;
    },
    onSuccess: (ticket) => {
      toast.success("تیکت با موفقیت ایجاد شد");
      setNewTicketSubject("");
      setNewTicketMessage("");
      setNewTicketPriority("normal");
      setIsNewTicketOpen(false);
      queryClient.invalidateQueries({ queryKey: ["user-tickets"] });
      if (ticket) {
        handleSelectTicket(ticket.id);
      }
    },
    onError: () => {
      toast.error("خطا در ایجاد تیکت");
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      if (!selectedTicketId || !newMessage.trim() || !user?.id) return;

      const { error } = await supabase.from("ticket_messages").insert({
        ticket_id: selectedTicketId,
        sender_id: user.id,
        sender_type: "user",
        message: newMessage.trim(),
      });

      if (error) throw error;
    },
    onSuccess: () => {
      setNewMessage("");
    },
    onError: () => {
      toast.error("خطا در ارسال پیام");
    },
  });

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId);

  if (!user) {
    return (
      <Card className="border-2" style={{ borderColor: '#B3886D' }}>
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">برای ارسال تیکت باید وارد حساب کاربری شوید</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2" style={{ borderColor: '#B3886D' }}>
      <CardHeader className="border-b flex flex-row items-center justify-between" style={{ borderColor: '#F9F3F0' }}>
        <CardTitle className="text-xl flex items-center gap-2" style={{ color: '#896A59' }}>
          <Ticket className="w-5 h-5" />
          تیکت‌های پشتیبانی
        </CardTitle>
        <Dialog open={isNewTicketOpen} onOpenChange={setIsNewTicketOpen}>
          <DialogTrigger asChild>
            <Button style={{ backgroundColor: '#B3886D' }} className="text-white">
              <Plus className="w-4 h-4 ml-2" />
              تیکت جدید
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>ایجاد تیکت جدید</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">موضوع</label>
                <Input
                  placeholder="موضوع تیکت را وارد کنید"
                  value={newTicketSubject}
                  onChange={(e) => setNewTicketSubject(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">اولویت</label>
                <Select value={newTicketPriority} onValueChange={setNewTicketPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">کم</SelectItem>
                    <SelectItem value="normal">معمولی</SelectItem>
                    <SelectItem value="high">بالا</SelectItem>
                    <SelectItem value="urgent">فوری</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">پیام</label>
                <Textarea
                  placeholder="توضیحات خود را بنویسید..."
                  value={newTicketMessage}
                  onChange={(e) => setNewTicketMessage(e.target.value)}
                  rows={4}
                />
              </div>
              <Button
                onClick={() => createTicketMutation.mutate()}
                disabled={createTicketMutation.isPending || !newTicketSubject.trim() || !newTicketMessage.trim()}
                className="w-full"
                style={{ backgroundColor: '#B3886D' }}
              >
                {createTicketMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin ml-2" />
                ) : (
                  <Send className="w-4 h-4 ml-2" />
                )}
                ارسال تیکت
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="flex flex-col lg:flex-row h-[500px]">
          {/* Ticket List */}
          <div className="w-full lg:w-72 border-b lg:border-b-0 lg:border-l h-48 lg:h-full">
            <ScrollArea className="h-full">
              {loadingTickets ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-[#B3886D]" />
                </div>
              ) : tickets.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Ticket className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">هنوز تیکتی ندارید</p>
                </div>
              ) : (
                <div className="p-2 space-y-2">
                  {tickets.map((ticket) => (
                    <button
                      key={ticket.id}
                      onClick={() => handleSelectTicket(ticket.id)}
                      className={cn(
                        "w-full p-3 rounded-lg text-right transition-colors",
                        selectedTicketId === ticket.id
                          ? "bg-[#B3886D]/10 border border-[#B3886D]"
                          : "hover:bg-muted"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-sm truncate flex-1">{ticket.subject}</p>
                        <Badge className={cn("text-xs text-white", statusColors[ticket.status])}>
                          {statusLabels[ticket.status]}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(ticket.updated_at).toLocaleDateString("fa-IR")}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Messages */}
          <div className="flex-1 flex flex-col min-h-0">
            {selectedTicketId && selectedTicket ? (
              <>
                <div className="p-3 border-b flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm">{selectedTicket.subject}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(selectedTicket.created_at).toLocaleDateString("fa-IR")}
                    </p>
                  </div>
                  <Badge className={cn("text-white", statusColors[selectedTicket.status])}>
                    {statusLabels[selectedTicket.status]}
                  </Badge>
                </div>

                <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                  {loadingMessages ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="w-6 h-6 animate-spin text-[#B3886D]" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">هنوز پیامی ارسال نشده است</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={cn(
                            "max-w-[80%] p-3 rounded-2xl",
                            msg.sender_type === "user"
                              ? "bg-[#B3886D] text-white mr-auto rounded-br-none"
                              : "bg-muted ml-auto rounded-bl-none"
                          )}
                        >
                          <div className="flex items-center gap-1 mb-1">
                            <span className={cn(
                              "text-xs font-medium",
                              msg.sender_type === "user" ? "text-white/80" : "text-[#B3886D]"
                            )}>
                              {msg.sender_type === "admin" ? "پشتیبانی" : "شما"}
                            </span>
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                          <span
                            className={cn(
                              "text-[10px] mt-1 block",
                              msg.sender_type === "user"
                                ? "text-white/70"
                                : "text-muted-foreground"
                            )}
                          >
                            {new Date(msg.created_at).toLocaleTimeString("fa-IR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>

                {selectedTicket.status !== "closed" ? (
                  <div className="p-3 border-t">
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="پیام خود را بنویسید..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="min-h-[50px] resize-none"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            sendMessageMutation.mutate();
                          }
                        }}
                        disabled={sendMessageMutation.isPending}
                      />
                      <Button
                        size="icon"
                        onClick={() => sendMessageMutation.mutate()}
                        disabled={sendMessageMutation.isPending || !newMessage.trim()}
                        className="bg-[#B3886D] hover:bg-[#96705a] h-auto"
                      >
                        {sendMessageMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 border-t bg-muted/50 text-center">
                    <p className="text-sm text-muted-foreground">این تیکت بسته شده است</p>
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Ticket className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">یک تیکت را انتخاب کنید</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
