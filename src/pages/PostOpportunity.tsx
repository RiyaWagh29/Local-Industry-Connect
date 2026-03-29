import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Briefcase, Building2, MapPin, Calendar, AlignLeft, Send, Sparkles } from "lucide-react";
import { IndustryChip } from "@/components/mentor-connect/IndustryChip";
import { ResponsiveLayout } from "@/components/mentor-connect/ResponsiveLayout";
import { toast } from "sonner";
import { useLanguage } from "@/lib/language-context";

const opportunityTypes = ["Internship", "Job", "Workshop", "Mentorship Call", "Resource"];

interface FormErrors {
  title?: string;
  type?: string;
  company?: string;
  location?: string;
  description?: string;
  deadline?: string;
}

export default function PostOpportunity() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [title, setTitle] = useState("");
  const [type, setType] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [remote, setRemote] = useState(false);
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!title.trim()) newErrors.title = t("resource.share.titleRequired") || "Title is required";
    else if (title.trim().length < 3) newErrors.title = "Title must be at least 3 characters";
    
    if (!type) newErrors.type = t("mentorOnboard.industryError") || "Type is required";
    if (!company.trim()) newErrors.company = t("mentorOnboard.companyError") || "Company name is required";
    if (!remote && !location.trim()) newErrors.location = "Location is required or select Remote";
    if (!description.trim()) newErrors.description = t("resource.share.descRequired") || "Description is required";
    if (!deadline) newErrors.deadline = "Deadline is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setIsSubmitting(true);
      setTimeout(() => {
        toast.success(t("postOpp.success") || "Opportunity posted successfully! 🎉");
        setIsSubmitting(false);
        navigate("/mentor/dashboard");
      }, 800);
    } else {
      toast.error(t("error.fillFields") || "Please fill in all fields correctly");
    }
  };

  const inputClass = (err?: string) =>
    `w-full px-5 py-4 rounded-2xl border ${err ? 'border-destructive ring-destructive/10' : 'border-border focus:border-mentor ring-mentor/10'} bg-muted/30 text-foreground text-body focus:ring-4 outline-none transition-all shadow-sm`;

  return (
    <ResponsiveLayout>
      <div className="min-h-screen bg-background pb-20 lg:pb-8 animate-fade-in">
        <div className="bg-card border-b border-border/50 sticky top-0 z-30 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-4 md:py-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate(-1)} 
                className="p-2 rounded-xl bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all active:scale-95"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-h2 text-foreground font-bold tracking-tight">{t("postOpp.title")}</h1>
                <p className="text-caption text-muted-foreground hidden md:block">{t("postOpp.subtitle") || "Share a new career or growth opportunity with the community."}</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-mentor/10 text-mentor rounded-full text-v-small font-bold uppercase tracking-widest">
              <Sparkles size={14} /> {t("mentor.verified") || "Verified Mentor"}
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-10">
          <form onSubmit={handleSubmit} className="bg-card rounded-3xl border border-border shadow-2xl p-8 md:p-10 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Title */}
              <div className="space-y-2">
                <label className="text-caption font-bold text-muted-foreground uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Briefcase size={14} className="text-mentor" />
                  {t("resource.share.resourceTitle")} *
                </label>
                <input 
                  value={title} 
                  onChange={(e) => { setTitle(e.target.value); setErrors(prev => ({ ...prev, title: undefined })); }} 
                  placeholder={t("postOpp.titlePlaceholder") || "e.g. Frontend Intern"} 
                  className={inputClass(errors.title)} 
                />
                {errors.title && <p className="text-caption text-destructive font-bold ml-1">{errors.title}</p>}
              </div>

              {/* Company */}
              <div className="space-y-2">
                <label className="text-caption font-bold text-muted-foreground uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Building2 size={14} className="text-mentor" />
                  {t("mentorOnboard.companyLabel") || "Company"} *
                </label>
                <input 
                  value={company} 
                  onChange={(e) => { setCompany(e.target.value); setErrors(prev => ({ ...prev, company: undefined })); }} 
                  placeholder={t("mentorOnboard.companyPlaceholder") || "Company name"} 
                  className={inputClass(errors.company)} 
                />
                {errors.company && <p className="text-caption text-destructive font-bold ml-1">{errors.company}</p>}
              </div>

              {/* Type */}
              <div className="md:col-span-2 space-y-3">
                <label className="text-caption font-bold text-muted-foreground uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Sparkles size={14} className="text-mentor" />
                  {t("resource.share.type")} *
                </label>
                <div className="flex flex-wrap gap-2 p-4 bg-muted/20 rounded-2xl border border-border/50">
                  {opportunityTypes.map((opt) => (
                    <IndustryChip 
                      key={opt} 
                      label={opt} 
                      selected={type === opt} 
                      variant="mentor" 
                      onPress={() => { setType(opt); setErrors(prev => ({ ...prev, type: undefined })); }} 
                    />
                  ))}
                </div>
                {errors.type && <p className="text-caption text-destructive font-bold ml-1">{errors.type}</p>}
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="text-caption font-bold text-muted-foreground uppercase tracking-widest ml-1 flex items-center gap-2">
                  <MapPin size={14} className="text-mentor" />
                  {t("opps.location") || "Location"} *
                </label>
                <div className="flex gap-3">
                  <input 
                    value={location} 
                    disabled={remote}
                    onChange={(e) => { setLocation(e.target.value); setErrors(prev => ({ ...prev, location: undefined })); }} 
                    placeholder={remote ? "Remote Working" : "e.g. Nashik, Maharashtra"} 
                    className={`${inputClass(errors.location)} flex-1 ${remote ? 'opacity-50 cursor-not-allowed' : ''}`} 
                  />
                  <button 
                    type="button"
                    onClick={() => { setRemote(!remote); if(!remote) setLocation(""); setErrors(prev => ({ ...prev, location: undefined })); }} 
                    className={`px-6 rounded-2xl text-caption font-bold uppercase tracking-widest transition-all shadow-sm active:scale-95 ${remote ? "bg-mentor text-mentor-foreground shadow-mentor/20" : "bg-muted text-muted-foreground hover:bg-muted-foreground/10"}`}
                  >
                    Remote
                  </button>
                </div>
                {errors.location && <p className="text-caption text-destructive font-bold ml-1">{errors.location}</p>}
              </div>

              {/* Deadline */}
              <div className="space-y-2">
                <label className="text-caption font-bold text-muted-foreground uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Calendar size={14} className="text-mentor" />
                  {t("opps.deadline") || "Deadline"} *
                </label>
                <input 
                  type="date" 
                  value={deadline} 
                  onChange={(e) => { setDeadline(e.target.value); setErrors(prev => ({ ...prev, deadline: undefined })); }} 
                  className={inputClass(errors.deadline)} 
                />
                {errors.deadline && <p className="text-caption text-destructive font-bold ml-1">{errors.deadline}</p>}
              </div>

              {/* Description */}
              <div className="md:col-span-2 space-y-2">
                <label className="text-caption font-bold text-muted-foreground uppercase tracking-widest ml-1 flex items-center gap-2">
                  <AlignLeft size={14} className="text-mentor" />
                  {t("resource.share.description")} *
                </label>
                <textarea 
                  value={description} 
                  onChange={(e) => { setDescription(e.target.value); setErrors(prev => ({ ...prev, description: undefined })); }} 
                  placeholder={t("postOpp.descPlaceholder") || "Provide key requirements, benefits, and how to apply..."} 
                  rows={6} 
                  className={`${inputClass(errors.description)} resize-none`} 
                />
                {errors.description && <p className="text-caption text-destructive font-bold ml-1">{errors.description}</p>}
              </div>
            </div>

            <div className="pt-6 border-t border-border/50">
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-3 py-5 rounded-3xl bg-mentor text-mentor-foreground text-body font-extrabold uppercase tracking-widest shadow-xl shadow-mentor/20 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-6 h-6 border-3 border-mentor-foreground border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send size={20} />
                    {t("postOpp.submit") || "Post Opportunity"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ResponsiveLayout>
  );
}
