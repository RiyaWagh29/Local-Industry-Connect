import { useState, useRef, useEffect } from "react";
import { Send, Hash } from "lucide-react";
import { ChatMessage } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { toast } from "sonner";
import api from "@/lib/api";

interface ChatSectionProps {
  communityId?: string;
}

export function ChatSection({ communityId }: ChatSectionProps) {
  const { user } = useAuth();
  const { t, getLocalized, language } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!communityId) return;
      setIsLoading(true);
      try {
        const res = await api.get(`/community-messages/${communityId}`);
        const payload = res.data?.data || [];
        if (Array.isArray(payload)) {
          const mapped: ChatMessage[] = payload.map((m: any) => {
            const timeStr = new Date(m.createdAt).toLocaleTimeString(language === "en" ? "en-US" : "mr-IN", {
              hour: "2-digit",
              minute: "2-digit",
            });
            return {
              id: m._id,
              senderId: m.sender_id?._id || m.sender_id,
              senderName: { en: m.sender_id?.name || "Member", mr: m.sender_id?.name || "सदस्य" },
              senderAvatar: m.sender_id?.avatar || "",
              isMentor: m.sender_id?.role === "mentor",
              text: { en: m.text, mr: m.text },
              timestamp: m.createdAt,
              time: { en: timeStr, mr: timeStr },
            };
          });
          setMessages(mapped);
        } else {
          setMessages([]);
        }
      } catch (e) {
        console.error("Fetch community messages failed", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMessages();
  }, [communityId, language]);

  useEffect(() => {
    if (!communityId) return;
    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/community-messages/${communityId}`);
        const payload = res.data?.data || [];
        if (Array.isArray(payload)) {
          const mapped: ChatMessage[] = payload.map((m: any) => {
            const timeStr = new Date(m.createdAt).toLocaleTimeString(language === "en" ? "en-US" : "mr-IN", {
              hour: "2-digit",
              minute: "2-digit",
            });
            return {
              id: m._id,
              senderId: m.sender_id?._id || m.sender_id,
              senderName: { en: m.sender_id?.name || "Member", mr: m.sender_id?.name || "सदस्य" },
              senderAvatar: m.sender_id?.avatar || "",
              isMentor: m.sender_id?.role === "mentor",
              text: { en: m.text, mr: m.text },
              timestamp: m.createdAt,
              time: { en: timeStr, mr: timeStr },
            };
          });
          setMessages(mapped);
        }
      } catch (e) {
        // silent polling
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [communityId, language]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) { 
      toast.error(t("chat.errorEmpty") || "Message cannot be empty"); 
      return; 
    }
    if (trimmed.length > 500) { 
      toast.error(t("chat.errorTooLong") || "Message is too long"); 
      return; 
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString(language === "en" ? "en-US" : "mr-IN", { 
      hour: "2-digit", 
      minute: "2-digit" 
    });

    if (!communityId) return;
    const optimistic: ChatMessage = {
      id: `c${Date.now()}`,
      senderId: user?.id || "me",
      senderName: { en: user?.name || "Me", mr: user?.name || "मी" },
      senderAvatar: user?.avatar || "",
      isMentor: user?.role === "mentor",
      text: { en: trimmed, mr: trimmed },
      timestamp: now.toISOString(),
      time: { en: timeStr, mr: timeStr },
    };
    setMessages((prev) => [...prev, optimistic]);
    setInput("");
    api.post(`/community-messages/${communityId}`, { text: trimmed }).catch(() => {
      toast.error("Failed to send message");
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { 
      e.preventDefault(); 
      handleSend(); 
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-220px)] lg:h-[calc(100vh-180px)] bg-muted/20 rounded-2xl border border-border overflow-hidden">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 scrollbar-thin scrollbar-thumb-border">
        {isLoading && (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-10 bg-muted rounded-2xl animate-pulse" />
            ))}
          </div>
        )}
        {!isLoading && messages.map((msg, index) => {
          const isMe = msg.senderId === (user?.id || "me");
          const showAvatar = !isMe && (index === 0 || messages[index-1].senderId !== msg.senderId);
          
          return (
            <div key={msg.id} className={`flex gap-3 ${isMe ? "flex-row-reverse" : "flex-row"} animate-fade-in`}>
              <div className="w-8 flex-shrink-0">
                {showAvatar && (
                  <img 
                    src={msg.senderAvatar || `https://ui-avatars.com/api/?name=${getLocalized(msg.senderName)}&background=random`} 
                    alt={getLocalized(msg.senderName)} 
                    className="w-8 h-8 rounded-full object-cover border border-border shadow-sm" 
                  />
                )}
              </div>
              
              <div className={`max-w-[80%] lg:max-w-[70%] space-y-1 ${isMe ? "items-end" : "items-start"}`}>
                {!isMe && showAvatar && (
                  <span className={`text-[11px] font-bold ml-1 flex items-center gap-1 ${msg.isMentor ? "text-mentor" : "text-muted-foreground"}`}>
                    {getLocalized(msg.senderName)} 
                    {msg.isMentor && <span title="Verified Mentor">🎓</span>}
                  </span>
                )}
                
                <div className={`relative px-4 py-2.5 rounded-2xl text-body shadow-sm leading-relaxed transition-all hover:shadow-md ${
                  isMe
                    ? "bg-primary text-primary-foreground rounded-tr-none"
                    : msg.isMentor
                    ? "bg-card text-foreground rounded-tl-none border-l-4 border-l-mentor"
                    : "bg-card text-foreground rounded-tl-none border border-border"
                }`}>
                  {getLocalized(msg.text)}
                  <div className={`absolute bottom-[-18px] whitespace-nowrap text-[10px] font-medium text-muted-foreground/60 ${isMe ? "right-1 text-right" : "left-1 text-left"}`}>
                    {getLocalized(msg.time)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-card border-t border-border">
        <div className="flex items-end gap-3 max-w-4xl mx-auto bg-muted rounded-2xl p-2 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("chat.placeholder") || "Type a message..."}
            rows={1}
            className="flex-1 resize-none bg-transparent border-none px-3 py-2 text-body text-foreground placeholder:text-muted-foreground focus:outline-none max-h-32"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:hover:scale-100"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
