import { useAuth } from "@/lib/auth-context";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/lib/language-context";
import { LogOut, Settings, ChevronRight, User as UserIcon, LogIn, UserPlus } from "lucide-react";
import { SkillTag } from "@/components/mentor-connect/SkillTag";
import { ResponsiveLayout } from "@/components/mentor-connect/ResponsiveLayout";
import { LanguageToggle } from "@/components/mentor-connect/LanguageToggle";
import { toast } from "sonner";

export default function StudentProfile() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleLogout = () => {
    logout();
    toast.success(t("loggedOut"));
    navigate("/");
  };

  if (!isAuthenticated) {
    return (
      <ResponsiveLayout>
        <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
            <UserIcon size={40} className="text-muted-foreground" />
          </div>
          <h1 className="text-h2 text-foreground mb-2">{t("auth.notLoggedIn")}</h1>
          <p className="text-body text-muted-foreground text-center mb-8 max-w-xs">
            {t("auth.signInToViewProfile")}
          </p>
          <div className="w-full max-w-xs space-y-4">
            <button
              onClick={() => navigate("/login?mode=signin")}
              className="btn-primary w-full"
            >
              <LogIn size={18} /> {t("signIn")}
            </button>
            <button
              onClick={() => navigate("/login?mode=signup")}
              className="btn-outline w-full"
            >
              <UserPlus size={18} /> {t("signUp")}
            </button>
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout>
      <div className="min-h-screen bg-background pb-20 lg:pb-8 animate-fade-in">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-h2 text-foreground">{t("student.profile.title")}</h1>
            <div className="flex items-center gap-3">
              <LanguageToggle />
              <button 
                onClick={() => navigate("/profile/settings")} 
                className="p-2 rounded-lg bg-card text-muted-foreground hover:text-foreground border border-border transition-colors"
                title={t("student.profile.settings")}
              >
                <Settings size={20} />
              </button>
            </div>
          </div>

          <div className="bg-card rounded-2xl shadow-card border border-border p-8 text-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
            <div className="w-24 h-24 rounded-full bg-primary/10 border-4 border-card flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
              <span className="text-h1 text-primary">{user?.name?.charAt(0) || "S"}</span>
            </div>
            <h2 className="text-h2 text-foreground">{user?.name || t("student.profile.student")}</h2>
            <p className="text-body text-muted-foreground">{user?.email}</p>
          </div>

          {user?.industries && user.industries.length > 0 && (
            <div className="bg-card rounded-2xl shadow-card border border-border p-5">
              <h3 className="text-body font-semibold text-foreground mb-3">{t("student.profile.industries")}</h3>
              <div className="flex flex-wrap gap-2">
                {user.industries.map((ind) => <SkillTag key={ind} label={ind} />)}
              </div>
            </div>
          )}

          {user?.goals && (
            <div className="bg-card rounded-2xl shadow-card border border-border p-5">
              <h3 className="text-body font-semibold text-foreground mb-3">{t("student.profile.goals")}</h3>
              <p className="text-body text-muted-foreground">{user.goals}</p>
            </div>
          )}

          <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
            {[
              { label: t("student.profile.editProfile"), path: "/profile/edit" },
              { label: t("student.profile.savedOpportunities"), path: "/profile/saved" },
              { label: t("student.profile.settings"), path: "/profile/settings" },
            ].map((item) => (
              <button 
                key={item.label} 
                onClick={() => navigate(item.path)}
                className="w-full flex items-center justify-between px-5 py-5 border-b border-border last:border-0 hover:bg-muted/30 transition-colors group"
              >
                <span className="text-body text-foreground font-medium">{item.label}</span>
                <ChevronRight size={18} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>

          <button onClick={handleLogout}
            className="btn-destructive w-full"
          >
            <LogOut size={18} />{t("logout")}
          </button>
        </div>
      </div>
    </ResponsiveLayout>
  );
}
