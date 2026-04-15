const STORAGE_KEY = "joinedCommunityIds";

const readIds = (): string[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
};

const writeIds = (ids: string[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
};

export const getJoinedCommunityIds = (): string[] => readIds();

export const isCommunityJoined = (id?: string): boolean => {
  if (!id) return false;
  return readIds().includes(id);
};

export const joinCommunity = (id?: string) => {
  if (!id) return;
  const ids = readIds();
  if (!ids.includes(id)) {
    ids.push(id);
    writeIds(ids);
  }
};

export const leaveCommunity = (id?: string) => {
  if (!id) return;
  const ids = readIds().filter((storedId) => storedId !== id);
  writeIds(ids);
};
