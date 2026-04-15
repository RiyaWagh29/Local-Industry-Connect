import { useEffect, useState } from "react";
import { Search, Bell, Sparkles, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { useMentors } from "@/lib/mentors-context";
import { Users, User } from "lucide-react";
import { industries } from "@/lib/constants";
import { IndustryChip } from "@/components/mentor-connect/IndustryChip";
import { MentorCard } from "@/components/mentor-connect/MentorCard";
import { CommunityCard } from "@/components/mentor-connect/CommunityCard";
import { ResponsiveLayout } from "@/components/mentor-connect/ResponsiveLayout";
import { toast } from "sonner";
import api from "@/lib/api";
import { Community } from "@/lib/types";
import { useNavigate } from "react-router-dom";
import { getText } from "@/lib/getText";

export default function StudentHome() {
  const { user } = useAuth();
  const { mentors, isLoading: mentorsLoading } = useMentors();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [selectedIndustry, setSelectedIndustry] = useState("All");
  const [communities, setCommunities] = useState<Community[]>([]);
  const [communitiesLoading, setCommunitiesLoading] = useState(true);

  const safeMentors = Array.isArray(mentors) ? mentors : [];
  const safeCommunities = Array.isArray(communities) ? communities : [];

  const filteredMentors = (
    selectedIndustry === "All"
      ? safeMentors
      : safeMentors.filter((m) => m?.industry === selectedIndustry)
  )
    .slice()
    .sort((a, b) => (b?.averageRating || 0) - (a?.averageRating || 0))
    .slice(0, 3);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t("home.greeting.morning") || "Good Morning";
    if (hour < 18) return t("home.greeting.afternoon") || "Good Afternoon";
    return t("home.greeting.evening") || "Good Evening";
  };

  const userName = getText(user?.name) || "Student";

  useEffect(() => {
    const fetchCommunities = async () => {
      setCommunitiesLoading(true);
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
        setCommunitiesLoading(false);
      }
    };
    fetchCommunities();
  }, []);


  return (
    <ResponsiveLayout>
      <div className="min-h-screen bg-background pb-20 lg:pb-8">
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-10 animate-fade-in">
          {/* Hero Greeting */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-background to-mentor/10 p-8 border border-primary/5">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-h1 text-foreground flex items-center gap-3">
                  {greeting()}, {userName}! <Sparkles className="text-yellow-500 animate-pulse" size={24} />
                </h1>
                <p className="text-body text-muted-foreground mt-2 max-w-md">
                  {t("home.subtitle") || "Welcome back! Here's what's happening in your Nashik network today."}
                </p>
              </div>
              <button 
                onClick={() => navigate("/student/explore")}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-bold shadow-lg hover:scale-105 transition-all w-fit"
              >
                {t("explore.title") || "Explore Mentors"} <ArrowRight size={18} />
              </button>
            </div>
          </div>

          {/* Industry Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
            <IndustryChip 
              label={t("home.allMentors") || "All"} 
              selected={selectedIndustry === "All"} 
              onPress={() => setSelectedIndustry("All")} 
            />
            {(industries || []).map((ind) => (
              <IndustryChip 
                key={ind} 
                label={ind} 
                selected={selectedIndustry === ind} 
                onPress={() => setSelectedIndustry(ind)} 
              />
            ))}
          </div>

          {/* Mentors Section */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-h2 text-foreground font-bold">
                {selectedIndustry === "All" ? t("home.mentorsSection") || "Recommended Mentors" : `Mentors in Nashik Industry`}
              </h2>
              <button 
                onClick={() => navigate("/student/explore")}
                className="text-caption font-bold text-primary hover:underline flex items-center gap-1"
              >
                {t("seeAll") || "See All"} <ArrowRight size={14} />
              </button>
            </div>
            
            {mentorsLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => <div key={i} className="aspect-[3/4] rounded-2xl bg-muted animate-pulse" />)}
              </div>
            ) : (filteredMentors || []).length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredMentors.map((mentor) => (
                  <MentorCard key={mentor?.id || Math.random()} mentor={mentor} />
                ))}
              </div>
            ) : (
                <div className="w-full py-12 border border-dashed border-border rounded-3xl flex flex-col items-center justify-center text-center space-y-3 bg-muted/20">
                    <Users size={32} className="text-muted-foreground opacity-20" />
                    <p className="text-muted-foreground">No mentors found</p>
                </div>
            )}
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 pt-4">
            {/* Communities */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-h3 text-foreground font-bold">{t("home.communitiesSection") || "Communities"}</h2>
                {safeCommunities.length > 0 && (
                  <button 
                    onClick={() => navigate("/student/communities")}
                    className="text-primary font-bold hover:underline"
                  >
                    {t("seeAll") || "See All"}
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 gap-4">
                {communitiesLoading ? (
                  <div className="h-28 rounded-2xl bg-muted animate-pulse" />
                ) : safeCommunities.length > 0 ? (
                  safeCommunities.slice(0, 3).map((c) => (
                    <CommunityCard key={c.id} community={c} />
                  ))
                ) : (
                  <div className="p-8 border border-dashed border-border rounded-2xl flex flex-col items-center justify-center text-center bg-muted/20">
                    <p className="text-muted-foreground font-medium">No communities yet</p>
                  </div>
                )}
              </div>
            </section>

            {/* Leaderboard Section */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-h3 text-foreground font-bold">{t("home.leaderboardSection") || "Leaderboard"}</h2>
                <button 
                  onClick={() => navigate("/student/leaderboard")}
                  className="text-primary font-bold hover:underline"
                >
                  {t("seeAll") || "See All"}
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {mentorsLoading ? (
                  <div className="h-64 rounded-2xl bg-muted animate-pulse" />
                ) : safeMentors.length > 0 ? (
                  <div className="bg-card border border-border rounded-3xl overflow-hidden divide-y divide-border/50 shadow-sm">
                    {safeMentors.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0)).slice(0, 3).map((mentor, index) => (
                      <div 
                        key={mentor.id || index} 
                        className="p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors cursor-pointer" 
                        onClick={() => mentor.id && navigate(`/mentor/profile/${mentor.id}`)}
                      >
                         <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0 text-sm">
                           {index + 1}
                         </div>
                         <div className="w-10 h-10 rounded-full bg-muted overflow-hidden shrink-0">
                           <img src={mentor.avatar} alt={getText(mentor.name)} className="w-full h-full object-cover" />
                         </div>
                         <div className="flex-1 min-w-0">
                           <p className="font-bold text-body truncate">{getText(mentor.name)}</p>
                           <p className="text-caption text-muted-foreground truncate">{getText(mentor.role)}</p>
                         </div>
                         <div className="flex items-center gap-1 font-bold text-primary shrink-0">
                           <span className="text-sm">★</span>
                           <span>{mentor.averageRating?.toFixed(1) || "5.0"}</span>
                         </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 border border-dashed border-border rounded-2xl flex flex-col items-center justify-center text-center bg-muted/20">
                    <p className="text-muted-foreground font-medium">Rankings arriving soon</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </ResponsiveLayout>
  );
}
