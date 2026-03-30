import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { supabase } from "./supabase";
import { Mentor } from "./types";

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

  const mapProfileToMentor = (m: any): Mentor => ({
    id: m.id,
    name: typeof m.name === 'string' ? { en: m.name, mr: m.name } : m.name,
    role: typeof m.role === 'string' ? { en: m.role, mr: m.role } : m.role,
    company: m.company || 'Professional',
    industry: m.industries?.[0] || 'Software',
    avatar: m.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name || 'Mentor')}&background=random`,
    bio: typeof m.bio === 'string' ? { en: m.bio, mr: m.bio } : (m.bio || { en: '', mr: '' }),
    skills: m.skills || [],
    followers: m.followers || 0,
    communities: m.communities || 0,
    posts: m.posts || 0,
    experience: m.experience || 0,
    guidance: typeof m.guidance === 'string' ? { en: m.guidance, mr: m.guidance } : (m.guidance || { en: '', mr: '' }),
    coverImage: m.cover_image || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=300&fit=crop',
  });

  const fetchMentors = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'mentor');

      if (error) throw error;
      setMentors(data.map(mapProfileToMentor));
    } catch (error) {
      console.error('Error fetching mentors:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getMentorById = async (id: string): Promise<Mentor | null> => {
    // Check local state first
    const local = mentors.find(m => m.id === id);
    if (local) return local;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) return null;
      return mapProfileToMentor(data);
    } catch (error) {
      return null;
    }
  };

  useEffect(() => {
    fetchMentors();
  }, [fetchMentors]);

  return (
    <MentorsContext.Provider value={{ mentors, isLoading, fetchMentors, getMentorById }}>
      {children}
    </MentorsContext.Provider>
  );
}

export function useMentors() {
  const context = useContext(MentorsContext);
  if (context === undefined) {
    throw new Error("useMentors must be used within a MentorsProvider");
  }
  return context;
}
