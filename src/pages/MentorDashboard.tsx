import { Bell, Settings, Plus, Share2, MessageSquare, Users, TrendingUp, Award, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { StatCard } from "@/components/mentor-connect/StatCard";
import { ResponsiveLayout } from "@/components/mentor-connect/ResponsiveLayout";
import { Logo } from "@/components/mentor-connect/Logo";
import { LanguageToggle } from "@/components/mentor-connect/LanguageToggle";
import { ShareResourceForm } from "@/components/mentor-connect/ShareResourceForm";
import { useState } from "react";
import { toast } from "sonner";

export default function MentorDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [showShareForm, setShowShareForm] = useState(false);

  const stats = [
    { label: t("mentor.dashboard.totalFollowers") || "Total Followers", value: "1,240", icon: Users, variant: "mentor" },
    { label: t("mentor.dashboard.communityMembers") || "Community Members", value: "450", icon: Award, variant: "mentor" },
    { label: t("mentor.dashboard.opportunitiesPosted") || "Opps Posted", value: "12", icon: Briefcase, variant: "primary" },
    { label: t("mentor.dashboard.weeklyReach") || "Weekly Reach", value: "3.2K", icon: TrendingUp, variant: "default" },
  ];

  const quickActions = [
    { 
      label: t("mentor.dashboard.postOpportunity") || "Post Opportunity", 
      icon: Plus, 
      action: () => navigate("/mentor/post"),
      color: "bg-primary/10 text-primary hover:bg-primary hover:text-white"
    },
    { 
      label: t("mentor.dashboard.shareResource") || "Share Resource", 
      icon: Share2, 
      action: () => setShowShareForm(true),
      color: "bg-mentor/10 text-mentor hover:bg-mentor hover:text-white"
    },
    { 
      label: t("mentor.dashboard.startDiscussion") || "Start Discussion", 
      icon: MessageSquare, 
      action: () => navigate("/mentor/community"),
      color: "bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500 hover:text-white"
    },
  ];

  return (
    <ResponsiveLayout>
      <div className="min-h-screen bg-background pb-20 lg:pb-8 animate-fade-in">
        {/* Mobile Top Bar */}
        <div className="sticky top-0 bg-card/90 backdrop-blur-xl border-b border-border/50 z-40 px-4 py-3 lg:hidden shadow-sm">
          <div className="max-w-3xl mx-auto flex justify-between items-center">
            <Logo size="sm" variant="mentor" />
            <div className="flex items-center gap-2">
              <LanguageToggle />
              <button 
                onClick={() => toast.info(t("mentor.dashboard.notifications") || "No new notifications")} 
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-mentor/10 hover:text-mentor transition-all relative"
              >
                <Bell size={18} />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-destructive border-2 border-card" />
              </button>
              <button 
                onClick={() => navigate("/mentor/profile")} 
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-mentor/10 hover:text-mentor transition-all"
              >
                <Settings size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
          {/* Welcome Header */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-mentor/10 via-background to-primary/10 p-8 border border-mentor/5">
            <div className="relative z-10">
              <h1 className="text-h1 text-foreground leading-tight">
                {t("mentor.dashboard.title", { name: user?.name?.split(" ")[0] || "Mentor" })} 👋
              </h1>
              <p className="text-body text-muted-foreground mt-2 max-w-lg">
                {t("mentor.dashboard.subtitle") || "Manage your community, post growth opportunities, and track your impact in Nashik."}
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
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

      {showShareForm && <ShareResourceForm onClose={() => setShowShareForm(false)} />}
    </ResponsiveLayout>
  );
}
