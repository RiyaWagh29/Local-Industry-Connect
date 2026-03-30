import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";
import { supabase } from "./supabase";
import { useAuth } from "./auth-context";

import { PersonalMessage, Conversation } from "./types";

interface MessagesContextType {
  conversations: Conversation[];
  isLoading: boolean;
  getConversation: (id: string) => Conversation | undefined;
  sendMessage: (conversationId: string, text: string) => Promise<void>;
  startConversation: (participant: { id: string; name: string; avatar: string; role: "mentor" | "student" }) => Promise<void>;
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined);

export function MessagesProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchConversations = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    
    try {
      // Direct message fetch for simplicity in Phase 1 (Basic Fetch on Load)
      // This fetches all messages where the user is sender or receiver
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group messages by the "other" person to form conversations
      const convMap: Record<string, Conversation> = {};

      for (const msg of data) {
        const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        
        if (!convMap[otherId]) {
          // Fetch participant info if not in cache (optimized version would join in SQL)
          const { data: profile } = await supabase
            .from('profiles')
            .select('name, avatar, role')
            .eq('id', otherId)
            .single();

          convMap[otherId] = {
            id: otherId,
            participantName: profile?.name || 'Unknown',
            participantAvatar: profile?.avatar || '',
            participantRole: profile?.role as "mentor" | "student" || 'student',
            messages: [],
            unread: 0
          };
        }

        const date = new Date(msg.created_at);
        const mappedMsg: PersonalMessage = {
          id: msg.id,
          senderId: msg.sender_id,
          senderName: msg.sender_id === user.id ? user.name : convMap[otherId].participantName,
          senderAvatar: msg.sender_id === user.id ? user.avatar || '' : convMap[otherId].participantAvatar,
          text: msg.text,
          timestamp: msg.created_at,
          time: date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
        };

        convMap[otherId].messages.push(mappedMsg);
        convMap[otherId].lastMessage = msg.text;
        convMap[otherId].lastTime = mappedMsg.time;
      }

      setConversations(Object.values(convMap));
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const getConversation = useCallback(
    (id: string) => conversations.find((c) => c.id === id),
    [conversations]
  );

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

  const sendMessage = useCallback(
    async (conversationId: string, text: string) => {
      if (!user) return;

      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: conversationId,
          text: text
        })
        .select()
        .single();

      if (error) {
        console.error('Error sending message:', error);
        throw error;
      }

      const date = new Date(data.created_at);
      const newMsg: PersonalMessage = {
        id: data.id,
        senderId: user.id,
        senderName: user.name,
        senderAvatar: user.avatar || '',
        text,
        timestamp: data.created_at,
        time: date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
      };

      setConversations((prev) => {
        return prev.map((c) =>
          c.id === conversationId
            ? { ...c, messages: [...c.messages, newMsg], lastMessage: text, lastTime: newMsg.time, unread: 0 }
            : c
        );
      });
    },
    [user]
  );

  return (
    <MessagesContext.Provider value={{ conversations, isLoading, getConversation, sendMessage, startConversation }}>
      {children}
    </MessagesContext.Provider>
  );
}

export function useMessages() {
  const ctx = useContext(MessagesContext);
  if (!ctx) throw new Error("useMessages must be used within MessagesProvider");
  return ctx;
}
