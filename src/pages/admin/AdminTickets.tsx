import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Ticket,
  Send,
  Loader2,
  User,
  Clock,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  Paperclip,
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
  user_phone?: string;
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

const priorityColors: Record<string, string> = {
  low: "bg-slate-400",
  normal: "bg-blue-500",
  high: "bg-orange-500",
  urgent: "bg-red-600",
};

export default function AdminTickets() {
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const scrollRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Fetch tickets with user phone
  const { data: tickets = [], isLoading: loadingTickets } = useQuery({
    queryKey: ["admin-tickets", statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("support_tickets")
        .select(`
          *,
          profiles!support_tickets_user_id_fkey(phone)
        `)
        .order("updated_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return (data || []).map((ticket: any) => ({
        ...ticket,
        user_phone: ticket.profiles?.phone,
      })) as TicketType[];
    },
  });

  // Realtime subscription for tickets
  useEffect(() => {
    const channel = supabase
      .channel("admin-tickets")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "support_tickets" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["admin-tickets"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Realtime subscription for messages
  useEffect(() => {
    if (!selectedTicketId) return;

    const channel = supabase
      .channel(`admin-ticket-messages-${selectedTicketId}`)
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

      // Mark messages as read
      await supabase
        .from("ticket_messages")
        .update({ is_read: true })
        .eq("ticket_id", ticketId)
        .eq("sender_type", "user");

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

  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      if (!selectedTicketId || !newMessage.trim()) return;

      const { error } = await supabase.from("ticket_messages").insert({
        ticket_id: selectedTicketId,
        sender_type: "admin",
        message: newMessage.trim(),
      });

      if (error) throw error;

      // Update ticket status to in_progress if it was open
      const ticket = tickets.find(t => t.id === selectedTicketId);
      if (ticket?.status === "open") {
        await supabase
          .from("support_tickets")
          .update({ status: "in_progress" })
          .eq("id", selectedTicketId);
      }
    },
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: ["admin-tickets"] });
    },
    onError: () => {
      toast.error("خطا در ارسال پیام");
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ ticketId, status }: { ticketId: string; status: string }) => {
      const updateData: any = { status };
      if (status === "closed") {
        updateData.closed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("support_tickets")
        .update(updateData)
        .eq("id", ticketId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("وضعیت تیکت به‌روزرسانی شد");
      queryClient.invalidateQueries({ queryKey: ["admin-tickets"] });
    },
    onError: () => {
      toast.error("خطا در به‌روزرسانی وضعیت");
    },
  });

  const filteredTickets = tickets.filter((ticket) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      ticket.subject.toLowerCase().includes(searchLower) ||
      ticket.user_phone?.includes(searchLower)
    );
  });

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId);
  const unreadCount = messages.filter(m => m.sender_type === "user" && !m.is_read).length;

  return (
    <AdminLayout>
      <div className="h-[calc(100vh-7rem)]">
        {/* Header */}
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold" style={{ color: "#B3886D" }}>
              مدیریت تیکت‌ها
            </h1>
            <p className="text-sm text-muted-foreground">
              پاسخگویی به تیکت‌های پشتیبانی کاربران
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 h-[calc(100%-4rem)]">
          {/* Ticket List */}
          <Card className="w-full lg:w-96 flex-shrink-0 flex flex-col h-64 lg:h-full">
            <div className="p-3 border-b space-y-3">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="جستجو با موضوع یا شماره..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="وضعیت تیکت" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">همه تیکت‌ها</SelectItem>
                  <SelectItem value="open">باز</SelectItem>
                  <SelectItem value="in_progress">در حال بررسی</SelectItem>
                  <SelectItem value="closed">بسته شده</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <ScrollArea className="flex-1">
              {loadingTickets ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-[#B3886D]" />
                </div>
              ) : filteredTickets.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Ticket className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>تیکتی یافت نشد</p>
                </div>
              ) : (
                <div className="p-2 space-y-2">
                  {filteredTickets.map((ticket) => (
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
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{ticket.subject}</p>
                          {ticket.user_phone && (
                            <p className="text-sm text-muted-foreground mt-1" dir="ltr">
                              {ticket.user_phone}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge className={cn("text-xs text-white", statusColors[ticket.status])}>
                            {statusLabels[ticket.status]}
                          </Badge>
                          <Badge className={cn("text-xs text-white", priorityColors[ticket.priority])}>
                            {priorityLabels[ticket.priority]}
                          </Badge>
                        </div>
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
          </Card>

          {/* Ticket Detail */}
          <Card className="flex-1 flex flex-col min-h-0">
            {selectedTicketId && selectedTicket ? (
              <>
                {/* Ticket Header */}
                <div className="p-4 border-b">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h2 className="font-bold text-lg">{selectedTicket.subject}</h2>
                      <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                        <User className="w-4 h-4" />
                        <span dir="ltr">{selectedTicket.user_phone}</span>
                        <span>•</span>
                        <Clock className="w-4 h-4" />
                        <span>{new Date(selectedTicket.created_at).toLocaleDateString("fa-IR")}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={selectedTicket.status}
                        onValueChange={(value) =>
                          updateStatusMutation.mutate({ ticketId: selectedTicketId, status: value })
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">باز</SelectItem>
                          <SelectItem value="in_progress">در حال بررسی</SelectItem>
                          <SelectItem value="closed">بسته شده</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                  {loadingMessages ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="w-6 h-6 animate-spin text-[#B3886D]" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <Ticket className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>هنوز پیامی ارسال نشده است</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={cn(
                            "max-w-[80%] p-3 rounded-2xl",
                            msg.sender_type === "admin"
                              ? "bg-[#B3886D] text-white mr-auto rounded-br-none"
                              : "bg-muted ml-auto rounded-bl-none"
                          )}
                        >
                          <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                          <span
                            className={cn(
                              "text-[10px] mt-1 block",
                              msg.sender_type === "admin"
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

                {/* Input */}
                {selectedTicket.status !== "closed" ? (
                  <div className="p-3 border-t">
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="پاسخ خود را بنویسید..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="min-h-[60px] resize-none"
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
                  <div className="p-4 border-t bg-muted/50 text-center">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">
                        این تیکت در تاریخ {new Date(selectedTicket.closed_at!).toLocaleDateString("fa-IR")} بسته شد
                      </span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Ticket className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>یک تیکت را انتخاب کنید</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
