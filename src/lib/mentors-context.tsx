import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import api from "./api";
import { useAuth } from "./auth-context";
import { Mentor, LocalizedString } from "./types";

interface MentorsContextType {
  mentors: Mentor[];
  isLoading: boolean;
  fetchMentors: () => Promise<void>;
  getMentorById: (id: string) => Promise<Mentor | null>;
}

const MentorsContext = createContext<MentorsContextType | undefined>(undefined);

export function MentorsProvider({ children }: { children: ReactNode }) {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, isInitialized } = useAuth();

  const mapProfileToMentor = useCallback((m: any): Mentor => {
    const ensureLoc = (val: any): LocalizedString => {
      if (typeof val === 'string') return { en: val, mr: val };
      if (val && typeof val === 'object' && val.en) return val;
      return { en: "", mr: "" };
    };

    return {
      id: m._id || m.id,
      name: ensureLoc(m.name),
      role: ensureLoc(m.role),
      company: m.company || "Nashik Industry",
      industry: (Array.isArray(m.industries) ? m.industries[0] : m.industry) || "Software",
      avatar: m.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(getTextManual(m.name) || 'Mentor')}&background=random`,
      bio: ensureLoc(m.bio || m.guidance),
      skills: Array.isArray(m.skills) ? m.skills : [],
      followers: m.followers || 0,
      communities: m.communities || 0,
      posts: m.posts || 0,
      experience: m.experience || 0,
      guidance: ensureLoc(m.guidance),
      coverImage: m.coverImage || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=300&fit=crop',
    };
  }, []);

  // Inline helper to avoid circular dependency with getText utility if any, 
  // but we prefer centralized getText. For mapping logic, we use its logic.
  const getTextManual = (value: any): string => {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object") return value.en || "";
    return "";
  };

  const fetchMentors = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const res = await api.get("/users/mentors");
      // Pattern: payload = res.data?.data || res.data?.user || []
      const payload = res.data?.data || res.data?.user || [];
      
      if (Array.isArray(payload)) {
        setMentors(payload.map(mapProfileToMentor));
      } else {
        setMentors([]);
      }
    } catch (err) {
      console.warn("Mentors fetch failed", err);
      setMentors([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, mapProfileToMentor]);

  const getMentorById = async (id: string): Promise<Mentor | null> => {
    if (!id || id === 'undefined') return null;
    const existing = mentors.find(m => m.id === id);
    if (existing) return existing;

    try {
      const res = await api.get(`/users/profile/${id}`);
      const payload = res.data?.data || res.data?.user;
      return payload ? mapProfileToMentor(payload) : null;
    } catch (err) {
      return null;
    }
  };

  useEffect(() => {
    if (isInitialized) {
      if (isAuthenticated) fetchMentors();
      else { setMentors([]); setIsLoading(false); }
    }
  }, [isInitialized, isAuthenticated, fetchMentors]);

  return (
    <MentorsContext.Provider value={{ mentors, isLoading, fetchMentors, getMentorById }}>
      {children}
    </MentorsContext.Provider>
  );
}

export function useMentors() {
  const context = useContext(MentorsContext);
  if (!context) throw new Error("useMentors must be used within MentorsProvider");
  return context;
}