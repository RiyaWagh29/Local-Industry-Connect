import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import api from "./api";
import { useAuth } from "./auth-context";
import { SharedResource, LocalizedString } from "./types";

interface ResourcesContextType {
  resources: SharedResource[];
  isLoading: boolean;
  fetchResources: () => Promise<void>;
  addResource: (
    resource:
      | (Pick<SharedResource, "title" | "description" | "type" | "url"> & { tags?: string[]; communityId?: string })
      | FormData,
    authorName?: string
  ) => Promise<void>;
}

const ResourcesContext = createContext<ResourcesContextType | undefined>(undefined);

export function ResourcesProvider({ children }: { children: ReactNode }) {
  const [resources, setResources] = useState<SharedResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, isInitialized } = useAuth();

  const ensureLoc = (val: unknown): LocalizedString => {
    if (typeof val === 'string') return { en: val, mr: val };
    if (val && typeof val === 'object' && 'en' in val) return val as LocalizedString;
    return { en: "", mr: "" };
  };

  const fetchResources = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const res = await api.get("/resources");
      // Pattern: payload = res.data?.data || res.data?.user || []
      const payload = res.data?.data || res.data?.user || [];
      
      if (Array.isArray(payload)) {
        const mapped: SharedResource[] = payload.map((r: Record<string, unknown>) => ({
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

  const addResource = useCallback(async (
    resource:
      | (Pick<SharedResource, "title" | "description" | "type" | "url"> & { tags?: string[]; communityId?: string })
      | FormData,
    authorName?: string
  ) => {
    const res = resource instanceof FormData
      ? await api.post("/resources", resource, {
          headers: { "Content-Type": "multipart/form-data" },
        })
      : await api.post("/resources", resource);
    const created = res.data?.data;

    if (created) {
      const sharedByName = authorName || created.sharedBy?.name || "Mentor";
      const fallbackTitle = resource instanceof FormData ? resource.get("title") : resource.title;
      const fallbackDescription = resource instanceof FormData ? resource.get("description") : resource.description;
      const fallbackType = resource instanceof FormData ? resource.get("type") : resource.type;
      const fallbackUrl = resource instanceof FormData ? resource.get("url") : resource.url;
      const mapped: SharedResource = {
        id: created._id || created.id,
        title: ensureLoc(created.title || fallbackTitle),
        description: ensureLoc(created.description || fallbackDescription),
        type: created.type || fallbackType || "link",
        url: created.url || fallbackUrl || "#",
        sharedBy: ensureLoc(sharedByName),
        sharedDate: ensureLoc(new Date(created.sharedDate || created.createdAt || Date.now()).toLocaleDateString()),
      };
      setResources((prev) => [mapped, ...prev]);
    } else {
      await fetchResources();
    }
  }, [fetchResources, ensureLoc]);

  useEffect(() => {
    if (isInitialized) {
      if (isAuthenticated) fetchResources();
      else { setResources([]); setIsLoading(false); }
    }
  }, [isInitialized, isAuthenticated, fetchResources]);

  return (
    <ResourcesContext.Provider value={{ resources, isLoading, fetchResources, addResource }}>
      {children}
    </ResourcesContext.Provider>
  );
}

export function useResources() {
  const context = useContext(ResourcesContext);
  if (!context) throw new Error("useResources must be used within ResourcesProvider");
  return context;
}
