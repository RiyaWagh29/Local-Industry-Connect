import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { Logo } from "@/components/mentor-connect/Logo";
import { LanguageToggle } from "@/components/mentor-connect/LanguageToggle";
import { GraduationCap, Building2, ChevronRight, Search, Users, Briefcase } from "lucide-react";

export default function SplashScreen() {
  const navigate = useNavigate();
  const { setRole, isAuthenticated, user, isInitialized } = useAuth();
  const { t } = useLanguage();

  // Auto-redirect if already logged in
  useEffect(() => {
    if (isInitialized && isAuthenticated && user) {
      const isNew = !user.industries || user.industries.length === 0;
      if (isNew) {
        navigate(user.role === "mentor" ? "/onboarding/mentor" : "/onboarding/student");
      } else {
        navigate(user.role === "mentor" ? "/mentor/dashboard" : "/student/home");
      }
    }
  }, [isInitialized, isAuthenticated, user, navigate]);

  const handleRoleSelection = (role: "student" | "mentor") => {
    setRole(role);
    navigate(`/login?mode=signup`);
  };

  if (!isInitialized) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-mentor/5 rounded-full blur-3xl" />

      <div className="w-full max-w-md space-y-12 relative z-10 animate-fade-in">
        {/* Branding & Language */}
        <div className="flex items-center justify-between">
          <Logo size="lg" />
          <LanguageToggle />
        </div>

        {/* Hero Content */}
        <div className="space-y-4">
          <h1 className="text-h1 text-foreground leading-tight">
            {t("splash.title")}
          </h1>
          <p className="text-body text-muted-foreground">
            {t("splash.subtitle")}
          </p>
        </div>

        {/* Quick Features */}
        <div className="grid grid-cols-3 gap-4 py-2">
          {[
            { icon: <Search size={20} />, label: t("home.allMentors") },
            { icon: <Users size={20} />, label: t("home.communitiesSection") },
            { icon: <Briefcase size={20} />, label: t("home.oppsSection") },
          ].map((feat, i) => (
            <div key={i} className="flex flex-col items-center gap-2 text-center group">
              <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                {feat.icon}
              </div>
              <span className="text-v-small font-medium text-muted-foreground">{feat.label}</span>
            </div>
          ))}
        </div>

        {/* Role Selection */}
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
                <span className="block text-body font-semibold text-foreground">{t("splash.iAmStudent")}</span>
                <span className="text-caption text-muted-foreground">{t("splash.studentDesc")}</span>
              </div>
            </div>
            <ChevronRight className="text-muted-foreground group-hover:text-primary transition-colors" />
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
                <span className="block text-body font-semibold text-foreground">{t("splash.iAmMentor")}</span>
                <span className="text-caption text-muted-foreground">{t("splash.mentorDesc")}</span>
              </div>
            </div>
            <ChevronRight className="text-muted-foreground group-hover:text-mentor transition-colors" />
          </button>
        </div>

        {/* Footer Link */}
        <p className="text-caption text-muted-foreground text-center">
          {t("alreadyHaveAccount")}{" "}
          <button onClick={() => navigate("/login")} className="text-primary font-medium hover:underline">
            {t("signIn")}
          </button>
        </p>
      </div>
    </div>
  );
}
