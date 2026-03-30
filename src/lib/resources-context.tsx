import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";
import { supabase } from "./supabase";
import { SharedResource } from "./types";

interface ResourcesContextType {
  resources: SharedResource[];
  isLoading: boolean;
  addResource: (resource: Omit<SharedResource, "id" | "sharedDate" | "sharedBy">, authorName: string) => Promise<void>;
}

const ResourcesContext = createContext<ResourcesContextType | undefined>(undefined);

export function ResourcesProvider({ children }: { children: ReactNode }) {
  const [resources, setResources] = useState<SharedResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchResources = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mapped: SharedResource[] = data.map(r => ({
        id: r.id,
        title: r.title,
        type: r.type,
        url: r.url,
        sharedBy: { en: r.shared_by_en || r.shared_by || 'Mentor', mr: r.shared_by_mr || r.shared_by || 'मार्गदर्शक' },
        sharedDate: { 
          en: new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
          mr: new Date(r.created_at).toLocaleDateString("mr-IN", { day: "numeric", month: "long", year: "numeric" })
        },
        description: r.description
      }));

      setResources(mapped);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const addResource = async (resource: Omit<SharedResource, "id" | "sharedDate" | "sharedBy">, authorName: string) => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .insert({
          title: resource.title,
          description: resource.description,
          type: resource.type,
          url: resource.url,
          shared_by: authorName,
          // We assume for simplicity in this phase that the author name is stored as-is
        })
        .select()
        .single();

      if (error) throw error;

      const newResource: SharedResource = {
        id: data.id,
        title: data.title,
        type: data.type,
        url: data.url,
        sharedBy: { en: authorName, mr: authorName }, // Simplified mapping
        sharedDate: { 
          en: new Date(data.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
          mr: new Date(data.created_at).toLocaleDateString("mr-IN", { day: "numeric", month: "long", year: "numeric" })
        },
        description: data.description
      };

      setResources((prev) => [newResource, ...prev]);
    } catch (error) {
      console.error('Error adding resource:', error);
      throw error;
    }
  };

  return (
    <ResourcesContext.Provider value={{ resources, isLoading, addResource }}>
      {children}
    </ResourcesContext.Provider>
  );
}

export function useResources() {
  const ctx = useContext(ResourcesContext);
  if (!ctx) throw new Error("useResources must be used within ResourcesProvider");
  return ctx;
}
