import { useState, KeyboardEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { StepProgressBar } from "@/components/mentor-connect/StepProgressBar";
import { IndustryChip } from "@/components/mentor-connect/IndustryChip";
import { SkillTag } from "@/components/mentor-connect/SkillTag";
import { Logo } from "@/components/mentor-connect/Logo";
import { LanguageToggle } from "@/components/mentor-connect/LanguageToggle";
import { industries } from "@/lib/constants";
import { ArrowLeft, ArrowRight, Briefcase, Award, Target, Star, Building2, Camera } from "lucide-react";
import { toast } from "sonner";
import { getAvatarUrl } from "@/lib/avatar";

export default function MentorOnboarding() {
  const navigate = useNavigate();
  const { user, updateUser, isAuthenticated } = useAuth();
  const { t } = useLanguage();

  // Start at step 2 because account info (Step 1) was done at registration
  const [step, setStep] = useState(2);
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [experience, setExperience] = useState(5);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [guidance, setGuidance] = useState("");
  const [offerTypes, setOfferTypes] = useState<string[]>([]);
  const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  const addSkill = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && skillInput.trim()) {
      e.preventDefault();
      const trimmed = skillInput.trim();
      if (skills.length >= 10) { 
        toast.error(t("mentorOnboard.maxSkills") || "Maximum 10 skills allowed"); 
        return; 
      }
      if (!skills.includes(trimmed)) setSkills([...skills, trimmed]);
      setSkillInput("");
    }
  };

  const toggleOffer = (offer: string) => {
    setOfferTypes((prev) => prev.includes(offer) ? prev.filter((o) => o !== offer) : [...prev, offer]);
  };

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (step === 2) {
      if (!selectedIndustry) newErrors.industry = t("mentorOnboard.industryError") || "Please select an industry";
      if (!role.trim()) newErrors.role = t("mentorOnboard.roleError") || "Professional role is required";
      if (!company.trim()) newErrors.company = t("mentorOnboard.companyError") || "Company name is required";
    }
    if (step === 3) {
      if (!guidance.trim()) newErrors.guidance = t("mentorOnboard.guidanceError") || "Please describe your guidance areas";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => { if (validateStep()) setStep(step + 1); };

  const handleFinish = async () => {
    if (!validateStep()) return;
    try {
      const formData = new FormData();
      formData.append("industries", JSON.stringify([selectedIndustry]));
      formData.append("skills", JSON.stringify(skills));
      formData.append("company", company);
      formData.append("experience", String(experience));
      formData.append("guidance", guidance);
      formData.append("onboarding_completed", "true");
      if (selectedAvatar) {
        formData.append("avatar", selectedAvatar);
      }

      await updateUser(formData);
      toast.success(t("mentorOnboard.welcome") || `Welcome to MentorConnect, ${user?.name}! 🎓`);
      navigate("/mentor/dashboard");
    } catch (error) {
      toast.error("Failed to save profile. Please try again.");
    }
  };

  if (!user) return null;

  const inputClass = (err?: string) =>
    `w-full px-5 py-4 rounded-2xl border ${err ? "border-destructive ring-destructive/10" : "border-border focus:border-mentor ring-mentor/10"} bg-muted/30 text-foreground text-body focus:ring-4 outline-none transition-all shadow-sm`;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-12 px-6 overflow-x-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-mentor/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="w-full max-w-xl relative z-10 space-y-10 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Logo size="md" variant="mentor" />
          <LanguageToggle />
        </div>

        <div className="space-y-2">
          <StepProgressBar currentStep={step} totalSteps={3} variant="mentor" />
          <p className="text-v-small font-bold text-center text-mentor uppercase tracking-widest">{t("step") || "Step"} {step} / 3</p>
        </div>

        <div className="bg-card rounded-3xl border border-border shadow-2xl p-8 md:p-10 transition-all">
          {step === 2 && (
            <div className="space-y-8 animate-slide-up">
              <div className="space-y-3">
                <h2 className="text-h1 text-foreground flex items-center gap-3">
                  {t("mentorOnboard.step2.title")} <Award className="text-mentor" />
                </h2>
                <p className="text-body text-muted-foreground">
                  {t("mentorOnboard.step2.subtitle")}
                </p>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border">
                <img
                  src={avatarPreview || getAvatarUrl(user?.name, user?.avatar)}
                  alt={user?.name || "Mentor"}
                  className="w-20 h-20 rounded-2xl object-cover border border-border"
                />
                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card text-foreground cursor-pointer hover:bg-muted transition-colors">
                  <Camera size={16} />
                  <span>{t("student.profile.editPhoto") || "Add Photo"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setSelectedAvatar(file);
                      setAvatarPreview(file ? URL.createObjectURL(file) : null);
                    }}
                  />
                </label>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-caption font-bold text-muted-foreground uppercase tracking-widest ml-1">{t("mentorOnboard.industryLabel")}</label>
                  <div className="flex flex-wrap gap-2">
                    {industries.map((ind) => (
                      <IndustryChip key={ind} label={ind} selected={selectedIndustry === ind} variant="mentor" onPress={() => { setSelectedIndustry(ind); setErrors(p => ({ ...p, industry: "" })); }} />
                    ))}
                  </div>
                  {errors.industry && <p className="text-caption text-destructive font-medium ml-1">{errors.industry}</p>}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-caption font-bold text-muted-foreground uppercase tracking-widest ml-1">{t("mentorOnboard.roleLabel") || "Your Role"}</label>
                    <input value={role} onChange={(e) => { setRole(e.target.value); setErrors(p => ({ ...p, role: "" })); }} placeholder={t("mentorOnboard.rolePlaceholder")} className={inputClass(errors.role)} />
                    {errors.role && <p className="text-caption text-destructive font-medium ml-1">{errors.role}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-caption font-bold text-muted-foreground uppercase tracking-widest ml-1 font-bold">{t("mentorOnboard.companyLabel") || "Company"}</label>
                    <input value={company} onChange={(e) => { setCompany(e.target.value); setErrors(p => ({ ...p, company: "" })); }} placeholder={t("mentorOnboard.companyPlaceholder")} className={inputClass(errors.company)} />
                    {errors.company && <p className="text-caption text-destructive font-medium ml-1">{errors.company}</p>}
                  </div>
                </div>

                <div className="space-y-4 p-5 rounded-2xl bg-muted/40 border border-border">
                  <label className="text-caption font-bold text-muted-foreground uppercase tracking-widest flex items-center justify-between">
                    <span>{t("mentorOnboard.experienceLabel", { n: experience })}</span>
                    <span className="text-mentor bg-mentor/10 px-3 py-1 rounded-lg">{experience} yrs</span>
                  </label>
                  <input type="range" min={0} max={30} value={experience} onChange={(e) => setExperience(Number(e.target.value))} className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-mentor" />
                </div>

                <div className="space-y-2">
                  <label className="text-caption font-bold text-muted-foreground uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Star size={14} className="text-mentor" />
                    {t("mentorOnboard.skillsLabel")}
                  </label>
                  <div className="relative group">
                    <input 
                      value={skillInput} 
                      onChange={(e) => setSkillInput(e.target.value)} 
                      onKeyDown={addSkill} 
                      placeholder={t("mentorOnboard.skillPlaceholder")} 
                      className="w-full pl-5 pr-12 py-4 rounded-2xl border border-border bg-muted/30 text-foreground text-body focus:ring-4 focus:ring-mentor/10 focus:border-mentor outline-none transition-all" 
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground bg-card border border-border px-2 py-1 rounded-lg">
                      Enter
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {skills.map((s) => (
                      <SkillTag 
                        key={s} 
                        label={s} 
                        removable 
                        onRemove={() => setSkills(skills.filter((sk) => sk !== s))} 
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-slide-up">
              <div className="space-y-3">
                <h2 className="text-h1 text-foreground flex items-center gap-3">
                  {t("mentorOnboard.step3.title")} <Target className="text-mentor" />
                </h2>
                <p className="text-body text-muted-foreground">
                  {t("mentorOnboard.step3.subtitle")}
                </p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-caption font-bold text-muted-foreground uppercase tracking-widest ml-1">{t("mentorOnboard.guidanceLabel")}</label>
                  <textarea 
                    value={guidance} 
                    onChange={(e) => { setGuidance(e.target.value); setErrors(p => ({ ...p, guidance: "" })); }} 
                    placeholder={t("mentorOnboard.guidancePlaceholder")} 
                    rows={4} 
                    className={`w-full px-5 py-4 rounded-2xl border ${errors.guidance ? "border-destructive ring-destructive/10" : "border-border focus:border-mentor ring-mentor/10"} bg-muted/30 text-foreground text-body focus:ring-4 outline-none transition-all resize-none shadow-sm`}
                  />
                  {errors.guidance && <p className="text-caption text-destructive font-medium ml-1">{errors.guidance}</p>}
                </div>

                <div className="space-y-4">
                  <label className="text-caption font-bold text-muted-foreground uppercase tracking-widest ml-1">{t("mentorOnboard.offerLabel")}</label>
                  <div className="flex flex-wrap gap-2">
                    {["Internships", "Jobs", "Workshops", "Mentorship Calls", "Resources"].map((o) => (
                      <IndustryChip 
                        key={o} 
                        label={o} 
                        selected={offerTypes.includes(o)} 
                        variant="mentor" 
                        onPress={() => toggleOffer(o)} 
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-4">
          {step > 2 ? (
            <button 
              onClick={() => setStep(step - 1)} 
              className="flex items-center gap-2 px-6 py-3 rounded-2xl text-body font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-all active:scale-95"
            >
              <ArrowLeft size={18} /> {t("back")}
            </button>
          ) : <div />}

          <button 
            onClick={step < 3 ? handleNext : handleFinish} 
            className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-mentor text-mentor-foreground text-body font-bold shadow-xl shadow-mentor/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            {step < 3 ? (
              <>{t("next")} <ArrowRight size={20} /></>
            ) : (
              t("mentorOnboard.finish")
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
