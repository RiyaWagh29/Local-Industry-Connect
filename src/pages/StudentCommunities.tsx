import { CommunityCard } from "@/components/mentor-connect/CommunityCard";
import { ResponsiveLayout } from "@/components/mentor-connect/ResponsiveLayout";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import api from "@/lib/api";
import { Community } from "@/lib/types";
import { getJoinedCommunityIds } from "@/lib/community-join";

export default function StudentCommunities() {
  const { t, getLocalized } = useLanguage();
  const { user } = useAuth();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [joinedIds, setJoinedIds] = useState<string[]>([]);
  const [showAllJoined, setShowAllJoined] = useState(false);
  const [query, setQuery] = useState("");
  const safeCommunities = Array.isArray(communities) ? communities : [];
  const queryLower = query.trim().toLowerCase();
  const matchesCommunitySearch = (community: Community) => {
    if (!queryLower) return true;
    const communityName = getLocalized(community.name).toLowerCase();
    const mentorName = getLocalized(community.mentorName || { en: "", mr: "" }).toLowerCase();
    return communityName.includes(queryLower) || mentorName.includes(queryLower);
  };
  const filteredCommunities = safeCommunities.filter(matchesCommunitySearch);
  const joinedCommunities = filteredCommunities.filter((c) => joinedIds.includes(c.id));
  const visibleJoinedCommunities = showAllJoined ? joinedCommunities : joinedCommunities.slice(0, 3);
  const isMentorView = user?.role === "mentor";

  useEffect(() => {
    const fetchCommunities = async () => {
      setIsLoading(true);
      try {
        const res = await api.get("/communities");
        const payload = res.data?.data || [];
        if (Array.isArray(payload)) {
          const mapped: Community[] = payload.map((c: any) => {
            const mentor = c.mentor_id || {};
            const mentorName = mentor.name || "Expert";
            return {
              id: c._id || c.id,
              name: { en: c.name || "", mr: c.name || "" },
              description: { en: c.description || "", mr: c.description || "" },
              members: Array.isArray(c.members) ? c.members.length : Number(c.members || 0),
              image: c.image || mentor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(mentorName)}&background=random`,
              category: c.category || "General",
              recentActivity: c.recentActivity,
              mentorId: mentor._id || mentor,
              mentorName: { en: mentorName, mr: mentorName },
              mentorAvatar: mentor.avatar,
              unread: c.unread || 0,
            };
          });
          setCommunities(mapped);
        } else {
          setCommunities([]);
        }
      } catch (e) {
        console.error("Fetch communities failed", e);
        setCommunities([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCommunities();
  }, []);

  useEffect(() => {
    const syncJoined = () => setJoinedIds(getJoinedCommunityIds());
    syncJoined();
    window.addEventListener("storage", syncJoined);
    return () => window.removeEventListener("storage", syncJoined);
  }, []);

  return (
    <ResponsiveLayout>
      <div className="min-h-screen bg-background pb-20 lg:pb-8">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          <h1 className="text-h2 text-foreground">{t("home.communitiesSection")}</h1>
          <div className="relative group">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search communities or mentors..."
              className="w-full pl-12 pr-10 py-4 rounded-2xl border border-border bg-card text-foreground text-body focus:ring-4 focus:ring-primary/10 transition-all outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted text-muted-foreground"
                type="button"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-caption font-bold text-muted-foreground uppercase tracking-widest">
                  {t("home.yourCommunities") || "your communities"}
                </h2>
                {!isLoading && joinedCommunities.length > 3 && (
                  <button
                    type="button"
                    onClick={() => setShowAllJoined((prev) => !prev)}
                    className="text-caption font-bold text-primary hover:underline"
                  >
                    {showAllJoined ? "Show Less" : (t("seeAll") || "See All")}
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 gap-3">
                {isLoading ? (
                  [...Array(2)].map((_, i) => (
                    <div key={i} className="h-24 bg-muted animate-pulse rounded-2xl" />
                  ))
                ) : joinedCommunities.length > 0 ? (
                  visibleJoinedCommunities.map((c) => (
                    <CommunityCard key={`joined-${c.id}`} community={c} />
                  ))
                ) : (
                  <div className="col-span-full py-12 border border-dashed border-border rounded-3xl flex flex-col items-center justify-center text-center space-y-3 bg-muted/20">
                    <p className="text-muted-foreground font-medium">
                      {isMentorView ? "You have not joined any communities yet" : (t("home.noJoinedCommunities") || "No Joined Communities")}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-caption font-bold text-muted-foreground uppercase tracking-widest">
                All Communities
              </h2>
              <div className="grid grid-cols-1 gap-3">
                {isLoading ? (
                  [...Array(4)].map((_, i) => (
                    <div key={i} className="h-24 bg-muted animate-pulse rounded-2xl" />
                  ))
                ) : filteredCommunities.length > 0 ? (
                  filteredCommunities.map((c) => (
                    <CommunityCard key={c.id} community={c} />
                  ))
                ) : (
                  <div className="col-span-full py-20 border border-dashed border-border rounded-3xl flex flex-col items-center justify-center text-center space-y-3 bg-muted/20">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-2xl font-bold opacity-20">🏙️</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">No communities found</h3>
                      <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                        New professional communities in Nashik will be listed here soon.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ResponsiveLayout>
  );
}
