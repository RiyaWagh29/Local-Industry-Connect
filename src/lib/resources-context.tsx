import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import api from "./api";
import { useAuth } from "./auth-context";
import { SharedResource, LocalizedString } from "./types";

interface ResourcesContextType {
  resources: SharedResource[];
  isLoading: boolean;
  fetchResources: () => Promise<void>;
}

const ResourcesContext = createContext<ResourcesContextType | undefined>(undefined);

export function ResourcesProvider({ children }: { children: ReactNode }) {
  const [resources, setResources] = useState<SharedResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, isInitialized } = useAuth();

  const fetchResources = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const res = await api.get("/resources");
      // Pattern: payload = res.data?.data || res.data?.user || []
      const payload = res.data?.data || res.data?.user || [];
      
      const ensureLoc = (val: any): LocalizedString => {
        if (typeof val === 'string') return { en: val, mr: val };
        if (val && typeof val === 'object' && val.en) return val;
        return { en: "", mr: "" };
      };

      if (Array.isArray(payload)) {
        const mapped: SharedResource[] = payload.map((r: any) => ({
          id: r._id || r.id,
          title: ensureLoc(r.title),
          description: ensureLoc(r.description || ""),
          type: r.type || "link",
          url: r.url || "#",
          sharedBy: ensureLoc(r.sharedBy?.name || "Mentor"),
          sharedDate: ensureLoc(new Date(r.createdAt || Date.now()).toLocaleDateString())
        }));
        setResources(mapped);
      } else {
        setResources([]);
      }
    } catch (err) {
      console.warn("Resources fetch failed", err);
      setResources([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isInitialized) {
      if (isAuthenticated) fetchResources();
      else { setResources([]); setIsLoading(false); }
    }
  }, [isInitialized, isAuthenticated, fetchResources]);

  return (
    <ResourcesContext.Provider value={{ resources, isLoading, fetchResources }}>
      {children}
    </ResourcesContext.Provider>
  );
}

export function useResources() {
  const context = useContext(ResourcesContext);
  if (!context) throw new Error("useResources must be used within ResourcesProvider");
  return context;
}