import { Plus, Share2, MessageSquare, Users, TrendingUp, Award, Calendar, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { ResponsiveLayout } from "@/components/mentor-connect/ResponsiveLayout";
import { ShareResourceForm } from "@/components/mentor-connect/ShareResourceForm";
import { MentorCard } from "@/components/mentor-connect/MentorCard";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { useMentors } from "@/lib/mentors-context";
import { useState, useEffect } from "react";
import api from "@/lib/api";

type DashboardCommunity = {
  _id?: string;
  id?: string;
  name?: string | { en?: string; mr?: string };
  title?: string | { en?: string; mr?: string };
  description?: string | { en?: string; mr?: string };
  members?: number | unknown[];
};

type DashboardMeeting = {
  status?: string;
};

type DashboardResource = {
  sharedBy?: {
    _id?: string;
  } | string;
  createdAt?: string;
  sharedDate?: string;
};

export default function MentorDashboard() {
  const { user, refreshUser } = useAuth();
  const { t } = useLanguage();
  const { mentors, isLoading: mentorsLoading } = useMentors();
  const navigate = useNavigate();
  const [showShareForm, setShowShareForm] = useState(false);
  const [showCommunityPicker, setShowCommunityPicker] = useState(false);
  const [mentorCommunities, setMentorCommunities] = useState<DashboardCommunity[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<DashboardCommunity | null>(null);
  const [meetingsCount, setMeetingsCount] = useState(0);
  const [communityMembers, setCommunityMembers] = useState(0);
  const [weeklyReach, setWeeklyReach] = useState(0);

  useEffect(() => {
    if (!user?.id) return;
    refreshUser();

    // Fetch meetings + community + weekly reach
    const fetchStats = async () => {
      try {
        const [meetRes, commRes, resRes] = await Promise.all([
          api.get(`/meetings/mentor/${user.id}`),
          api.get(`/communities/mentor/${user.id}`),
          api.get(`/resources`)
        ]);

        const meetData = meetRes.data;
        if (meetData?.success && Array.isArray(meetData.data)) {
          setMeetingsCount(meetData.data.filter((m: DashboardMeeting) => m.status === "completed").length);
        } else {
          setMeetingsCount(0);
        }

        const commData = commRes.data;
        if (commData?.success && Array.isArray(commData.data)) {
          setMentorCommunities(commData.data);
          const memberTotal = commData.data.reduce((sum: number, c: DashboardCommunity) => {
            const members = Array.isArray(c.members) ? c.members.length : Number(c.members || 0);
            return sum + members;
          }, 0);
          setCommunityMembers(memberTotal);
        } else {
          setMentorCommunities([]);
          setCommunityMembers(0);
        }

        const resData = resRes.data;
        if (resData?.success && Array.isArray(resData.data)) {
          const now = Date.now();
          const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
          const weeklyCount = resData.data.filter((r: DashboardResource) => {
            const sharedById = r.sharedBy?._id || r.sharedBy;
            if (!sharedById || sharedById.toString() !== user.id.toString()) return false;
            const ts = new Date(r.createdAt || r.sharedDate).getTime();
            return !Number.isNaN(ts) && (now - ts) <= sevenDaysMs;
          }).length;
          setWeeklyReach(weeklyCount);
        } else {
          setWeeklyReach(0);
        }
      } catch (e) { console.error(e); }
    };
    fetchStats();
  }, [user?.id, refreshUser]);

  const followersCount = typeof user?.followersCount === "number"
    ? user.followersCount
    : Array.isArray(user?.followers)
      ? user.followers.length
      : typeof user?.followers === "number"
        ? user.followers
        : 0;

  const getCommunityName = (community: DashboardCommunity) => {
    const value = community.name || community.title;
    if (typeof value === "string") return value;
    return value?.en || value?.mr || "Untitled Community";
  };

  const stats = [
    { label: t("mentor.dashboard.totalFollowers") || "Total Followers", value: followersCount.toLocaleString(), icon: Users, variant: "mentor" },
    { label: t("mentor.dashboard.communityMembers") || "Community Members", value: communityMembers.toLocaleString(), icon: Award, variant: "mentor" },
    { label: t("mentor.dashboard.meetingsDone") || "Meetings", value: meetingsCount.toLocaleString(), icon: Calendar, variant: "primary" },
    { label: t("mentor.dashboard.weeklyReach") || "Weekly Reach", value: weeklyReach.toLocaleString(), icon: TrendingUp, variant: "default" },
  ];

  const quickActions = [
    { 
      label: "Start Community", 
      icon: Plus, 
      action: () => navigate("/mentor/community"),
      color: "bg-primary/10 text-primary hover:bg-primary hover:text-white"
    },
    {
      label: "Browse Communities",
      icon: Users,
      action: () => navigate("/mentor/communities"),
      color: "bg-primary/10 text-primary hover:bg-primary hover:text-white"
    },
    { 
      label: t("mentor.dashboard.shareResource") || "Share Resource", 
      icon: Share2, 
      action: () => setShowCommunityPicker(true),
      color: "bg-mentor/10 text-mentor hover:bg-mentor hover:text-white"
    },
    { 
      label: t("mentor.dashboard.startDiscussion") || "Start Discussion", 
      icon: MessageSquare, 
      action: () => navigate("/mentor/community"),
      color: "bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500 hover:text-white"
    },
  ];

  const otherMentors = (Array.isArray(mentors) ? mentors : []).filter((mentor) => mentor?.id && mentor.id !== user?.id);

  return (
    <ResponsiveLayout>
      <div className="min-h-screen bg-background pb-20 lg:pb-8 animate-fade-in">
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
          {/* Welcome Header */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-mentor/10 via-background to-primary/10 p-8 border border-mentor/5">
            <div className="relative z-10">
              <h1 className="text-h1 text-foreground leading-tight">
                {t("mentor.dashboard.title", { name: user?.name?.split(" ")[0] || "Mentor" })} 👋
              </h1>
              <p className="text-body text-muted-foreground mt-2 max-w-lg">
                {t("mentor.dashboard.subtitle") || "Manage your community, conduct mentorship meetings, and track your impact in Nashik."}
              </p>
            </div>
            {/* Background decorative elements */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-mentor/10 rounded-full blur-3xl opacity-50" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-50" />
          </div>

          {/* Stats Grid */}
          <section className="space-y-4">
            <h2 className="text-caption font-bold text-muted-foreground uppercase tracking-widest ml-1">
              {t("mentor.dashboard.performance") || "Your Performance"}
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
              {stats.map((stat, i) => (
                <div key={i} className="bg-card rounded-2xl border border-border p-6 shadow-sm hover:shadow-md transition-all group">
                  <div className={`w-10 h-10 rounded-xl mb-4 flex items-center justify-center transition-transform group-hover:scale-110 ${
                    stat.variant === "mentor" ? "bg-mentor/10 text-mentor" : 
                    stat.variant === "primary" ? "bg-primary/10 text-primary" : 
                    "bg-muted text-muted-foreground"
                  }`}>
                    <stat.icon size={20} />
                  </div>
                  <p className="text-h2 font-bold text-foreground">{stat.value}</p>
                  <p className="text-v-small font-bold text-muted-foreground uppercase tracking-tight mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Quick Actions */}
          <section className="space-y-4">
            <h2 className="text-caption font-bold text-muted-foreground uppercase tracking-widest ml-1">
              {t("mentor.dashboard.actions") || "Quick Actions"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {quickActions.map((btn) => (
                <button 
                  key={btn.label} 
                  onClick={btn.action}
                  className={`flex items-center justify-between p-6 rounded-3xl border border-transparent transition-all shadow-sm group ${btn.color}`}
                >
                  <div className="flex flex-col items-start gap-1">
                    <span className="text-body font-bold">{btn.label}</span>
                    <span className="text-v-small opacity-70 font-medium">
                      {btn.label.includes("Opp") ? "Grow your reach" : btn.label.includes("Res") ? "Share insights" : "Chat with members"}
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center transition-transform group-hover:translate-x-1">
                    <btn.icon size={22} />
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-h2 text-foreground font-bold">Explore Mentors</h2>
              <button
                onClick={() => navigate("/mentor/explore")}
                className="text-caption font-bold text-primary hover:underline"
              >
                {t("seeAll") || "See All"}
              </button>
            </div>

            {mentorsLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => <div key={i} className="aspect-[3/4] rounded-2xl bg-muted animate-pulse" />)}
              </div>
            ) : otherMentors.length > 0 ? (
              <Carousel opts={{ align: "start", dragFree: true }} className="w-full">
                <CarouselContent className="-ml-4">
                  {otherMentors.map((mentor) => (
                    <CarouselItem key={mentor.id} className="pl-4 basis-[78%] sm:basis-[48%] lg:basis-[31%] xl:basis-[24%]">
                      <MentorCard mentor={mentor} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            ) : (
              <div className="w-full py-12 border border-dashed border-border rounded-3xl flex flex-col items-center justify-center text-center space-y-3 bg-muted/20">
                <Users size={32} className="text-muted-foreground opacity-20" />
                <p className="text-muted-foreground">No other mentors found</p>
              </div>
            )}
          </section>

          {/* Recent Activity Placeholder */}
          <section className="bg-card rounded-3xl border border-border p-8 text-center space-y-4 shadow-sm border-dashed">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto opacity-40">
              <TrendingUp size={32} />
            </div>
            <div>
              <h3 className="text-body font-bold text-foreground">
                {t("mentor.dashboard.noActivity") || "No recent activity to show"}
              </h3>
              <p className="text-caption text-muted-foreground max-w-xs mx-auto">
                {t("mentor.dashboard.activityDesc") || "Check back once members start interacting with your posts and resources."}
              </p>
            </div>
          </section>
        </div>
      </div>

      {showCommunityPicker && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-lg rounded-3xl border border-border shadow-2xl shadow-primary/10 overflow-hidden">
            <div className="flex items-start justify-between gap-4 p-6 border-b border-border bg-gradient-to-r from-mentor/5 to-transparent">
              <div>
                <h2 className="text-h3 font-bold text-foreground">
                  {t("mentor.dashboard.shareResource") || "Share Resource"}
                </h2>
                <p className="text-caption text-muted-foreground mt-1">
                  Select one of your communities, then share the resource there.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCommunityPicker(false)}
                className="w-10 h-10 rounded-2xl border border-border text-muted-foreground hover:bg-muted flex items-center justify-center transition-all"
                aria-label="Close community picker"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {mentorCommunities.length > 0 ? (
                mentorCommunities.map((community) => {
                  const memberCount = Array.isArray(community.members) ? community.members.length : Number(community.members || 0);
                  return (
                    <button
                      key={community._id || community.id || getCommunityName(community)}
                      type="button"
                      onClick={() => {
                        setSelectedCommunity(community);
                        setShowCommunityPicker(false);
                        setShowShareForm(true);
                      }}
                      className="w-full text-left p-5 rounded-2xl border border-border hover:border-mentor hover:bg-mentor/5 transition-all"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="space-y-1">
                          <h3 className="text-body font-bold text-foreground">
                            {getCommunityName(community)}
                          </h3>
                          <p className="text-caption text-muted-foreground">
                            {memberCount} {t("community.members") || "members"}
                          </p>
                        </div>
                        <span className="text-caption font-bold text-mentor">
                          Choose
                        </span>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="rounded-2xl border border-dashed border-border p-8 text-center space-y-3">
                  <h3 className="text-body font-bold text-foreground">
                    No communities yet
                  </h3>
                  <p className="text-caption text-muted-foreground max-w-sm mx-auto">
                    Create a community first, then you can share resources directly to it from this page.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate("/mentor/community")}
                    className="px-5 py-3 rounded-2xl bg-primary text-primary-foreground font-bold"
                  >
                    Start Community
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showShareForm && (
        <ShareResourceForm
          onClose={() => {
            setShowShareForm(false);
            setSelectedCommunity(null);
          }}
          communityId={selectedCommunity?._id || selectedCommunity?.id}
        />
      )}
    </ResponsiveLayout>
  );
}
