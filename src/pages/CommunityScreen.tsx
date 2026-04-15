import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Shield, Award, Info, Share2, Calendar, Search, X } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { ChatSection } from "@/components/mentor-connect/ChatSection";
import { SharedResourcesList } from "@/components/mentor-connect/SharedResourcesList";
import { ResponsiveLayout } from "@/components/mentor-connect/ResponsiveLayout";
import { toast } from "sonner";
import api from "@/lib/api";
import { Community } from "@/lib/types";
import { isCommunityJoined, joinCommunity, leaveCommunity } from "@/lib/community-join";
import { useAuth } from "@/lib/auth-context";

interface MemberPreview {
  id: string;
  name: string;
  avatar: string;
  role: string;
  joinedAt?: string;
}

export default function CommunityScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, getLocalized } = useLanguage();
  const { user } = useAuth();
  const [community, setCommunity] = useState<Community | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("chat");
  const [joined, setJoined] = useState(false);
  const [members, setMembers] = useState<MemberPreview[]>([]);
  const [memberQuery, setMemberQuery] = useState("");

  useEffect(() => {
    const fetchCommunity = async () => {
      if (!id) { setIsLoading(false); return; }
      setIsLoading(true);
      try {
        const res = await api.get("/communities");
        const payload = res.data?.data || [];
        if (Array.isArray(payload)) {
          const found = payload.find((c: any) => (c._id || c.id) === id);
          if (found) {
            const mentor = found.mentor_id || {};
            const mentorName = mentor.name || "Expert";
            const mapped: Community = {
              id: found._id || found.id,
              name: { en: found.name || "", mr: found.name || "" },
              description: { en: found.description || "", mr: found.description || "" },
              members: Array.isArray(found.members) ? found.members.length : Number(found.members || 0),
              image: found.image || mentor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(mentorName)}&background=random`,
              category: found.category || "General",
              recentActivity: found.recentActivity,
              mentorId: mentor._id || mentor,
              mentorName: { en: mentorName, mr: mentorName },
              mentorAvatar: mentor.avatar,
              unread: found.unread || 0,
            };
            setCommunity(mapped);
            if (Array.isArray(found.members)) {
              const mappedMembers: MemberPreview[] = found.members.map((m: any, idx: number) => {
                const mId = m?._id || m?.id || `${idx}`;
                const mName = m?.name || m?.fullName || "Member";
                return {
                  id: String(mId),
                  name: typeof mName === "string" ? mName : (mName?.en || "Member"),
                  avatar: m?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(mName)}&background=random`,
                  role: m?.role || "Student",
                  joinedAt: m?.createdAt ? new Date(m.createdAt).toLocaleDateString() : undefined,
                };
              });
              setMembers(mappedMembers);
            } else {
              setMembers([]);
            }
          } else {
            setCommunity(null);
          }
        } else {
          setCommunity(null);
        }
      } catch (e) {
        console.error("Fetch community failed", e);
        setCommunity(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCommunity();
  }, [id]);

  useEffect(() => {
    setJoined(isCommunityJoined(id));
  }, [id]);

  const filteredMembers = members.filter((member) =>
    member.name.toLowerCase().includes(memberQuery.trim().toLowerCase())
  );

  if (!community && !isLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-muted-foreground gap-4">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
        <Info size={32} />
      </div>
      <p className="font-medium">{t("community.notFound") || "Community not found"}</p>
      <button onClick={() => navigate("/student/communities")} className="text-primary font-bold hover:underline">
        {t("nav.communities") || "Go back to Communities"}
      </button>
    </div>
  );

  if (isLoading || !community) {
    return (
      <ResponsiveLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </ResponsiveLayout>
    );
  }

  const tabs = [
    { key: "chat", label: t("community.tabChat") || "Chat" },
    { key: "meetings", label: t("nav.meetings") || "Meetings" },
    { key: "members", label: t("community.tabMembers") || "Members" },
    { key: "resources", label: t("community.tabResources") || "Resources" },
  ];

  const handleJoin = async () => {
    if (!community?.id) return;
    try {
      await api.post(`/communities/${community.id}/join`);
      joinCommunity(community.id);
      setJoined(true);
      setActiveTab("chat");
      setMemberQuery("");
      setCommunity((prev) => prev ? ({ ...prev, members: prev.members + 1 }) : prev);
      toast.success(t("community.joined") || "Joined community");
      if (user) {
        setMembers((prev) => {
          const exists = prev.some((m) => m.id === user.id);
          if (exists) return prev;
          return [
            {
              id: user.id,
              name: user.name || "You",
              avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "You")}&background=random`,
              role: user.role || "Student",
              joinedAt: new Date().toLocaleDateString(),
            },
            ...prev,
          ];
        });
      }
    } catch (err: any) {
      const message = err?.response?.data?.message;
      if (message === "Already a member") {
        joinCommunity(community.id);
        setJoined(true);
        setActiveTab("chat");
        setMemberQuery("");
        return;
      }
      toast.error(message || "Failed to join community");
    }
  };

  const handleLeave = () => {
    // Custom premium confirm dialog would be better, but native confirm for now
    if (window.confirm(t("community.leaveConfirm") || "Are you sure you want to leave this community?")) {
      if (community?.id) leaveCommunity(community.id);
      setJoined(false);
      toast.success(t("community.leftSuccess") || "Successfully left the community");
      navigate("/student/communities");
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success(t("post.linkCopied") || "Link copied! 📋");
  };

  return (
    <ResponsiveLayout>
      <div className="min-h-screen bg-background pb-20 lg:pb-0 animate-fade-in flex flex-col">
        {/* Header Section */}
        <div className="bg-card border-b border-border/50 shadow-sm sticky top-0 z-30">
          <div className="max-w-5xl mx-auto px-4 py-4 md:py-6">
            <div className="flex items-start md:items-center justify-between gap-4 mb-6">
              <div className="flex items-start md:items-center gap-4 flex-1">
                <button 
                  onClick={() => navigate(-1)} 
                  className="p-2 rounded-xl bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all mt-1 md:mt-0"
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-h2 text-foreground truncate">{getLocalized(community.name)}</h1>
                    <Shield size={18} className="text-primary/60 shrink-0" />
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-caption text-muted-foreground font-medium">
                    <div className="flex items-center gap-1.5 hover:text-primary cursor-pointer transition-colors" onClick={() => community.mentorId && navigate(`/mentor/profile/${community.mentorId}`)}>
                      <img src={community.mentorAvatar || ""} alt="" className="w-5 h-5 rounded-full border border-border" />
                      <span>{getLocalized(community.mentorName || { en: 'Expert', mr: 'तज्ज्ञ' })}</span>
                      <Award size={12} className="text-mentor" />
                    </div>
                    <span className="opacity-30">•</span>
                    <div className="flex items-center gap-1.5">
                      <Users size={14} className="text-primary/60" />
                      <span>{community.members} {t("community.members") || "members"}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleShare}
                  className="p-2.5 rounded-xl bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all hidden md:flex"
                  title="Share Community"
                >
                  <Share2 size={18} />
                </button>
                {joined ? (
                  <button 
                    onClick={handleLeave} 
                    className="px-4 py-2 rounded-xl border border-destructive/20 text-destructive text-caption font-bold hover:bg-destructive/5 transition-all"
                  >
                    {t("community.leave") || "Leave"}
                  </button>
                ) : (
                  <button 
                    onClick={handleJoin} 
                    className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-caption font-bold hover:brightness-110 transition-all"
                  >
                    Join Community
                  </button>
                )}
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-1 -mb-4 overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => (
                <button 
                  key={tab.key} 
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative px-5 py-3 text-body font-bold transition-all whitespace-nowrap rounded-t-xl ${
                    activeTab === tab.key 
                      ? "text-primary bg-primary/5 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-1 after:bg-primary" 
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full">
          <div className="flex-1 p-4 md:p-6">
            {activeTab === "chat" && <ChatSection communityId={community.id} />}
            
            {activeTab === "meetings" && (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 animate-fade-in">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center shadow-inner">
                  <Award size={40} className="text-muted-foreground opacity-20" />
                </div>
                <div>
                  <h3 className="text-h3 font-bold text-foreground">
                    Mentorship Meetings
                  </h3>
                  <p className="text-body text-muted-foreground max-w-sm mx-auto mt-1">
                    Book 1:1 sessions or group calls directly with your community mentor. Feature coming soon!
                  </p>
                </div>
              </div>
            )}
            
            {activeTab === "members" && (
              joined ? (
                <div className="space-y-4 animate-fade-in">
                  <div className="relative group">
                    <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                      value={memberQuery}
                      onChange={(e) => setMemberQuery(e.target.value)}
                      placeholder={t("members.searchPlaceholder") || "Search members by name..."}
                      className="w-full pl-12 pr-10 py-4 rounded-2xl border border-border bg-card text-foreground text-body focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all shadow-sm"
                    />
                    {memberQuery && (
                      <button
                        onClick={() => setMemberQuery("")}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted text-muted-foreground"
                        type="button"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>

                  {filteredMembers.length > 0 ? (
                    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                      <div className="grid grid-cols-12 gap-3 px-4 py-3 bg-muted/40 text-caption font-bold text-muted-foreground uppercase tracking-widest">
                        <div className="col-span-7 md:col-span-6">{t("members.name") || "Name"}</div>
                        <div className="col-span-3 md:col-span-3">{t("members.role") || "Role"}</div>
                        <div className="col-span-2 md:col-span-3">{t("members.joined") || "Joined"}</div>
                      </div>
                      <div className="divide-y divide-border">
                        {filteredMembers.map((m) => (
                          <div key={m.id} className="grid grid-cols-12 gap-3 px-4 py-3 items-center">
                            <div className="col-span-7 md:col-span-6 flex items-center gap-3 min-w-0">
                              <img src={m.avatar} alt={m.name} className="w-10 h-10 rounded-xl object-cover border border-border" />
                              <div className="min-w-0">
                                <div className="font-bold text-body text-foreground truncate">{m.name}</div>
                                <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                                  <Shield size={12} className="text-primary/40" />
                                  {t("community.member") || "Member"}
                                </div>
                              </div>
                            </div>
                            <div className="col-span-3 md:col-span-3 text-caption text-muted-foreground">
                              {m.role}
                            </div>
                            <div className="col-span-2 md:col-span-3 text-caption text-muted-foreground flex items-center gap-1.5">
                              <Calendar size={14} className="text-primary/70 shrink-0" />
                              <span className="truncate">{m.joinedAt || "-"}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : members.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 animate-fade-in">
                      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center shadow-inner">
                        <Users size={40} className="text-muted-foreground opacity-20" />
                      </div>
                      <div>
                        <h3 className="text-h3 font-bold text-foreground">
                          {t("community.memberListSoon") || "No members yet"}
                        </h3>
                        <p className="text-body text-muted-foreground max-w-sm mx-auto mt-1">
                          {t("community.memberListSoonDesc") || "Be the first to say hello in the chat."}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-60">
                      <Users size={48} className="text-muted-foreground/30" />
                      <p className="text-body font-bold text-muted-foreground">
                        {t("members.noMatch") || "No members matched your search"}
                      </p>
                      <button onClick={() => setMemberQuery("")} className="text-primary font-bold hover:underline">
                        Clear Search
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 animate-fade-in">
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center shadow-inner">
                    <Users size={40} className="text-muted-foreground opacity-20" />
                  </div>
                  <div>
                    <h3 className="text-h3 font-bold text-foreground">
                      {t("community.memberListSoon") || "Join to view members"}
                    </h3>
                    <p className="text-body text-muted-foreground max-w-sm mx-auto mt-1">
                      {t("community.memberListSoonDesc") || "Join the community to see member details."}
                    </p>
                  </div>
                  <button
                    onClick={handleJoin}
                    className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-caption hover:brightness-110 transition-all"
                  >
                    Join Community
                  </button>
                </div>
              )
            )}
            
            {activeTab === "resources" && (
              <div className="animate-fade-in">
                <SharedResourcesList communityId={community.id} />
              </div>
            )}
          </div>
        </div>
      </div>
    </ResponsiveLayout>
  );
}
