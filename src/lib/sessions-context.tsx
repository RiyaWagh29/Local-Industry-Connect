import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";
import api from "./api";
import { useAuth } from "./auth-context";
import { Session } from "./types";
import { toast } from "sonner";

interface SessionsContextType {
  sessions: Session[];
  isLoading: boolean;
  bookSession: (mentorId: string, start: Date, end: Date) => Promise<boolean>;
  updateStatus: (sessionId: string, status: string) => Promise<void>;
  fetchSessions: () => Promise<void>;
}

const SessionsContext = createContext<SessionsContextType | undefined>(undefined);

export function SessionsProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const fetchSessions = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const response: any = await api.get("/sessions");
      if (response.success) {
        setSessions(response.data);
      }
    } catch (error: any) {
      console.error("Error fetching sessions:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const bookSession = async (mentorId: string, start: Date, end: Date) => {
    try {
      const response: any = await api.post("/sessions/book", {
        mentorId,
        start: start.toISOString(),
        end: end.toISOString(),
      });
      if (response.success) {
        toast.success("Session booked successfully! awaiting mentor confirmation.");
        fetchSessions();
        return true;
      }
      return false;
    } catch (error: any) {
      toast.error(error.message || "Booking failed");
      return false;
    }
  };

  const updateStatus = async (sessionId: string, status: string) => {
    try {
      const response: any = await api.put(`/sessions/${sessionId}`, { status });
      if (response.success) {
        toast.success(`Session ${status} successfully`);
        fetchSessions();
      }
    } catch (error: any) {
      toast.error(error.message || "Status update failed");
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return (
    <SessionsContext.Provider value={{ 
      sessions, 
      isLoading, 
      bookSession, 
      updateStatus,
      fetchSessions 
    }}>
      {children}
    </SessionsContext.Provider>
  );
}

export function useSessions() {
  const context = useContext(SessionsContext);
  if (!context) throw new Error("useSessions must be used within SessionsProvider");
  return context;
}
