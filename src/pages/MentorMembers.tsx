import { useEffect, useMemo, useState } from "react";
import { ResponsiveLayout } from "@/components/mentor-connect/ResponsiveLayout";
import { Users, Calendar, MessageSquare, UserMinus, Shield, Search, X, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { toast } from "sonner";
import { LocalizedString } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";

interface Member {
  id: string;
  name: LocalizedString;
  avatar: string;
  joined: LocalizedString;
  role?: string;
}

interface CommunitySummary {
  id: string;
  name: LocalizedString;
  members: Member[];
  membersCount: number;
  image?: string;
}

export default function MentorMembers() {
  const { t, getLocalized } = useLanguage();
  const { user } = useAuth();
  const [communities, setCommunities] = useState<CommunitySummary[]>([]);
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const handleRemove = (id: string, name: string) => {
    if (window.confirm(`${t("community.leaveConfirm") || "Are you sure you want to remove this member?"}`)) {
      setMembers((prev) => prev.filter((m) => m.id !== id));
      toast.success(t("community.leftSuccess") || "Member removed successfully");
    }
  };

  useEffect(() => {
    const fetchMembers = async () => {
      if (!user?.id) return;
      setIsLoading(true);
      try {
        const res = await api.get(`/communities/mentor/${user.id}`);
        const payload = res.data?.data || [];
        if (!Array.isArray(payload)) {
          setCommunities([]);
          return;
        }

        const mappedCommunities: CommunitySummary[] = payload.map((community: any) => {
          const communityMembers = Array.isArray(community.members) ? community.members : [];
          const members: Member[] = communityMembers.map((m: any, idx: number) => {
            const memberId = String(m?._id || m?.id || `${community._id || "community"}-${idx}`);
            const memberName = m?.name || "Member";
            const createdAt = m?.createdAt ? new Date(m.createdAt).toLocaleDateString() : "";
            return {
              id: memberId,
              name: { en: memberName, mr: memberName },
              avatar: m?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(memberName)}&background=random`,
              joined: { en: createdAt || "—", mr: createdAt || "—" },
              role: m?.role || "Student",
            };
          });

          return {
            id: String(community._id || community.id),
            name: { en: community.name || "", mr: community.name || "" },
            members,
            membersCount: members.length,
            image: community.image,
          };
        });

        setCommunities(mappedCommunities);
      } catch (e) {
        console.error("Fetch mentor members failed", e);
        setCommunities([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, [user?.id]);

  const selectedCommunity = useMemo(
    () => communities.find((c) => c.id === selectedCommunityId) || null,
    [communities, selectedCommunityId]
  );

  const filteredMembers = useMemo(() => {
    if (!selectedCommunity) return [];
    return selectedCommunity.members.filter(m => 
      getLocalized(m.name).toLowerCase().includes(query.toLowerCase())
    );
  }, [selectedCommunity, getLocalized, query]);

  const totalMembers = useMemo(
    () => communities.reduce((sum, c) => sum + c.membersCount, 0),
    [communities]
  );

  return (
    <ResponsiveLayout>
      <div className="min-h-screen bg-background pb-20 lg:pb-8 animate-fade-in">
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-h1 text-foreground tracking-tight">
                {t("members.title") || "Community Members"}
              </h1>
              <p className="text-body text-muted-foreground">
                {selectedCommunity
                  ? `${t("community.members") || "Members"} • ${getLocalized(selectedCommunity.name)}`
                  : (t("members.subtitle") || "Manage and interact with the students in your Nashik community.")}
              </p>
            </div>
            <div className="flex items-center gap-3 bg-mentor/10 text-mentor px-5 py-2.5 rounded-2xl font-bold self-start md:self-auto">
              <Users size={20} />
              <span>
                {selectedCommunity ? selectedCommunity.membersCount : totalMembers}{" "}
                {t("community.members") || "Members"}
              </span>
            </div>
          </div>

          {selectedCommunity ? (
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <button
                onClick={() => { setSelectedCommunityId(null); setQuery(""); }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-all"
              >
                <ArrowLeft size={16} />
                {t("back") || "Back to communities"}
              </button>
              <div className="relative group flex-1">
                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-mentor transition-colors" />
                <input 
                  value={query} 
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("members.searchPlaceholder") || "Search members by name..."}
                  className="w-full pl-12 pr-10 py-4 rounded-2xl border border-border bg-card text-foreground text-body focus:ring-4 focus:ring-mentor/10 focus:border-mentor outline-none transition-all shadow-sm" 
                />
                {query && (
                  <button onClick={() => setQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted text-muted-foreground">
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
          ) : null}

          {!selectedCommunity && (
            <div className="space-y-3">
              {communities.map((c) => (
                <button
                  key={c.id}
                  onClick={() => { setSelectedCommunityId(c.id); setQuery(""); }}
                  className="w-full text-left group bg-card rounded-2xl border border-border shadow-sm hover:shadow-md transition-all duration-200 px-5 py-4 flex items-center gap-4"
                >
                  <div className="relative">
                    <img
                      src={c.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(getLocalized(c.name) || "Community")}&background=random`}
                      alt={getLocalized(c.name)}
                      className="w-14 h-14 rounded-2xl object-cover border border-border group-hover:border-mentor/30 transition-colors"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-body text-foreground truncate group-hover:text-mentor transition-colors">
                        {getLocalized(c.name)}
                      </h4>
                      <Shield size={14} className="text-primary/40 shrink-0" />
                    </div>
                    <p className="text-caption text-muted-foreground mt-0.5">
                      {c.membersCount} {t("community.members") || "Members"}
                    </p>
                  </div>

                  <div className="text-caption font-bold text-mentor bg-mentor/10 px-3 py-1.5 rounded-xl">
                    {t("community.view") || "View All Members"}
                  </div>
                </button>
              ))}
            </div>
          )}

          {selectedCommunity && (
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="grid grid-cols-12 gap-3 px-4 py-3 bg-muted/40 text-caption font-bold text-muted-foreground uppercase tracking-widest">
                <div className="col-span-6 md:col-span-5">{t("members.name") || "Name"}</div>
                <div className="col-span-3 md:col-span-3">{t("members.role") || "Role"}</div>
                <div className="col-span-3 md:col-span-2">{t("members.joined") || "Joined"}</div>
                <div className="col-span-12 md:col-span-2 text-right">{t("members.actions") || "Actions"}</div>
              </div>
              <div className="divide-y divide-border">
                {filteredMembers.map((m) => {
                  const name = getLocalized(m.name);
                  const joined = getLocalized(m.joined);
                  return (
                    <div key={m.id} className="grid grid-cols-12 gap-3 px-4 py-3 items-center">
                      <div className="col-span-6 md:col-span-5 flex items-center gap-3 min-w-0">
                        <img src={m.avatar} alt={name} className="w-10 h-10 rounded-xl object-cover border border-border" />
                        <div className="min-w-0">
                          <div className="font-bold text-body text-foreground truncate">{name}</div>
                          <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Shield size={12} className="text-primary/40" />
                            {t("community.member") || "Member"}
                          </div>
                        </div>
                      </div>
                      <div className="col-span-3 md:col-span-3 text-caption text-muted-foreground">
                        {m.role || "Student"}
                      </div>
                      <div className="col-span-3 md:col-span-2 text-caption text-muted-foreground flex items-center gap-1.5">
                        <Calendar size={14} className="text-mentor" />
                        {joined}
                      </div>
                      <div className="col-span-12 md:col-span-2 flex justify-end gap-2">
                        <button 
                          onClick={() => toast.info(`Chatting with ${name}...`)}
                          className="px-3 py-2 rounded-xl bg-mentor/10 text-mentor hover:bg-mentor hover:text-white transition-all text-caption font-bold"
                          title="Message Member"
                        >
                          <MessageSquare size={16} />
                        </button>
                        <button 
                          onClick={() => handleRemove(m.id, name)} 
                          className="px-3 py-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all text-caption font-bold"
                          title="Remove Member"
                        >
                          <UserMinus size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {selectedCommunity && !isLoading && selectedCommunity.members.length === 0 && !query && (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-60">
              <Users size={48} className="text-muted-foreground/30" />
              <p className="text-body font-bold text-muted-foreground">
                {t("community.memberListSoon") || "No members yet"}
              </p>
            </div>
          )}

          {(selectedCommunity && filteredMembers.length === 0 && query && !isLoading) && (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-60">
              <Users size={48} className="text-muted-foreground/30" />
              <p className="text-body font-bold text-muted-foreground">{t("members.noMatch") || "No members matched your search"}</p>
              <button onClick={() => setQuery("")} className="text-mentor font-bold hover:underline">Clear Search</button>
            </div>
          )}
          
          {communities.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-60">
              <Users size={48} className="text-muted-foreground/30" />
              <p className="text-body font-bold text-muted-foreground">{t("members.comingSoon")}</p>
            </div>
          )}

          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-muted animate-pulse rounded-3xl" />
              ))}
            </div>
          )}
        </div>
      </div>
    </ResponsiveLayout>
  );
}
