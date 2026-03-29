import { createContext, useContext, useState, ReactNode, useCallback } from "react";

export interface PersonalMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
  time: string;
}

export interface Conversation {
  id: string; // mentorId or userId
  participantName: string;
  participantAvatar: string;
  participantRole: "mentor" | "student";
  messages: PersonalMessage[];
  lastMessage?: string;
  lastTime?: string;
  unread: number;
}

interface MessagesContextType {
  conversations: Conversation[];
  getConversation: (id: string) => Conversation | undefined;
  sendMessage: (conversationId: string, text: string, sender: { id: string; name: string; avatar: string }) => void;
  startConversation: (mentor: { id: string; name: string; avatar: string }) => void;
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined);

const STORAGE_KEY = "mc_messages";

function loadConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveConversations(convs: Conversation[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(convs));
}

export function MessagesProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>(loadConversations);

  const getConversation = useCallback(
    (id: string) => conversations.find((c) => c.id === id),
    [conversations]
  );

  const startConversation = useCallback((mentor: { id: string; name: string; avatar: string }) => {
    setConversations((prev) => {
      if (prev.find((c) => c.id === mentor.id)) return prev;
      const updated = [
        ...prev,
        {
          id: mentor.id,
          participantName: mentor.name,
          participantAvatar: mentor.avatar,
          participantRole: "mentor" as const,
          messages: [],
          unread: 0,
        },
      ];
      saveConversations(updated);
      return updated;
    });
  }, []);

  const sendMessage = useCallback(
    (conversationId: string, text: string, sender: { id: string; name: string; avatar: string }) => {
      const now = new Date();
      const msg: PersonalMessage = {
        id: `m_${Date.now()}`,
        senderId: sender.id,
        senderName: sender.name,
        senderAvatar: sender.avatar,
        text,
        timestamp: now.toISOString(),
        time: now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      };
      setConversations((prev) => {
        const updated = prev.map((c) =>
          c.id === conversationId
            ? { ...c, messages: [...c.messages, msg], lastMessage: text, lastTime: msg.time, unread: 0 }
            : c
        );
        saveConversations(updated);
        return updated;
      });
    },
    []
  );

  return (
    <MessagesContext.Provider value={{ conversations, getConversation, sendMessage, startConversation }}>
      {children}
    </MessagesContext.Provider>
  );
}

export function useMessages() {
  const ctx = useContext(MessagesContext);
  if (!ctx) throw new Error("useMessages must be used within MessagesProvider");
  return ctx;
}
