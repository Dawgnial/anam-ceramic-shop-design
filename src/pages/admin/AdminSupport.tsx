import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  MessageCircle,
  Send,
  Loader2,
  User,
  Phone,
  Clock,
  CheckCircle,
  XCircle,
  Search,
} from "lucide-react";

interface Chat {
  id: string;
  user_id: string | null;
  guest_name: string | null;
  guest_phone: string | null;
  status: "open" | "closed";
  admin_unread_count: number;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  closed_by: string | null;
}

interface Message {
  id: string;
  chat_id: string;
  sender_type: "user" | "admin";
  message: string;
  is_read: boolean;
  created_at: string;
}

const AdminSupport = () => {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "closed">("all");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Fetch chats
  const { data: chats = [], isLoading: loadingChats } = useQuery({
    queryKey: ["support-chats", statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("support_chats")
        .select("*")
        .order("updated_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Chat[];
    },
  });

  // Realtime subscription for chats
  useEffect(() => {
    const channel = supabase
      .channel("admin-support-chats")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "support_chats",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["support-chats"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Realtime subscription for messages
  useEffect(() => {
    if (!selectedChatId) return;

    const channel = supabase
      .channel(`admin-chat-messages-${selectedChatId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "support_messages",
          filter: `chat_id=eq.${selectedChatId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedChatId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadMessages = async (chatId: string) => {
    try {
      setLoadingMessages(true);
      const { data, error } = await supabase
        .from("support_messages")
        .select("*")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages((data || []) as Message[]);

      // Reset admin unread count
      await supabase
        .from("support_chats")
        .update({ admin_unread_count: 0 })
        .eq("id", chatId);

      queryClient.invalidateQueries({ queryKey: ["support-chats"] });
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId);
    loadMessages(chatId);
    inputRef.current?.focus();
  };

  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      if (!selectedChatId || !newMessage.trim()) return;

      const { error } = await supabase.from("support_messages").insert({
        chat_id: selectedChatId,
        sender_type: "admin",
        message: newMessage.trim(),
      });

      if (error) throw error;
    },
    onSuccess: () => {
      setNewMessage("");
      inputRef.current?.focus();
    },
    onError: () => {
      toast({
        title: "خطا",
        description: "خطا در ارسال پیام",
        variant: "destructive",
      });
    },
  });

  const endChatMutation = useMutation({
    mutationFn: async (chatId: string) => {
      const { error } = await supabase
        .from("support_chats")
        .update({
          status: "closed",
          closed_at: new Date().toISOString(),
          closed_by: "admin",
        })
        .eq("id", chatId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "موفق",
        description: "چت با موفقیت بسته شد",
      });
      queryClient.invalidateQueries({ queryKey: ["support-chats"] });
    },
  });

  const filteredChats = chats.filter((chat) => {
    const searchLower = searchQuery.toLowerCase();
    const name = chat.guest_name?.toLowerCase() || "";
    const phone = chat.guest_phone?.toLowerCase() || "";
    return name.includes(searchLower) || phone.includes(searchLower);
  });

  const selectedChat = chats.find((c) => c.id === selectedChatId);
  const totalUnread = chats.reduce((sum, chat) => sum + (chat.admin_unread_count || 0), 0);

  return (
    <AdminLayout>
      <div className="h-[calc(100vh-7rem)]">
        {/* Header */}
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold" style={{ color: "#B3886D" }}>
              پشتیبانی آنلاین
            </h1>
            <p className="text-sm text-muted-foreground">
              مدیریت چت‌های پشتیبانی مشتریان
            </p>
          </div>
          {totalUnread > 0 && (
            <Badge variant="destructive" className="self-start">
              {totalUnread} پیام خوانده نشده
            </Badge>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-4 h-[calc(100%-4rem)]">
          {/* Chat List */}
          <Card className="w-full lg:w-80 flex-shrink-0 flex flex-col h-64 lg:h-full">
            <div className="p-3 border-b space-y-3">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="جستجو..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-9"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={statusFilter === "all" ? "default" : "outline"}
                  onClick={() => setStatusFilter("all")}
                  className={statusFilter === "all" ? "bg-[#B3886D] hover:bg-[#96705a]" : ""}
                >
                  همه
                </Button>
                <Button
                  size="sm"
                  variant={statusFilter === "open" ? "default" : "outline"}
                  onClick={() => setStatusFilter("open")}
                  className={statusFilter === "open" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                >
                  باز
                </Button>
                <Button
                  size="sm"
                  variant={statusFilter === "closed" ? "default" : "outline"}
                  onClick={() => setStatusFilter("closed")}
                  className={statusFilter === "closed" ? "bg-gray-600 hover:bg-gray-700" : ""}
                >
                  بسته
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1">
              {loadingChats ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-[#B3886D]" />
                </div>
              ) : filteredChats.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>چتی یافت نشد</p>
                </div>
              ) : (
                <div className="p-2 space-y-2">
                  {filteredChats.map((chat) => (
                    <button
                      key={chat.id}
                      onClick={() => handleSelectChat(chat.id)}
                      className={cn(
                        "w-full p-3 rounded-lg text-right transition-colors",
                        selectedChatId === chat.id
                          ? "bg-[#B3886D]/10 border border-[#B3886D]"
                          : "hover:bg-muted"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <span className="font-medium truncate">
                              {chat.guest_name || "کاربر ثبت‌نام شده"}
                            </span>
                          </div>
                          {chat.guest_phone && (
                            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                              <Phone className="w-3 h-3" />
                              <span dir="ltr">{chat.guest_phone}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {chat.status === "open" ? (
                            <Badge className="bg-emerald-600 text-xs">باز</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              بسته
                            </Badge>
                          )}
                          {chat.admin_unread_count > 0 && (
                            <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                              {chat.admin_unread_count}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>
                          {new Date(chat.updated_at).toLocaleDateString("fa-IR")}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </Card>

          {/* Chat Window */}
          <Card className="flex-1 flex flex-col min-h-0">
            {selectedChatId && selectedChat ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5 text-[#B3886D]" />
                      <span className="font-bold">
                        {selectedChat.guest_name || "کاربر ثبت‌نام شده"}
                      </span>
                      {selectedChat.status === "open" ? (
                        <Badge className="bg-emerald-600 text-xs">باز</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          بسته
                        </Badge>
                      )}
                    </div>
                    {selectedChat.guest_phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Phone className="w-3 h-3" />
                        <span dir="ltr">{selectedChat.guest_phone}</span>
                      </div>
                    )}
                  </div>
                  {selectedChat.status === "open" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => endChatMutation.mutate(selectedChatId)}
                      disabled={endChatMutation.isPending}
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      <XCircle className="w-4 h-4 ml-2" />
                      پایان چت
                    </Button>
                  )}
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                  {loadingMessages ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="w-6 h-6 animate-spin text-[#B3886D]" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
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
                          <p className="text-sm">{msg.message}</p>
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
                {selectedChat.status === "open" ? (
                  <div className="p-3 border-t">
                    <div className="flex gap-2">
                      <Input
                        ref={inputRef}
                        placeholder="پاسخ خود را بنویسید..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
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
                        className="bg-[#B3886D] hover:bg-[#96705a]"
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
                        این چت در تاریخ{" "}
                        {new Date(selectedChat.closed_at!).toLocaleDateString("fa-IR")} توسط{" "}
                        {selectedChat.closed_by === "admin" ? "ادمین" : "کاربر"} بسته شد
                      </span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>یک چت از لیست انتخاب کنید</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSupport;
