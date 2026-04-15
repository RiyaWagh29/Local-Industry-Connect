import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";
import api from "./api";
import { useAuth } from "./auth-context";
import { PersonalMessage, Conversation } from "./types";

interface MessagesContextType {
  conversations: Conversation[];
  isLoading: boolean;
  getConversation: (id: string) => Conversation | undefined;
  getConversationMessages: (id: string) => Promise<PersonalMessage[]>;
  sendMessage: (recipientId: string, text: string) => Promise<void>;
  startConversation: (participant: { id: string; name: string; avatar: string; role: "mentor" | "student" }) => Promise<void>;
  fetchConversations: () => Promise<void>;
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined);

export function MessagesProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();

  const fetchConversations = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const response: any = await api.get("/messages");
      const payload = response?.data;
      if (payload?.success && Array.isArray(payload.data)) {
        setConversations(payload.data);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const getConversationMessages = useCallback(async (id: string) => {
    try {
      const response: any = await api.get(`/messages/${id}`);
      const payload = response?.data;
      if (payload?.success && Array.isArray(payload.data)) {
        return payload.data.map((msg: any) => ({
          id: msg._id,
          senderId: msg.sender._id,
          senderName: msg.sender.name,
          senderAvatar: msg.sender.avatar || "",
          text: msg.text,
          timestamp: msg.createdAt,
          time: new Date(msg.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching details:', error);
      return [];
    }
  }, []);

  const sendMessage = useCallback(async (recipientId: string, text: string) => {
    if (!user) return;

    try {
      const response: any = await api.post('/messages', {
        recipientId,
        text
      });

      if (response?.data?.success) {
        await fetchConversations(); // Refresh list to update last message
      }
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }, [user, fetchConversations]);

  const startConversation = useCallback(async (participant: { id: string; name: string; avatar: string; role: "mentor" | "student" }) => {
    setConversations((prev) => {
      if (prev.find((c) => c.id === participant.id)) return prev;
      return [
        ...prev,
        {
          id: participant.id,
          participantName: participant.name,
          participantAvatar: participant.avatar,
          participantRole: participant.role,
          messages: [],
          unread: 0,
        },
      ];
    });
  }, []);

  const getConversation = useCallback((id: string) => {
    return conversations.find((c) => c.id === id);
  }, [conversations]);

  // Poll for new messages every 5 seconds (Poor man's real-time)
  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations();
      const interval = setInterval(fetchConversations, 10000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, fetchConversations]);

  return (
    <MessagesContext.Provider value={{ 
      conversations, 
      isLoading, 
      getConversation,
      getConversationMessages, 
      sendMessage, 
      startConversation,
      fetchConversations 
    }}>
      {children}
    </MessagesContext.Provider>
  );
}

export function useMessages() {
  const ctx = useContext(MessagesContext);
  if (!ctx) throw new Error("useMessages must be used within MessagesProvider");
  return ctx;
}
