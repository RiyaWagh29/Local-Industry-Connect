import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";
import { supabase } from "./supabase";
import { useAuth } from "./auth-context";
import { Opportunity } from "./types";

interface OpportunitiesContextType {
  opportunities: Opportunity[];
  savedOpportunityIds: string[];
  isLoading: boolean;
  toggleSaveOpportunity: (opportunityId: string) => Promise<void>;
  fetchOpportunities: () => Promise<void>;
}

const OpportunitiesContext = createContext<OpportunitiesContextType | undefined>(undefined);

export function OpportunitiesProvider({ children }: { children: ReactNode }) {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [savedOpportunityIds, setSavedOpportunityIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchOpportunities = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .select('*, profiles:mentor_id(name)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mapped: Opportunity[] = data.map(o => {
        const profile = o.profiles as any;
        const mName = profile?.name;
        
        return {
          id: o.id,
          title: typeof o.title === 'string' ? { en: o.title, mr: o.title } : o.title,
          type: o.type,
          company: o.company,
          location: typeof o.location === 'string' ? { en: o.location, mr: o.location } : o.location,
          deadline: o.deadline,
          mentorId: o.mentor_id,
          mentorName: typeof mName === 'string' ? { en: mName, mr: mName } : (mName || { en: 'Expert', mr: 'तज्ज्ञ' }),
          industry: o.industry,
          description: typeof o.description === 'string' ? { en: o.description, mr: o.description } : o.description,
          requirements: o.requirements || []
        };
      });

      setOpportunities(mapped);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchSavedIds = useCallback(async () => {
    if (!user) {
      setSavedOpportunityIds([]);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('saved_opportunities')
        .select('opportunity_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setSavedOpportunityIds(data.map(d => d.opportunity_id));
    } catch (error) {
      console.error('Error fetching saved opportunities:', error);
    }
  }, [user]);

  useEffect(() => {
    fetchOpportunities();
    fetchSavedIds();
  }, [fetchOpportunities, fetchSavedIds]);

  const toggleSaveOpportunity = async (opportunityId: string) => {
    if (!user) return;

    const isSaved = savedOpportunityIds.includes(opportunityId);
    
    try {
      if (isSaved) {
        const { error } = await supabase
          .from('saved_opportunities')
          .delete()
          .eq('user_id', user.id)
          .eq('opportunity_id', opportunityId);
        
        if (error) throw error;
        setSavedOpportunityIds(prev => prev.filter(id => id !== opportunityId));
      } else {
        const { error } = await supabase
          .from('saved_opportunities')
          .insert({ user_id: user.id, opportunity_id: opportunityId });
        
        if (error) throw error;
        setSavedOpportunityIds(prev => [...prev, opportunityId]);
      }
    } catch (error) {
      console.error('Error toggling save opportunity:', error);
    }
  };

  return (
    <OpportunitiesContext.Provider value={{ 
      opportunities, 
      savedOpportunityIds, 
      isLoading, 
      toggleSaveOpportunity,
      fetchOpportunities
    }}>
      {children}
    </OpportunitiesContext.Provider>
  );
}

export function useOpportunities() {
  const context = useContext(OpportunitiesContext);
  if (!context) throw new Error("useOpportunities must be used within OpportunitiesProvider");
  return context;
}
