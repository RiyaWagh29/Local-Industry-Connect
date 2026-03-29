import { useState, KeyboardEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { StepProgressBar } from "@/components/mentor-connect/StepProgressBar";
import { IndustryChip } from "@/components/mentor-connect/IndustryChip";
import { SkillTag } from "@/components/mentor-connect/SkillTag";
import { Logo } from "@/components/mentor-connect/Logo";
import { LanguageToggle } from "@/components/mentor-connect/LanguageToggle";
import { industries } from "@/lib/mock-data";
import { ArrowLeft, ArrowRight, Sparkles, Target, Star } from "lucide-react";
import { toast } from "sonner";
import { ResponsiveLayout } from "@/components/mentor-connect/ResponsiveLayout";

export default function StudentOnboarding() {
  const navigate = useNavigate();
  const { user, updateUser, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  
  // Starting at step 2 because account info (Step 1) was done at registration
  const [step, setStep] = useState(2);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [goals, setGoals] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  const toggleIndustry = (ind: string) => {
    setSelectedIndustries((prev) =>
      prev.includes(ind) ? prev.filter((i) => i !== ind) : [...prev, ind]
    );
    if (errors.industries) setErrors(p => ({ ...p, industries: "" }));
  };

  const addSkill = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && skillInput.trim()) {
      e.preventDefault();
      const trimmed = skillInput.trim();
      if (skills.length >= 10) { 
        toast.error(t("studentOnboard.maxSkills") || "Maximum 10 skills allowed"); 
        return; 
      }
      if (!skills.includes(trimmed)) setSkills([...skills, trimmed]);
      setSkillInput("");
    }
  };

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (step === 2 && selectedIndustries.length === 0) {
      newErrors.industries = t("studentOnboard.industryError") || "Please select at least one industry";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => { 
    if (validateStep()) setStep(step + 1); 
  };

  const handleFinish = () => {
    if (!validateStep()) return;
    updateUser({ 
      industries: selectedIndustries, 
      skills, 
      goals 
    });
    toast.success(t("studentOnboard.welcome") || `Welcome to MentorConnect, ${user?.name}! 🎉`);
    navigate("/student/home");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-12 px-6 overflow-x-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="w-full max-w-xl relative z-10 space-y-10 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Logo size="md" />
          <LanguageToggle />
        </div>

        <div className="space-y-2">
          <StepProgressBar currentStep={step} totalSteps={3} variant="student" />
          <p className="text-v-small font-bold text-center text-primary uppercase tracking-widest">{t("step") || "Step"} {step} / 3</p>
        </div>

        <div className="bg-card rounded-3xl border border-border shadow-2xl p-8 md:p-10 transition-all">
          {step === 2 && (
            <div className="space-y-8 animate-slide-up">
              <div className="space-y-3">
                <h2 className="text-h1 text-foreground flex items-center gap-3">
                  {t("studentOnboard.step2.title")} <Sparkles className="text-primary" />
                </h2>
                <p className="text-body text-muted-foreground">
                  {t("studentOnboard.step2.subtitle")}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {industries.map((ind) => (
                  <IndustryChip 
                    key={ind} 
                    label={ind} 
                    selected={selectedIndustries.includes(ind)} 
                    onPress={() => toggleIndustry(ind)} 
                  />
                ))}
              </div>
              {errors.industries && (
                <p className="text-caption text-destructive font-medium bg-destructive/5 p-3 rounded-xl border border-destructive/20 animate-shake">
                  {errors.industries}
                </p>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-slide-up">
              <div className="space-y-3">
                <h2 className="text-h1 text-foreground flex items-center gap-3">
                  {t("studentOnboard.step3.title")} <Target className="text-primary" />
                </h2>
                <p className="text-body text-muted-foreground">
                  {t("studentOnboard.step3.subtitle")}
                </p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-caption font-bold text-muted-foreground uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Star size={14} className="text-primary" />
                    {t("studentOnboard.skillsLabel")}
                  </label>
                  <div className="relative group">
                    <input 
                      value={skillInput} 
                      onChange={(e) => setSkillInput(e.target.value)} 
                      onKeyDown={addSkill} 
                      placeholder={t("studentOnboard.skillPlaceholder")} 
                      className="w-full pl-5 pr-12 py-4 rounded-2xl border border-border bg-muted/30 text-foreground text-body focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all" 
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

                <div className="space-y-2">
                  <label className="text-caption font-bold text-muted-foreground uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Target size={14} className="text-primary" />
                    {t("studentOnboard.goalsLabel")}
                  </label>
                  <textarea 
                    value={goals} 
                    onChange={(e) => setGoals(e.target.value)} 
                    placeholder={t("studentOnboard.goalsPlaceholder")} 
                    rows={4} 
                    className="w-full px-5 py-4 rounded-2xl border border-border bg-muted/30 text-foreground text-body focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all resize-none" 
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4">
          {step > 2 ? (
            <button 
              onClick={() => setStep(step - 1)} 
              className="flex items-center gap-2 px-6 py-3 rounded-2xl text-body font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-all active:scale-95"
            >
              <ArrowLeft size={18} /> {t("back")}
            </button>
          ) : <div />}

          <div className="flex items-center gap-4">
            {step === 2 && (
              <button 
                onClick={() => setStep(step + 1)} 
                className="text-body font-bold text-muted-foreground hover:text-primary transition-colors"
              >
                {t("skip")}
              </button>
            )}
            
            {step < 3 ? (
              <button 
                onClick={handleNext} 
                className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-primary text-primary-foreground text-body font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                {t("next")} <ArrowRight size={20} />
              </button>
            ) : (
              <button 
                onClick={handleFinish} 
                className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-primary text-primary-foreground text-body font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                {t("studentOnboard.finish")}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
