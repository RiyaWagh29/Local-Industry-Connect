import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { Logo } from "@/components/mentor-connect/Logo";
import { LanguageToggle } from "@/components/mentor-connect/LanguageToggle";
import { GraduationCap, Building2, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

type AuthTab = "signin" | "signup";
type RoleTab = "student" | "mentor";

export default function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn, signUp, setRole, isAuthenticated, user } = useAuth();
  const { t } = useLanguage();

  const [authTab, setAuthTab] = useState<AuthTab>((searchParams.get("mode") as AuthTab) || "signin");
  const [roleTab, setRoleTab] = useState<RoleTab>("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // If already authenticated, redirect to appropriate home
  useEffect(() => {
    if (isAuthenticated && user) {
      const isNew = !user.industries || user.industries.length === 0;
      if (isNew) {
        navigate(user.role === "mentor" ? "/onboarding/mentor" : "/onboarding/student");
      } else {
        navigate(user.role === "mentor" ? "/mentor/dashboard" : "/student/home");
      }
    }
  }, [isAuthenticated, user, navigate]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (authTab === "signup" && !name.trim()) errs.name = t("auth.nameRequired");
    if (!email.trim()) errs.email = t("auth.emailRequired");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = t("auth.invalidEmail");
    if (!password) errs.password = t("auth.passwordRequired");
    else if (password.length < 6) errs.password = t("auth.passwordShort");
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    // Simulate network delay
    await new Promise(r => setTimeout(r, 600));

    if (authTab === "signin") {
      const result = signIn(email, password);
      if (result.success) {
        toast.success(t("auth.loginSuccess"));
        // Redirection is handled by the useEffect
      } else {
        toast.error(t(result.error || "auth.invalidCredentials"));
      }
    } else {
      setRole(roleTab);
      const result = signUp({
        name: name.trim(),
        email: email.trim(),
        password,
        role: roleTab,
        industries: [],
        skills: [],
      });
      if (result.success) {
        toast.success(t("auth.signupSuccess"));
        // Redirection is handled by the useEffect
      } else {
        toast.error(t(result.error || "auth.emailExists"));
      }
    }
    setLoading(false);
  };

  const clearErrors = (field: string) => setErrors((p) => ({ ...p, [field]: "" }));

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-background">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-mentor/5 pointer-events-none" />

      <div className="relative z-10 w-full max-w-md animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <ArrowLeft size={18} className="text-muted-foreground" />
            <Logo size="md" />
          </button>
          <LanguageToggle />
        </div>

        {/* Auth Tab */}
        <div className="flex rounded-xl border border-border bg-muted p-1 mb-6">
          {(["signin", "signup"] as AuthTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => { setAuthTab(tab); setErrors({}); }}
              className={`flex-1 py-2.5 rounded-lg text-body font-medium transition-all ${
                authTab === tab
                   ? "bg-card shadow-sm text-foreground"
                   : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "signin" ? t("signIn") : t("signUp")}
            </button>
          ))}
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-card p-6 space-y-5">
          <div>
            <h1 className="text-h2 text-foreground">
              {authTab === "signin" ? t("auth.signInTitle") : t("auth.signUpTitle")}
            </h1>
            <p className="text-body text-muted-foreground mt-1">
              {authTab === "signin" ? t("auth.signInSubtitle") : t("auth.signUpSubtitle")}
            </p>
          </div>

          {/* Role selector for signup */}
          {authTab === "signup" && (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRoleTab("student")}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  roleTab === "student"
                     ? "border-primary bg-primary/5"
                     : "border-border hover:border-muted-foreground"
                }`}
              >
                <GraduationCap size={24} className={roleTab === "student" ? "text-primary" : "text-muted-foreground"} />
                <span className={`text-caption font-medium ${roleTab === "student" ? "text-primary" : "text-muted-foreground"}`}>
                  {t("auth.roleStudent")}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setRoleTab("mentor")}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  roleTab === "mentor"
                     ? "border-mentor bg-mentor/5"
                     : "border-border hover:border-muted-foreground"
                }`}
              >
                <Building2 size={24} className={roleTab === "mentor" ? "text-mentor" : "text-muted-foreground"} />
                <span className={`text-caption font-medium ${roleTab === "mentor" ? "text-mentor" : "text-muted-foreground"}`}>
                  {t("auth.roleMentor")}
                </span>
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {authTab === "signup" && (
              <div>
                <input
                  value={name}
                  onChange={(e) => { setName(e.target.value); clearErrors("name"); }}
                  placeholder={t("fullName")}
                  className={`w-full px-4 py-3 rounded-lg border ${errors.name ? "border-destructive" : "border-input"} bg-background text-foreground text-body focus:ring-2 focus:ring-primary/30 outline-none transition-all`}
                  id="auth-name"
                />
                {errors.name && <p className="text-caption text-destructive mt-1">{errors.name}</p>}
              </div>
            )}

            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearErrors("email"); }}
                placeholder={t("email")}
                className={`w-full px-4 py-3 rounded-lg border ${errors.email ? "border-destructive" : "border-input"} bg-background text-foreground text-body focus:ring-2 focus:ring-primary/30 outline-none transition-all`}
                id="auth-email"
              />
              {errors.email && <p className="text-caption text-destructive mt-1">{errors.email}</p>}
            </div>

            <div>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearErrors("password"); }}
                  placeholder={t("password")}
                  className={`w-full px-4 py-3 pr-11 rounded-lg border ${errors.password ? "border-destructive" : "border-input"} bg-background text-foreground text-body focus:ring-2 focus:ring-primary/30 outline-none transition-all`}
                  id="auth-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-caption text-destructive mt-1">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              id="auth-submit-btn"
              className="btn-primary w-full"
            >
              {loading
                 ? t(authTab === "signin" ? "auth.signingIn" : "auth.creatingAccount")
                 : t(authTab === "signin" ? "signIn" : "signUp")}
            </button>
          </form>

          <div className="pt-2">
            {authTab === "signup" ? (
              <p className="text-caption text-muted-foreground text-center">
                {t("alreadyHaveAccount")}{" "}
                <button onClick={() => setAuthTab("signin")} className="text-primary font-medium hover:underline">
                  {t("signIn")}
                </button>
              </p>
            ) : (
              <p className="text-caption text-muted-foreground text-center">
                {t("dontHaveAccount")}{" "}
                <button onClick={() => setAuthTab("signup")} className="text-primary font-medium hover:underline">
                  {t("signUp")}
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
