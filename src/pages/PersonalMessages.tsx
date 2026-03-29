import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Send, ArrowLeft, MessageSquare } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useMessages } from "@/lib/messages-context";
import { useLanguage } from "@/lib/language-context";
import { ResponsiveLayout } from "@/components/mentor-connect/ResponsiveLayout";
import { Logo } from "@/components/mentor-connect/Logo";
import { LanguageToggle } from "@/components/mentor-connect/LanguageToggle";

export default function PersonalMessages() {
  const { id: paramId } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { conversations, getConversation, sendMessage } = useMessages();
  const { t } = useLanguage();

  const [selectedId, setSelectedId] = useState<string | null>(paramId ?? null);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const activeConv = selectedId ? getConversation(selectedId) : null;

  useEffect(() => {
    if (paramId) setSelectedId(paramId);
  }, [paramId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConv?.messages]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || !selectedId || !user) return;
    sendMessage(selectedId, trimmed, {
      id: "me",
      name: user.name,
      avatar: "",
    });
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <ResponsiveLayout>
      <div className="min-h-screen bg-background pb-20 lg:pb-0 flex flex-col">
        {/* Top Bar */}
        <div className="sticky top-0 bg-card/90 backdrop-blur-md border-b border-border z-40 px-4 py-3">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              {activeConv && (
                <button
                  onClick={() => { setSelectedId(null); navigate("/messages"); }}
                  className="text-muted-foreground hover:text-foreground lg:hidden"
                >
                  <ArrowLeft size={20} />
                </button>
              )}
              <Logo size="sm" />
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-body font-semibold text-foreground">{t("messages.title")}</h1>
              <LanguageToggle />
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-5xl mx-auto w-full flex overflow-hidden" style={{ height: "calc(100vh - 120px)" }}>
          {/* Sidebar – Conversation List */}
          <div className={`${activeConv ? "hidden lg:flex" : "flex"} w-full lg:w-72 xl:w-80 flex-col border-r border-border bg-card`}>
            <div className="p-4 border-b border-border">
              <h2 className="text-h3 text-foreground font-semibold">{t("messages.title")}</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                  <MessageSquare size={40} className="text-muted-foreground/40 mb-3" />
                  <p className="text-body text-muted-foreground">{t("messages.noConversations")}</p>
                  <p className="text-caption text-muted-foreground mt-2">{t("messages.startConversation")}</p>
                  <button
                    onClick={() => navigate("/student/explore")}
                    className="mt-4 px-4 py-2 rounded-lg bg-primary/10 text-primary text-caption font-medium hover:bg-primary/20 transition-colors"
                  >
                    Explore Mentors →
                  </button>
                </div>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => { setSelectedId(conv.id); navigate(`/messages/${conv.id}`); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border/50 text-left ${
                      selectedId === conv.id ? "bg-primary/5 border-r-2 border-r-primary" : ""
                    }`}
                  >
                    <img
                      src={conv.participantAvatar}
                      alt={conv.participantName}
                      className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-body font-semibold text-foreground truncate">{conv.participantName}</span>
                        {conv.lastTime && (
                          <span className="text-[10px] text-muted-foreground flex-shrink-0">{conv.lastTime}</span>
                        )}
                      </div>
                      <p className="text-caption text-muted-foreground truncate mt-0.5">
                        {conv.lastMessage || "..."}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className={`${activeConv ? "flex" : "hidden lg:flex"} flex-1 flex-col`}>
            {!activeConv ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <MessageSquare size={56} className="text-muted-foreground/30 mb-4" />
                <p className="text-body text-muted-foreground">{t("messages.selectConversation")}</p>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="px-4 py-3 border-b border-border bg-card flex items-center gap-3">
                  <img
                    src={activeConv.participantAvatar}
                    alt={activeConv.participantName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-body font-semibold text-foreground">{activeConv.participantName}</h3>
                    <p className="text-caption text-muted-foreground">{t("messages.personalChat")}</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-background">
                  {activeConv.messages.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-caption text-muted-foreground">
                        👋 Start the conversation with {activeConv.participantName}!
                      </p>
                    </div>
                  )}
                  {activeConv.messages.map((msg) => {
                    const isMe = msg.senderId === "me";
                    return (
                      <div key={msg.id} className={`flex gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                        {!isMe && (
                          <img
                            src={msg.senderAvatar || activeConv.participantAvatar}
                            alt={msg.senderName}
                            className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-1"
                          />
                        )}
                        <div className={`max-w-[75%] lg:max-w-[60%]`}>
                          <div
                            className={`px-4 py-2.5 rounded-2xl text-body leading-relaxed ${
                              isMe
                                ? "bg-primary text-primary-foreground rounded-tr-sm"
                                : "bg-card text-foreground rounded-tl-sm border border-border"
                            }`}
                          >
                            {msg.text}
                          </div>
                          <span className={`text-[10px] text-muted-foreground mt-1 block ${isMe ? "text-right" : "text-left"}`}>
                            {msg.time}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div className="border-t border-border bg-card px-4 py-3">
                  <div className="flex items-end gap-2 max-w-3xl mx-auto">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={t("messages.typePlaceholder")}
                      rows={1}
                      className="flex-1 resize-none bg-muted rounded-2xl px-4 py-2.5 text-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 max-h-24"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim()}
                      className="p-2.5 rounded-full bg-primary text-primary-foreground disabled:opacity-40 hover:opacity-90 transition-opacity flex-shrink-0"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </ResponsiveLayout>
  );
}
