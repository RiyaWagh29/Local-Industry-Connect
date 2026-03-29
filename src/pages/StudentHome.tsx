import { useState } from "react";
import { Search, Bell, Sparkles, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { mentors, communities, opportunities, industries } from "@/lib/mock-data";
import { IndustryChip } from "@/components/mentor-connect/IndustryChip";
import { MentorCard } from "@/components/mentor-connect/MentorCard";
import { CommunityCard } from "@/components/mentor-connect/CommunityCard";
import { OpportunityCard } from "@/components/mentor-connect/OpportunityCard";
import { ResponsiveLayout } from "@/components/mentor-connect/ResponsiveLayout";
import { Logo } from "@/components/mentor-connect/Logo";
import { LanguageToggle } from "@/components/mentor-connect/LanguageToggle";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function StudentHome() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [selectedIndustry, setSelectedIndustry] = useState("All");

  const filteredMentors = selectedIndustry === "All"
    ? mentors.slice(0, 6)
    : mentors.filter((m) => m.industry === selectedIndustry).slice(0, 6);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t("home.greeting.morning") || "Good Morning";
    if (hour < 18) return t("home.greeting.afternoon") || "Good Afternoon";
    return t("home.greeting.evening") || "Good Evening";
  };

  return (
    <ResponsiveLayout>
      <div className="min-h-screen bg-background pb-20 lg:pb-8">
        {/* Mobile Top Bar */}
        <div className="sticky top-0 bg-card/90 backdrop-blur-xl border-b border-border/50 z-40 px-4 py-3 lg:hidden shadow-sm">
          <div className="max-w-3xl mx-auto flex justify-between items-center">
            <Logo size="sm" />
            <div className="flex items-center gap-2">
              <LanguageToggle />
              <button 
                onClick={() => navigate("/student/explore")} 
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all"
              >
                <Search size={18} />
              </button>
              <button 
                onClick={() => toast.info(t("home.notifications") || "No new notifications")} 
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all relative"
              >
                <Bell size={18} />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-destructive border-2 border-card" />
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-8 space-y-10 animate-fade-in">
          {/* Hero Greeting */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-background to-mentor/10 p-8 border border-primary/5">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-h1 text-foreground flex items-center gap-3">
                  {greeting()}, {user?.name?.split(" ")[0] || "Student"}! <Sparkles className="text-yellow-500 animate-pulse" size={24} />
                </h1>
                <p className="text-body text-muted-foreground mt-2 max-w-md">
                  {t("home.subtitle") || "Welcome back! Here's what's happening in your Nashik network today."}
                </p>
              </div>
              <button 
                onClick={() => navigate("/student/explore")}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all w-fit"
              >
                {t("explore.title")} <ArrowRight size={18} />
              </button>
            </div>
            {/* Background blobs */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-mentor/10 rounded-full blur-3xl" />
          </div>

          {/* Industry Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
            <IndustryChip 
              label={t("home.allMentors")} 
              selected={selectedIndustry === "All"} 
              onPress={() => setSelectedIndustry("All")} 
            />
            {industries.map((ind) => (
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
                {t("home.mentorsSection", { industry: selectedIndustry === "All" ? t("home.allMentors") : selectedIndustry })}
              </h2>
              <button 
                onClick={() => navigate("/student/explore")}
                className="text-caption font-bold text-primary hover:underline flex items-center gap-1"
              >
                {t("seeAll") || "See All"} <ArrowRight size={14} />
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredMentors.map((mentor) => (
                <MentorCard key={mentor.id} mentor={mentor} />
              ))}
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 pt-4">
            {/* Communities */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-h3 text-foreground font-bold">{t("home.communitiesSection")}</h2>
                <button 
                  onClick={() => navigate("/student/communities")}
                  className="text-caption font-bold text-primary hover:underline flex items-center gap-1"
                >
                  {t("seeAll") || "See All"}
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {communities.slice(0, 3).map((c) => (
                  <CommunityCard key={c.id} community={c} />
                ))}
              </div>
            </section>

            {/* Opportunities */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-h3 text-foreground font-bold">{t("home.opportunitiesSection")}</h2>
                <button 
                  onClick={() => navigate("/student/opportunities")}
                  className="text-caption font-bold text-primary hover:underline flex items-center gap-1"
                >
                  {t("seeAll") || "See All"}
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {opportunities.slice(0, 3).map((o) => (
                  <OpportunityCard key={o.id} opportunity={o} />
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </ResponsiveLayout>
  );
}
