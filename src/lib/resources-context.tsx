import { createContext, useContext, useState, ReactNode } from "react";
import { sharedResources as initialResources, SharedResource } from "./mock-data";

interface ResourcesContextType {
  resources: SharedResource[];
  addResource: (resource: Omit<SharedResource, "id" | "sharedDate" | "sharedBy">, authorName: string) => void;
}

const ResourcesContext = createContext<ResourcesContextType | undefined>(undefined);

const STORAGE_KEY = "mc_resources";

function loadResources(): SharedResource[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : initialResources;
  } catch {
    return initialResources;
  }
}

function saveResources(resources: SharedResource[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(resources));
}

export function ResourcesProvider({ children }: { children: ReactNode }) {
  const [resources, setResources] = useState<SharedResource[]>(loadResources);

  const addResource = (resource: Omit<SharedResource, "id" | "sharedDate" | "sharedBy">, authorName: string) => {
    const newResource: SharedResource = {
      ...resource,
      id: `r_${Date.now()}`,
      sharedBy: authorName,
      sharedDate: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
    };
    setResources((prev) => {
      const updated = [newResource, ...prev];
      saveResources(updated);
      return updated;
    });
  };

  return (
    <ResourcesContext.Provider value={{ resources, addResource }}>
      {children}
    </ResourcesContext.Provider>
  );
}

export function useResources() {
  const ctx = useContext(ResourcesContext);
  if (!ctx) throw new Error("useResources must be used within ResourcesProvider");
  return ctx;
}
