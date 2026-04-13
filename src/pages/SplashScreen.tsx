import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { Logo } from "@/components/mentor-connect/Logo";
import { LanguageToggle } from "@/components/mentor-connect/LanguageToggle";
import { getHomeRoute } from "@/lib/navigation";
import { GraduationCap, Building2, ChevronRight, Search, Users, Briefcase, LayoutDashboard } from "lucide-react";

export default function SplashScreen() {
  const navigate = useNavigate();
  const { setRole, isAuthenticated, user, isInitialized, isNewUser } = useAuth();
  const { t } = useLanguage();

  // Auto-redirect if already logged in
  useEffect(() => {
    if (isInitialized && isAuthenticated && user) {
      if (user.role === "admin") {
        navigate(getHomeRoute("admin"), { replace: true });
      } else if (isNewUser) {
        navigate(`/onboarding/${user.role}`, { replace: true });
      } else {
        navigate(getHomeRoute(user.role as any), { replace: true });
      }
    }
  }, [isInitialized, isAuthenticated, user, isNewUser, navigate]);

  const handleRoleSelection = (role: "student" | "mentor" | "admin") => {
    if (setRole) {
      setRole(role);
    }
    navigate(`/login${role === 'admin' ? '' : '?mode=signup'}`);
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-mentor/5 rounded-full blur-3xl" />

      <div className="w-full max-w-md space-y-12 relative z-10 animate-fade-in">
        <div className="flex items-center justify-between">
          <Logo size="lg" />
          <LanguageToggle />
        </div>

        <div className="space-y-4">
          <h1 className="text-h1 text-foreground leading-tight">
            {t("splash.title")}
          </h1>
          <p className="text-body text-muted-foreground">
            {t("splash.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 py-2">
          {[
            { icon: <Search size={20} />, label: t("home.allMentors") },
            { icon: <Users size={20} />, label: "Communities" },
            { icon: <Briefcase size={20} />, label: "Meetings" },
          ].map((feat, i) => (
            <div key={i} className="flex flex-col items-center gap-2 text-center group">
              <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                {feat.icon}
              </div>
              <span className="text-v-small font-medium text-muted-foreground">{feat.label}</span>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <button
            onClick={() => handleRoleSelection("student")}
            className="w-full group flex items-center justify-between p-5 rounded-2xl bg-card border border-border hover:border-primary hover:shadow-card transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                <GraduationCap size={24} />
              </div>
              <div className="text-left">
                <span className="block text-body font-semibold text-foreground">I'm a Student</span>
                <span className="text-caption text-muted-foreground">Learn from the best industry experts</span>
              </div>
            </div>
            <ChevronRight size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
          </button>

          <button
            onClick={() => handleRoleSelection("mentor")}
            className="w-full group flex items-center justify-between p-5 rounded-2xl bg-card border border-border hover:border-mentor hover:shadow-card transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-mentor/10 flex items-center justify-center text-mentor group-hover:bg-mentor group-hover:text-mentor-foreground transition-all">
                <Building2 size={24} />
              </div>
              <div className="text-left">
                <span className="block text-body font-semibold text-foreground">I'm a Mentor</span>
                <span className="text-caption text-muted-foreground">Guide Nashik's students & build community</span>
              </div>
            </div>
            <ChevronRight size={20} className="text-muted-foreground group-hover:text-mentor transition-colors" />
          </button>
        </div>

        <div className="text-center">
           <p className="text-caption text-muted-foreground">
             {t("alreadyHaveAccount")}{" "}
             <button onClick={() => navigate("/login")} className="text-primary font-bold hover:underline">
               {t("signIn")}
             </button>
           </p>
        </div>
      </div>
    </div>
  );
}
