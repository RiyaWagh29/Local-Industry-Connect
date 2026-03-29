import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Users, UserPlus, MessageSquare, Award, Star, Briefcase, ChevronRight, Check, Info } from "lucide-react";
import { mentors, opportunities } from "@/lib/mock-data";
import { useLanguage } from "@/lib/language-context";
import { useMessages } from "@/lib/messages-context";
import { SkillTag } from "@/components/mentor-connect/SkillTag";
import { ResponsiveLayout } from "@/components/mentor-connect/ResponsiveLayout";
import { toast } from "sonner";

export default function PublicMentorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, getLocalized } = useLanguage();
  const { startConversation } = useMessages();
  const mentor = mentors.find((m) => m.id === id);
  const [activeTab, setActiveTab] = useState("about");
  const [following, setFollowing] = useState(false);

  if (!mentor) return (
    <ResponsiveLayout>
      <div className="min-h-screen flex flex-col items-center justify-center text-muted-foreground gap-4">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <Award size={32} />
        </div>
        <p className="font-medium">{t("mentor.profile.notFound") || "Mentor not found"}</p>
        <button onClick={() => navigate("/student/explore")} className="btn-ghost">
          {t("nav.explore") || "Back to Explore"}
        </button>
      </div>
    </ResponsiveLayout>
  );

  const mentorOpps = opportunities.filter((o) => o.mentorId === mentor.id);
  const tabs = [
    { key: "about", label: t("mentor.profile.tabAbout") || "About" },
    { key: "skills", label: t("mentor.profile.tabSkills") || "Skills" },
    { key: "opportunities", label: t("mentor.profile.tabOpportunities") || "Opportunities" },
    { key: "reviews", label: t("mentor.profile.tabReviews") || "Reviews" },
  ];

  const handleFollow = () => {
    setFollowing(!following);
    toast.success(following ? t("mentor.profile.unfollowed") || "Unfollowed" : t("mentor.profile.followedSuccess") || "Followed successfully!");
  };

  const handleJoinCommunity = () => {
    toast.success(t("mentor.profile.joinedCommunity", { name: getLocalized(mentor.name) }));
    navigate("/student/communities");
  };

  const handleMessage = () => {
    startConversation({ 
      id: mentor.id, 
      name: getLocalized(mentor.name), 
      avatar: mentor.avatar 
    } as any);
    navigate(`/messages/${mentor.id}`);
  };

  const name = getLocalized(mentor.name);
  const role = getLocalized(mentor.role);
  const bio = getLocalized(mentor.bio);
  const guidance = getLocalized(mentor.guidance);

  return (
    <ResponsiveLayout>
      <div className="min-h-screen bg-background pb-20 lg:pb-8 animate-fade-in">
        {/* Cover Image */}
        <div className="relative h-48 md:h-64 lg:h-72 w-full overflow-hidden">
          <img src={mentor.coverImage} alt="" className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <button 
            onClick={() => navigate(-1)} 
            className="absolute top-6 left-6 w-10 h-10 rounded-xl bg-card/90 backdrop-blur shadow-lg flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-all active:scale-95"
          >
            <ArrowLeft size={20} />
          </button>
        </div>

        {/* Profile Content */}
        <div className="max-w-4xl mx-auto px-4 -mt-20 relative z-10">
          <div className="bg-card rounded-3xl border border-border shadow-2xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="flex flex-col md:flex-row md:items-end gap-6">
                <div className="relative">
                  <img 
                    src={mentor.avatar} 
                    alt={name} 
                    className="w-32 h-32 rounded-3xl border-4 border-card object-cover shadow-xl" 
                  />
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 border-4 border-card rounded-full shadow-lg" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-h1 text-foreground leading-tight">{name}</h1>
                    <Award size={24} className="text-primary" />
                  </div>
                  <p className="text-body font-medium text-muted-foreground">{role}</p>
                  <p className="text-caption font-bold text-primary uppercase tracking-widest">{mentor.company}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={handleMessage}
                  className="btn-outline border-transparent bg-mentor/10 text-mentor hover:bg-mentor hover:text-white"
                  title="Send Message"
                >
                  <MessageSquare size={22} />
                </button>
                <button 
                  onClick={handleJoinCommunity}
                  className="btn-primary"
                >
                  <Users size={20} />
                  {t("mentor.profile.joinCommunity") || "Join Community"}
                </button>
              </div>
            </div>

            <div className="flex gap-10 mt-10 pt-8 border-t border-border/50">
              <div className="text-center group cursor-default">
                <span className="block text-h2 text-foreground font-bold group-hover:text-primary transition-colors">{mentor.followers}</span>
                <p className="text-v-small font-bold text-muted-foreground uppercase tracking-wider">Followers</p>
              </div>
              <div className="text-center group cursor-default">
                <span className="block text-h2 text-foreground font-bold group-hover:text-primary transition-colors">{mentor.communities}</span>
                <p className="text-v-small font-bold text-muted-foreground uppercase tracking-wider">Communities</p>
              </div>
              <div className="text-center group cursor-default">
                <span className="block text-h2 text-foreground font-bold group-hover:text-primary transition-colors">{mentor.posts}</span>
                <p className="text-v-small font-bold text-muted-foreground uppercase tracking-wider">Posts</p>
              </div>
            </div>

            <div className="flex gap-2 mt-10 px-1 border-b border-border/50 overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => (
                <button 
                  key={tab.key} 
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative px-6 py-3 text-body font-bold transition-all whitespace-nowrap rounded-t-xl ${
                    activeTab === tab.key 
                      ? "text-primary bg-primary/5 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-1 after:bg-primary" 
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="py-8 min-h-[300px]">
              {activeTab === "about" && (
                <div className="space-y-8 animate-fade-in">
                  <div className="space-y-4">
                    <h3 className="text-h3 font-bold text-foreground flex items-center gap-2">
                       <Info size={20} className="text-primary" /> {t("mentor.profile.tabAbout") || "Biography"}
                    </h3>
                    <p className="text-body text-foreground leading-relaxed bg-muted/30 p-5 rounded-2xl italic">
                      "{bio}"
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-card border border-border p-5 rounded-2xl shadow-sm">
                      <span className="text-caption font-bold text-muted-foreground uppercase tracking-widest">{t("mentor.profile.experience") || "Experience"}</span>
                      <p className="text-h3 text-foreground font-bold mt-1">{mentor.experience} {t("mentor.profile.years") || "Years"}</p>
                    </div>
                    <div className="bg-card border border-border p-5 rounded-2xl shadow-sm">
                      <span className="text-caption font-bold text-muted-foreground uppercase tracking-widest">{t("mentor.profile.industry") || "Industry"}</span>
                      <p className="text-h3 text-foreground font-bold mt-1">{mentor.industry}</p>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4">
                    <h3 className="text-h3 font-bold text-foreground flex items-center gap-2">
                       <Star size={20} className="text-primary" /> {t("mentor.profile.guidance") || "Guidance Area"}
                    </h3>
                    <p className="text-body text-foreground leading-relaxed bg-primary/5 p-5 rounded-2xl border border-primary/10">
                      {guidance}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "skills" && (
                <div className="flex flex-wrap gap-3 animate-fade-in">
                  {mentor.skills.map((s) => (
                    <div key={s} className="px-5 py-2.5 rounded-2xl bg-card border border-border text-body font-bold text-foreground shadow-sm hover:border-primary/50 transition-colors flex items-center gap-2">
                      <Check size={16} className="text-primary" />
                      {s}
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "opportunities" && (
                <div className="space-y-6 animate-fade-in">
                  {mentorOpps.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {mentorOpps.map((o) => (
                        <div key={o.id} className="group p-5 bg-card rounded-2xl border border-border hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                              <Briefcase size={20} />
                            </div>
                            <h4 className="font-bold text-body text-foreground group-hover:text-primary transition-colors">{getLocalized(o.title)}</h4>
                          </div>
                          <p className="text-caption text-muted-foreground font-medium mb-3">{o.company} · {getLocalized(o.location)}</p>
                          <div className="flex items-center justify-between">
                            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-extrabold uppercase tracking-widest leading-none">
                              {o.type}
                            </span>
                            <span className="text-caption font-bold text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                              {t("view") || "View"} <ChevronRight size={14} />
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center opacity-60">
                      <Briefcase size={40} className="mb-2" />
                      <p className="text-body font-bold">{t("mentor.profile.noOpportunities") || "No current opportunities"}</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "reviews" && (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 animate-fade-in opacity-60">
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                    <Star size={40} className="text-muted-foreground" />
                  </div>
                  <h3 className="text-body font-bold text-foreground">
                    {t("mentor.profile.noReviews") || "No reviews yet"}
                  </h3>
                </div>
              )}
            </div>
          </div>

          <button 
            onClick={handleFollow}
            className={`w-full mt-8 py-5 rounded-3xl text-body font-extrabold flex items-center justify-center gap-3 shadow-xl transition-all active:scale-[0.98] ${
              following 
                ? "bg-muted text-foreground border border-border shadow-none" 
                : "bg-white text-primary border-4 border-primary hover:bg-primary hover:text-white"
            }`}
          >
            <UserPlus size={22} />
            {following ? t("mentor.profile.following") || "Following" : t("mentor.profile.follow") || "Follow Mentor"}
          </button>
        </div>
      </div>
    </ResponsiveLayout>
  );
}
