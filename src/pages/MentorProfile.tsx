import { useAuth } from "@/lib/auth-context";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/lib/language-context";
import { GraduationCap, LogOut, Settings, ChevronRight, Edit, Camera, Briefcase, Users, LayoutDashboard, Globe, ShieldCheck, LogIn, Award } from "lucide-react";
import { SkillTag } from "@/components/mentor-connect/SkillTag";
import { ResponsiveLayout } from "@/components/mentor-connect/ResponsiveLayout";
import { LanguageToggle } from "@/components/mentor-connect/LanguageToggle";
import { toast } from "sonner";

export default function MentorProfile() {
  const { user, logout, isAuthenticated, isInitialized } = useAuth();
  const navigate = useNavigate();
  const { t, getLocalized } = useLanguage();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success(t("loggedOut") || "Successfully logged out");
      navigate("/");
    } catch (error) {
       toast.error("Logout failed");
    }
  };

  if (!isInitialized) return <div className="min-h-screen bg-background flex items-center justify-center">{t("loading")}</div>;

  if (!isAuthenticated || !user) {
    return (
      <ResponsiveLayout>
        <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
            <GraduationCap size={40} className="text-muted-foreground" />
          </div>
          <h1 className="text-h2 text-foreground mb-2">{t("auth.notLoggedIn") || "Not Signed In"}</h1>
          <p className="text-body text-muted-foreground mb-8 max-w-xs mx-auto">
            {t("auth.signInToViewProfile") || "Sign in to view and manage your Nashik career profile."}
          </p>
          <button
            onClick={() => navigate("/login")}
            className="btn-primary w-full max-w-xs"
          >
            <LogIn size={18} /> {t("signIn")}
          </button>
        </div>
      </ResponsiveLayout>
    );
  }

  const menuItems = [
    { label: t("mentor.dashboard.postOpportunity") || "Manage My Opportunities", icon: Briefcase, action: () => navigate("/mentor/post") },
    { label: t("mentor.dashboard.startDiscussion") || "Community Hub", icon: Users, action: () => navigate("/mentor/community") },
    { label: t("nav.dashboard") || "View Dashboard", icon: LayoutDashboard, action: () => navigate("/mentor/dashboard") },
    { label: t("profile.settings") || "Settings", icon: Settings, action: () => navigate("/profile/settings") },
  ];

  return (
    <ResponsiveLayout>
      <div className="min-h-screen bg-background pb-20 lg:pb-12 animate-fade-in">
        {/* Cover Header */}
        <div className="h-48 md:h-64 bg-gradient-to-r from-mentor via-mentor/80 to-primary/80 relative">
          <button className="absolute bottom-4 right-4 p-2.5 rounded-xl bg-card/20 backdrop-blur-md text-white hover:bg-card/40 transition-all border border-white/20">
            <Camera size={20} />
          </button>
        </div>

        <div className="max-w-4xl mx-auto px-4 -mt-24 relative z-10 space-y-8">
          {/* Profile Basic Info */}
          <div className="bg-card rounded-3xl border border-border shadow-2xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="flex flex-col md:flex-row md:items-end gap-6">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-3xl bg-mentor/10 border-4 border-card flex items-center justify-center shadow-xl overflow-hidden">
                   {user.avatar ? (
                     <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                   ) : (
                     <span className="text-h1 text-mentor font-bold">{user.name?.charAt(0) || "M"}</span>
                   )}
                  </div>
                  <button className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-primary text-primary-foreground shadow-lg hover:scale-110 transition-all border-2 border-card">
                    <Camera size={14} />
                  </button>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-h1 text-foreground leading-tight tracking-tight">{user.name}</h1>
                    <ShieldCheck size={24} className="text-mentor" />
                  </div>
                  <p className="text-body font-medium text-muted-foreground">{user.company || "Independent Mentor"}</p>
                  <div className="flex items-center gap-4 mt-1 text-v-small font-bold text-muted-foreground uppercase tracking-widest whitespace-nowrap">
                    <span className="flex items-center gap-1.5"><strong className="text-foreground">1.2K</strong> Followers</span>
                    <span className="opacity-30">•</span>
                    <span className="flex items-center gap-1.5"><strong className="text-foreground">450</strong> Members</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <LanguageToggle />
                <button 
                  onClick={() => navigate("/profile/edit")}
                  className="btn-outline border-mentor text-mentor hover:bg-mentor hover:text-white"
                >
                  <Edit size={16} />{t("student.profile.editProfile")}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Info Cards */}
            <div className="lg:col-span-1 space-y-6">
              {user.guidance && (
                <div className="bg-card rounded-3xl border border-border shadow-sm p-6 hover:shadow-md transition-shadow">
                  <h3 className="text-caption font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Globe size={14} className="text-mentor" />
                    {t("mentor.profile.guidance") || "Your Guidance"}
                  </h3>
                  <p className="text-body text-foreground leading-relaxed italic border-l-4 border-mentor/30 pl-4 py-1">
                    "{user.guidance}"
                  </p>
                </div>
              )}

              {user.skills && user.skills.length > 0 && (
                <div className="bg-card rounded-3xl border border-border shadow-sm p-6 hover:shadow-md transition-shadow">
                  <h3 className="text-caption font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Award size={14} className="text-mentor" /> {t("student.profile.skills") || "Professional Skills"}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {user.skills.map((s) => (
                      <div key={s} className="px-3 py-1.5 rounded-xl bg-muted/50 text-v-small font-bold text-foreground border border-border/50">
                        {s}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Menu List */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-card rounded-3xl border border-border shadow-md overflow-hidden">
                {menuItems.map((item, idx) => (
                  <button 
                    key={item.label} 
                    onClick={item.action}
                    className={`w-full flex items-center justify-between px-6 py-5 hover:bg-muted/50 transition-all group ${
                      idx !== menuItems.length - 1 ? 'border-b border-border/50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-mentor/5 text-mentor flex items-center justify-center group-hover:scale-110 group-hover:bg-mentor group-hover:text-white transition-all shadow-inner">
                        <item.icon size={20} />
                      </div>
                      <span className="text-body font-bold text-foreground group-hover:translate-x-1 transition-transform">{item.label}</span>
                    </div>
                    <ChevronRight size={18} className="text-muted-foreground opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>

              <button 
                onClick={handleLogout}
                className="btn-destructive w-full"
              >
                <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                {t("logout") || "Sign Out"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </ResponsiveLayout>
  );
}
