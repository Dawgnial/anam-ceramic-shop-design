import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  sender_type: "user" | "admin";
  message: string;
  created_at: string;
}

interface GuestInfo {
  name: string;
  phone: string;
}

export const SupportChat = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [guestInfo, setGuestInfo] = useState<GuestInfo>({ name: "", phone: "" });
  const [needsGuestInfo, setNeedsGuestInfo] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [chatStatus, setChatStatus] = useState<"open" | "closed">("open");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load existing chat
  useEffect(() => {
    if (user) {
      loadUserChat();
    } else {
      // Check localStorage for guest chat
      const storedChatId = localStorage.getItem("support_chat_id");
      if (storedChatId) {
        setChatId(storedChatId);
        loadMessages(storedChatId);
      } else {
        setNeedsGuestInfo(true);
      }
    }
  }, [user]);

  // Realtime subscription
  useEffect(() => {
    if (!chatId) return;

    const channel = supabase
      .channel(`support-chat-${chatId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "support_messages",
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => [...prev, newMsg]);
          if (newMsg.sender_type === "admin" && !isOpen) {
            setUnreadCount((prev) => prev + 1);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "support_chats",
          filter: `id=eq.${chatId}`,
        },
        (payload) => {
          const updated = payload.new as { status: "open" | "closed"; unread_count: number };
          setChatStatus(updated.status);
          if (isOpen) {
            setUnreadCount(0);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId, isOpen]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadUserChat = async () => {
    try {
      setLoading(true);
      const { data: chats, error } = await supabase
        .from("support_chats")
        .select("*")
        .eq("user_id", user?.id)
        .eq("status", "open")
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) throw error;

      if (chats && chats.length > 0) {
        setChatId(chats[0].id);
        setChatStatus(chats[0].status as "open" | "closed");
        setUnreadCount(chats[0].unread_count || 0);
        await loadMessages(chats[0].id);
      }
    } catch (error) {
      console.error("Error loading chat:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (id: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("support_messages")
        .select("*")
        .eq("chat_id", id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages((data || []) as Message[]);

      // Get chat status
      const { data: chatData } = await supabase
        .from("support_chats")
        .select("status, unread_count")
        .eq("id", id)
        .single();
      
      if (chatData) {
        setChatStatus(chatData.status as "open" | "closed");
        setUnreadCount(chatData.unread_count || 0);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const createChat = async () => {
    if (!user && (!guestInfo.name || !guestInfo.phone)) {
      toast({
        title: "خطا",
        description: "لطفاً نام و شماره تماس خود را وارد کنید",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { data, error } = await supabase
        .from("support_chats")
        .insert({
          user_id: user?.id || null,
          guest_name: user ? null : guestInfo.name,
          guest_phone: user ? null : guestInfo.phone,
        })
        .select()
        .single();

      if (error) throw error;

      setChatId(data.id);
      setChatStatus("open");
      setNeedsGuestInfo(false);

      if (!user) {
        localStorage.setItem("support_chat_id", data.id);
      }

      return true;
    } catch (error) {
      console.error("Error creating chat:", error);
      toast({
        title: "خطا",
        description: "خطا در ایجاد چت",
        variant: "destructive",
      });
      return false;
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    // Create chat if doesn't exist
    if (!chatId) {
      const created = await createChat();
      if (!created) return;
    }

    try {
      setSending(true);
      const { error } = await supabase.from("support_messages").insert({
        chat_id: chatId,
        sender_type: "user",
        message: newMessage.trim(),
      });

      if (error) throw error;
      setNewMessage("");
      inputRef.current?.focus();
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "خطا",
        description: "خطا در ارسال پیام",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const endChat = async () => {
    if (!chatId) return;

    try {
      const { error } = await supabase
        .from("support_chats")
        .update({
          status: "closed",
          closed_at: new Date().toISOString(),
          closed_by: "user",
        })
        .eq("id", chatId);

      if (error) throw error;

      setChatStatus("closed");
      toast({
        title: "چت پایان یافت",
        description: "از ارتباط شما متشکریم",
      });
    } catch (error) {
      console.error("Error ending chat:", error);
    }
  };

  const startNewChat = () => {
    setChatId(null);
    setMessages([]);
    setChatStatus("open");
    localStorage.removeItem("support_chat_id");
    if (!user) {
      setNeedsGuestInfo(true);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    setUnreadCount(0);
    // Mark messages as read
    if (chatId) {
      supabase
        .from("support_chats")
        .update({ unread_count: 0 })
        .eq("id", chatId)
        .then();
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={handleOpen}
        className="fixed bottom-8 left-8 rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all z-50 bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center"
      >
        <MessageCircle className="w-6 h-6 text-white" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 left-4 sm:left-8 w-[calc(100vw-2rem)] sm:w-96 h-[70vh] sm:h-[500px] bg-background border rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-emerald-600 text-white p-4 flex items-center justify-between">
            <div>
              <h3 className="font-bold">پشتیبانی آنام</h3>
              <p className="text-xs text-emerald-100">
                {chatStatus === "open" ? "آنلاین - آماده پاسخگویی" : "چت بسته شده"}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-emerald-700"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Guest Info Form */}
          {needsGuestInfo && !user && !chatId ? (
            <div className="flex-1 p-4 flex flex-col justify-center">
              <div className="text-center mb-6">
                <MessageCircle className="w-12 h-12 mx-auto text-emerald-600 mb-3" />
                <h4 className="font-bold text-lg">خوش آمدید!</h4>
                <p className="text-sm text-muted-foreground">
                  لطفاً اطلاعات خود را وارد کنید
                </p>
              </div>
              <div className="space-y-4">
                <Input
                  placeholder="نام شما"
                  value={guestInfo.name}
                  onChange={(e) =>
                    setGuestInfo((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
                <Input
                  placeholder="شماره موبایل"
                  value={guestInfo.phone}
                  onChange={(e) =>
                    setGuestInfo((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  dir="ltr"
                  className="text-left"
                />
                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  onClick={async () => {
                    const created = await createChat();
                    if (created) {
                      setNeedsGuestInfo(false);
                    }
                  }}
                >
                  شروع گفتگو
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Messages */}
              <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>سلام! چطور می‌توانیم کمکتان کنیم؟</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={cn(
                          "max-w-[80%] p-3 rounded-2xl",
                          msg.sender_type === "user"
                            ? "bg-emerald-600 text-white mr-auto rounded-br-none"
                            : "bg-muted ml-auto rounded-bl-none"
                        )}
                      >
                        <p className="text-sm">{msg.message}</p>
                        <span
                          className={cn(
                            "text-[10px] mt-1 block",
                            msg.sender_type === "user"
                              ? "text-emerald-100"
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

              {/* Input or Closed State */}
              {chatStatus === "closed" ? (
                <div className="p-4 border-t bg-muted/50 text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    این گفتگو پایان یافته است
                  </p>
                  <Button
                    size="sm"
                    onClick={startNewChat}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    شروع گفتگوی جدید
                  </Button>
                </div>
              ) : (
                <div className="p-3 border-t">
                  <div className="flex gap-2">
                    <Input
                      ref={inputRef}
                      placeholder="پیام خود را بنویسید..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      disabled={sending}
                    />
                    <Button
                      size="icon"
                      onClick={sendMessage}
                      disabled={sending || !newMessage.trim()}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      {sending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  {chatId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={endChat}
                      className="w-full mt-2 text-muted-foreground hover:text-destructive"
                    >
                      پایان گفتگو
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
};
