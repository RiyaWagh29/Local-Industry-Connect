import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { Logo } from "@/components/mentor-connect/Logo";
import { LanguageToggle } from "@/components/mentor-connect/LanguageToggle";
import { GraduationCap, Building2, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { getHomeRoute } from "@/lib/navigation";

type AuthTab = "signin" | "signup";
type RoleTab = "student" | "mentor";

const TEMP_BYPASS_SIGNUP_OTP = true;

export default function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn, signUp, setRole, role: contextRole, isAuthenticated, user, sendOtp, verifyOtp } = useAuth() as any;
  const { t } = useLanguage();

  const [authTab, setAuthTab] = useState<AuthTab>((searchParams.get("mode") as AuthTab) || "signin");
  const [roleTab, setRoleTab] = useState(
    contextRole === "mentor" ? "mentor" : "student"
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [linkedinProfile, setLinkedinProfile] = useState("");
  const [officeIdCard, setOfficeIdCard] = useState<File | null>(null);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  // If already authenticated, redirect to appropriate home
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role !== "admin" && !user.onboarding_completed) {
        navigate(`/onboarding/${user.role}`);
      } else {
        navigate(getHomeRoute(user.role));
      }
    }
  }, [isAuthenticated, user]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (authTab === "signup" && !name.trim()) errs.name = t("auth.nameRequired");
    if (!email.trim()) errs.email = t("auth.emailRequired");
    else if (!/\S+@\S+\.\S+/.test(email.trim())) errs.email = t("auth.invalidEmail");
    if (!password) errs.password = t("auth.passwordRequired");
    else if (password.length < 6) errs.password = t("auth.passwordShort");
    if (authTab === "signup" && roleTab === "mentor" && !linkedinProfile.trim()) errs.linkedinProfile = "LinkedIn profile link is required";
    if (authTab === "signup" && roleTab === "mentor" && !officeIdCard) errs.officeIdCard = "Office ID card photo is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (!validate()) return;

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      toast.error("Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      if (authTab === "signin") {
        console.log("Signing in with:", cleanEmail);
        const result = await signIn(cleanEmail, password);

        if (result.error) {
          toast.error(result.error.message || t("auth.invalidCredentials"));
          return;
        }

        if (result.success) {
          toast.success(t("auth.loginSuccess"));
        }
      } else {
        if (TEMP_BYPASS_SIGNUP_OTP) {
          setRole(roleTab);

          const userData = roleTab === "mentor"
            ? (() => {
                const formData = new FormData();
                formData.set("name", name.trim());
                formData.set("email", cleanEmail);
                formData.set("password", password);
                formData.set("role", roleTab);
                formData.set("linkedinProfile", linkedinProfile.trim());
                if (officeIdCard) formData.set("officeIdCard", officeIdCard);
                return formData;
              })()
            : {
                name: name.trim(),
                email: cleanEmail,
                password,
                role: roleTab,
              };

          const result = await signUp(userData, password);

          if (result.error) {
            toast.error(result.error.message || "Signup failed");
            return;
          }

          if (result.success) {
            toast.success(t("auth.signupSuccess"));
          }

          return;
        }

        if (!otpSent) {
          console.log("Sending signup OTP to:", cleanEmail);
          const result = await sendOtp(cleanEmail);

          if (result.error) {
            toast.error(result.error.message || "Failed to send OTP");
            return;
          }

          if (result.success) {
            setOtpSent(true);
            if (result.otp) {
              setOtp(result.otp);
              toast.success(`OTP: ${result.otp}`);
            } else {
              toast.success(result.message || "Check your email for OTP to complete registration");
            }
          }
        } else {
          if (otp.length !== 6) {
            setErrors((prev) => ({ ...prev, otp: "Enter the 6-digit OTP" }));
            return;
          }

          setRole(roleTab);
          console.log("Verifying signup for:", cleanEmail);
          
          const userData = {
            name: name.trim(),
            password,
            role: roleTab,
          };

          const result = await verifyOtp(cleanEmail, otp, userData);

          if (result.error) {
            toast.error(result.error.message || "Invalid OTP");
            return;
          }

          if (result.success) {
            toast.success(t("auth.signupSuccess"));
          }
        }
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
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
              onClick={() => { setAuthTab(tab); setErrors({}); setOtpSent(false); setOtp(""); }}
              className={`flex-1 py-2.5 rounded-lg text-body font-medium transition-all ${authTab === tab
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
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${roleTab === "student"
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
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${roleTab === "mentor"
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

            {authTab === "signup" && roleTab === "mentor" && (
              <div className="space-y-4 rounded-xl border border-border bg-muted/30 p-4">
                <div className="space-y-2">
                  <label className="text-caption font-medium text-muted-foreground">
                    LinkedIn Profile Link
                  </label>
                  <input
                    type="url"
                    value={linkedinProfile}
                    onChange={(e) => { setLinkedinProfile(e.target.value); clearErrors("linkedinProfile"); }}
                    placeholder="https://www.linkedin.com/in/your-profile"
                    className={`w-full px-4 py-3 rounded-lg border ${errors.linkedinProfile ? "border-destructive" : "border-input"} bg-background text-foreground text-body focus:ring-2 focus:ring-primary/30 outline-none transition-all`}
                  />
                  {errors.linkedinProfile && <p className="text-caption text-destructive mt-1">{errors.linkedinProfile}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-caption font-medium text-muted-foreground">
                    Office ID Card Photo
                  </label>
                  <label className={`block w-full px-4 py-3 rounded-lg border ${errors.officeIdCard ? "border-destructive" : "border-input"} bg-background text-body text-foreground cursor-pointer`}>
                    <span>{officeIdCard ? officeIdCard.name : "Choose office ID card image"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        setOfficeIdCard(e.target.files?.[0] || null);
                        clearErrors("officeIdCard");
                      }}
                    />
                  </label>
                  {errors.officeIdCard && <p className="text-caption text-destructive mt-1">{errors.officeIdCard}</p>}
                </div>
              </div>
            )}

            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearErrors("email"); }}
                placeholder={t("email")}
                disabled={otpSent && authTab === "signup"}
                className={`w-full px-4 py-3 rounded-lg border ${errors.email ? "border-destructive" : "border-input"} bg-background text-foreground text-body focus:ring-2 focus:ring-primary/30 outline-none transition-all ${otpSent && authTab === "signup" ? "opacity-50 cursor-not-allowed" : ""}`}
                id="auth-email"
              />
              {errors.email && <p className="text-caption text-destructive mt-1">{errors.email}</p>}
            </div>

            {authTab === "signup" && otpSent && (
              <div>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "").slice(0, 6)); clearErrors("otp"); }}
                  placeholder="Enter 6-digit OTP"
                  className={`w-full px-4 py-3 rounded-lg border ${errors.otp ? "border-destructive" : "border-input"} bg-background text-foreground text-body focus:ring-2 focus:ring-primary/30 outline-none transition-all`}
                  id="auth-otp"
                  maxLength={6}
                />
                {errors.otp && <p className="text-caption text-destructive mt-1">{errors.otp}</p>}
              </div>
            )}

            {authTab === "signup" && (
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
            )}

            <button
              type="submit"
              disabled={loading}
              id="auth-submit-btn"
              className="btn-primary w-full"
            >
              {loading
                ? authTab === "signup"
                  ? (otpSent ? "Verifying..." : "Sending OTP...")
                  : t("auth.signingIn")
                : authTab === "signup" 
                  ? (TEMP_BYPASS_SIGNUP_OTP ? "Create Account" : otpSent ? "Verify & Register" : "Send OTP for Signup")
                  : t("signIn")}
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
