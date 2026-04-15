import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Send, ArrowLeft, MessageSquare, QrCode, Search, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useMessages } from "@/lib/messages-context";
import { useLanguage } from "@/lib/language-context";
import { ResponsiveLayout } from "@/components/mentor-connect/ResponsiveLayout";
import { Logo } from "@/components/mentor-connect/Logo";
import { LanguageToggle } from "@/components/mentor-connect/LanguageToggle";
import { PersonalMessage } from "@/lib/types";
import { getAvatarUrl } from "@/lib/avatar";
import { toast } from "sonner";

export default function PersonalMessages() {
  const { id: paramId } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { conversations, getConversationMessages, sendMessage, isLoading, fetchConversations } = useMessages();
  const { t } = useLanguage();

  const [selectedId, setSelectedId] = useState<string | null>(paramId ?? null);
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // Premium flow state
  const [isPremium, setIsPremium] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const activeConv = selectedId ? conversations.find((c) => c.id === selectedId) : null;
  const [activeMessages, setActiveMessages] = useState<PersonalMessage[]>([]);
  const [isThreadLoading, setIsThreadLoading] = useState(false);

  useEffect(() => {
    if (paramId) setSelectedId(paramId);
  }, [paramId]);

  useEffect(() => {
    if (paramId) fetchConversations();
  }, [paramId, fetchConversations]);

  useEffect(() => {
    const loadThread = async () => {
      if (!selectedId) {
        setActiveMessages([]);
        return;
      }
      setIsThreadLoading(true);
      const msgs = await getConversationMessages(selectedId);
      setActiveMessages(msgs);
      setIsThreadLoading(false);
    };
    loadThread();
  }, [selectedId, getConversationMessages]);

  useEffect(() => {
    if (!selectedId) return;
    const interval = setInterval(async () => {
      const msgs = await getConversationMessages(selectedId);
      setActiveMessages(msgs);
      fetchConversations();
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedId, getConversationMessages, fetchConversations]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages]);

  const inferredParticipant = (() => {
    if (activeConv) {
      return {
        name: activeConv.participantName,
        avatar: getAvatarUrl(activeConv.participantName, activeConv.participantAvatar),
      };
    }
    const firstOther = activeMessages.find((m) => m.senderId !== user?.id);
    if (firstOther) {
      return {
        name: firstOther.senderName || "Chat",
        avatar: getAvatarUrl(firstOther.senderName, firstOther.senderAvatar),
      };
    }
    return { name: "Chat", avatar: getAvatarUrl("Chat") };
  })();

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || !selectedId || !user) return;
    
    if (!isPremium) {
      setShowQR(true);
      return;
    }

    try {
      await sendMessage(selectedId, trimmed);
      const msgs = await getConversationMessages(selectedId);
      setActiveMessages(msgs);
      setInput("");
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSelectConversation = (conversationId: string) => {
    setSelectedId(conversationId);
    navigate(`/messages/${conversationId}`);
  };

  const handleBackToList = () => {
    setSelectedId(null);
    navigate("/messages");
  };

  const getRoleLabel = (role?: "mentor" | "student") => {
    if (role === "mentor") return "Mentor";
    if (role === "student") return "Student";
    return "";
  };

  const filteredConversations = conversations.filter((conv) => {
    const queryLower = query.trim().toLowerCase();
    if (!queryLower) return true;
    const name = conv.participantName.toLowerCase();
    const role = getRoleLabel(conv.participantRole).toLowerCase();
    return name.includes(queryLower) || role.includes(queryLower);
  });

  return (
    <ResponsiveLayout>
      <div className="min-h-screen bg-background pb-20 lg:pb-0 flex flex-col">
        {/* Top Bar */}
        <div className="hidden lg:block sticky top-0 bg-card/90 backdrop-blur-md border-b border-border z-40 px-4 py-3">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Logo size="sm" />
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-body font-semibold text-foreground">{t("messages.title") || "Messages"}</h1>
              <LanguageToggle />
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-6xl mx-auto w-full flex flex-col overflow-hidden" style={{ height: "calc(100vh - 70px)" }}>
          <div className="flex-1 overflow-hidden min-h-0">
            {!selectedId ? (
              <div className="h-full bg-card flex flex-col">
              <div className="px-4 py-3 border-b border-border/60">
                <h2 className="text-body font-bold text-foreground">{t("messages.title") || "Messages"}</h2>
                <p className="text-caption text-muted-foreground">Your recent chats</p>
                <div className="relative mt-3">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search messages..."
                    className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm outline-none focus:ring-4 focus:ring-primary/10"
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {filteredConversations.length === 0 ? (
                  <div className="p-6 text-muted-foreground flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <MessageSquare size={18} />
                      <span className="text-body">{query ? "No matching conversations" : (t("messages.noConversations") || "No conversations yet.")}</span>
                    </div>
                    {!query && (
                      <button
                        onClick={() => navigate("/student/explore")}
                        className="px-3 py-2 rounded-lg bg-primary/10 text-primary text-caption font-medium hover:bg-primary/20 transition-colors w-fit"
                      >
                        Explore Mentors
                      </button>
                    )}
                  </div>
                ) : (
                  filteredConversations.map((conv) => {
                    const lastTime = conv.lastTime ? new Date(conv.lastTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "";
                    return (
                      <button
                        key={conv.id}
                        onClick={() => handleSelectConversation(conv.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/40 transition-all border-b border-border/40 ${
                          selectedId === conv.id ? "bg-primary/10" : ""
                        }`}
                      >
                        <img
                          src={getAvatarUrl(conv.participantName, conv.participantAvatar)}
                          alt={conv.participantName}
                          className="w-12 h-12 rounded-full object-cover border border-border"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-body font-bold text-foreground truncate">{conv.participantName}</span>
                              {conv.participantRole && (
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                                  conv.participantRole === "mentor"
                                    ? "bg-mentor/10 text-mentor"
                                    : "bg-primary/10 text-primary"
                                }`}>
                                  {getRoleLabel(conv.participantRole)}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-muted-foreground">{lastTime}</span>
                          </div>
                          <p className="text-caption text-muted-foreground truncate">
                            {conv.lastMessage || "Start the conversation"}
                          </p>
                        </div>
                        {conv.unread > 0 && (
                          <span className="min-w-[20px] h-[20px] rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">
                            {conv.unread}
                          </span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
              </div>
            ) : (
              <div className="h-full min-h-0 flex flex-col bg-background relative overflow-hidden">
                {/* Chat Header */}
                <div className="px-4 py-3 border-b border-border bg-card flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleBackToList}
                      className="p-2 rounded-full hover:bg-muted transition-colors"
                      aria-label="Back to conversations"
                    >
                      <ArrowLeft size={18} className="text-muted-foreground" />
                    </button>
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden border border-border">
                      <img
                        src={inferredParticipant.avatar}
                        alt={inferredParticipant.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-body font-bold text-foreground">{inferredParticipant.name}</h3>
                        {activeConv?.participantRole && (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            activeConv.participantRole === "mentor"
                              ? "bg-mentor/10 text-mentor"
                              : "bg-primary/10 text-primary"
                          }`}>
                            {getRoleLabel(activeConv.participantRole)}
                          </span>
                        )}
                      </div>
                      <p className="text-caption text-muted-foreground">{t("messages.personalChat") || "Personal Chat"}</p>
                    </div>
                  </div>
                  {!isPremium && (
                    <span className="px-3 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      Premium Required
                    </span>
                  )}
                </div>

                {/* Messages */}
                <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-4">
                  {isThreadLoading && (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-10 bg-muted rounded-2xl animate-pulse" />
                      ))}
                    </div>
                  )}
                  {!isThreadLoading && activeMessages.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-caption text-muted-foreground bg-muted/50 py-2 px-4 rounded-full inline-block">
                        👋 Start the conversation with {inferredParticipant.name}!
                      </p>
                    </div>
                  )}
                  {!isThreadLoading && activeMessages.map((msg) => {
                    const isMe = msg.senderId === user?.id;
                    return (
                      <div key={msg.id} className={`flex gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                        {!isMe && (
                          <img
                            src={getAvatarUrl(msg.senderName, msg.senderAvatar || activeConv?.participantAvatar)}
                            alt={msg.senderName}
                            className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-1"
                          />
                        )}
                        <div className={`max-w-[75%] lg:max-w-[60%]`}>
                          <div
                            className={`px-4 py-2.5 rounded-2xl text-body leading-relaxed shadow-sm ${
                              isMe
                                ? "bg-primary text-primary-foreground rounded-tr-sm"
                                : "bg-card text-foreground rounded-tl-sm border border-border"
                            }`}
                          >
                            {msg.text}
                          </div>
                          <span className={`text-[10px] text-muted-foreground mt-1 block px-1 ${isMe ? "text-right" : "text-left"}`}>
                            {msg.time}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div className="border-t border-border bg-card/95 backdrop-blur px-2 py-2 sm:px-3 sm:py-3">
                  <div className="w-full">
                    <div className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 shadow-sm">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={t("messages.typePlaceholder") || "Type a message..."}
                      rows={1}
                      className="flex-1 resize-none bg-transparent px-1 py-1.5 text-body text-foreground placeholder:text-muted-foreground focus:outline-none max-h-24 min-h-[22px]"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim()}
                      className="w-10 h-10 rounded-full bg-primary text-primary-foreground shadow-md disabled:opacity-40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center flex-shrink-0"
                    >
                      <Send size={18} />
                    </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Premium QR Modal */}
      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-card w-full max-w-sm rounded-[2rem] border border-border shadow-2xl p-8 relative animate-slide-up">
            <button 
              onClick={() => setShowQR(false)}
              className="absolute top-4 right-4 w-8 h-8 bg-muted rounded-full flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <X size={16} />
            </button>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                <QrCode size={32} />
              </div>
              <div>
                <h3 className="text-h3 font-extrabold text-foreground tracking-tight">Unlock Messaging</h3>
                <p className="text-caption text-muted-foreground mt-2">
                  Direct messaging with mentors is a premium feature. Please scan the QR below to pay and unlock.
                </p>
              </div>

              <div className="bg-white p-4 rounded-2xl mx-auto w-48 h-48 border-[6px] border-primary/20 shadow-inner flex items-center justify-center relative overflow-hidden">
                 <img src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=PremiumPaymentForLocalIndustryConnect&color=121110`} alt="Payment QR" className="w-full h-full object-contain" />
              </div>

              <div className="pt-4 pb-2">
                <button 
                  onClick={() => {
                    setIsPremium(true);
                    setShowQR(false);
                    toast.success("Payment confirmed! You can now send messages.");
                  }}
                  className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Simulate Payment Complete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ResponsiveLayout>
  );
}
