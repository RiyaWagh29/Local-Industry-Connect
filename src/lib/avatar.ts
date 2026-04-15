export function getInitials(name?: string | null) {
  const safeName = (name || "").trim();
  if (!safeName) return "MC";

  const parts = safeName.split(/\s+/).filter(Boolean);
  const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() || "").join("");
  return initials || "MC";
}

export function getAvatarUrl(name?: string | null, avatar?: string | null) {
  const safeAvatar = (avatar || "").trim();
  if (safeAvatar) return safeAvatar;

  const initials = getInitials(name);
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=random&color=ffffff&size=256&bold=true`;
}
