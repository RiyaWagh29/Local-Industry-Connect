import { MapPin, Calendar, Bookmark, Briefcase, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/lib/auth-context";
import { useOpportunities } from "@/lib/opportunities-context";
import { Opportunity } from "@/lib/types";

interface OpportunityCardProps {
  opportunity: Opportunity;
  onApply?: () => void;
}

export function OpportunityCard({ opportunity, onApply }: OpportunityCardProps) {
  const { getLocalized, t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const { savedOpportunityIds, toggleSaveOpportunity } = useOpportunities();
  const [applied, setApplied] = useState(false);

  const isSaved = savedOpportunityIds.includes(opportunity.id);

  const typeBadgeClass =
    opportunity.type === "Internship"
      ? "bg-emerald-500/10 text-emerald-600"
      : opportunity.type === "Job"
      ? "bg-blue-500/10 text-blue-600"
      : "bg-amber-500/10 text-amber-600";

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error(t("auth.signInToViewProfile") || "Please sign in to save opportunities");
      return;
    }

    try {
      await toggleSaveOpportunity(opportunity.id);
      if (isSaved) {
        toast.success(t("opps.removedBookmark") || "Bookmark removed");
      } else {
        toast.success(t("opps.addedBookmark") || "Bookmarked! 🔖");
      }
    } catch (error) {
       toast.error("Failed to update bookmark");
    }
  };

  const handleApply = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error(t("auth.signInToViewProfile") || "Please sign in to apply");
      return;
    }

    if (applied) {
      toast.info(t("opps.alreadyApplied") || "You have already applied!");
      return;
    }
    setApplied(true);
    toast.success(t("opps.applySuccess", { title: getLocalized(opportunity.title) }) || `Successfully applied for ${getLocalized(opportunity.title)}! 🎉`);
    onApply?.();
  };

  return (
    <div className="bg-card rounded-2xl shadow-sm border border-border p-5 animate-fade-in hover:shadow-md transition-all duration-300 group">
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
            <Briefcase size={22} />
          </div>
          <div>
            <h4 className="font-bold text-body text-foreground leading-snug group-hover:text-primary transition-colors">
              {getLocalized(opportunity.title)}
            </h4>
            <p className="text-caption text-muted-foreground font-medium">{opportunity.company}</p>
          </div>
        </div>
        <button 
          onClick={handleSave} 
          className={`p-2 rounded-lg transition-all ${isSaved ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-primary/20 hover:text-primary"}`}
          title={t("save") || "Save"}
        >
          <Bookmark size={18} fill={isSaved ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${typeBadgeClass}`}>
          {opportunity.type}
        </span>
      </div>

      <div className="flex flex-col gap-2 p-3 bg-muted/40 rounded-xl mb-4 text-v-small text-muted-foreground">
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-muted-foreground/60" />
          <span className="font-medium text-foreground/80">{getLocalized(opportunity.location)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-muted-foreground/60" />
          <span className="font-medium text-foreground/80">{t("opps.deadline") || "Deadline"}: {opportunity.deadline}</span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/50">
        <p className="text-v-small text-muted-foreground font-medium">
          {t("by") || "by"} {getLocalized(opportunity.mentorName)}
        </p>
        <button
          onClick={handleApply}
          className={applied ? "h-11 px-6 rounded-xl text-caption font-bold transition-all active:scale-95 flex items-center justify-center whitespace-nowrap gap-2 bg-emerald-500 text-white" : "btn-primary"}
        >
          {applied ? <><CheckCircle2 size={18} /> {t("opps.applied") || "Applied"}</> : t("opportunities.applyNow")}
        </button>
      </div>
    </div>
  );
}
