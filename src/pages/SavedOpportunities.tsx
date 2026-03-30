import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { useOpportunities } from "@/lib/opportunities-context";
import { ArrowLeft, Bookmark, Search } from "lucide-react";
import { ResponsiveLayout } from "@/components/mentor-connect/ResponsiveLayout";
import { OpportunityCard } from "@/components/mentor-connect/OpportunityCard";

export default function SavedOpportunities() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { opportunities, savedOpportunityIds, isLoading } = useOpportunities();

  const savedOpps = opportunities.filter((opp) => savedOpportunityIds.includes(opp.id));

  return (
    <ResponsiveLayout>
      <div className="min-h-screen bg-background pb-20 lg:pb-8 animate-fade-in">
        <div className="bg-card border-b border-border px-4 py-4 sticky top-0 z-10">
          <div className="max-w-3xl mx-auto flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-h3 font-bold text-foreground">{t("student.profile.savedOpportunities")}</h1>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-8">
          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-64 rounded-2xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : savedOpps.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {savedOpps.map((opp) => (
                <OpportunityCard key={opp.id} opportunity={opp} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                <Bookmark size={40} className="text-muted-foreground opacity-20" />
              </div>
              <div className="space-y-1">
                <h3 className="text-h3 font-bold text-foreground">{t("student.profile.noSavedTitle") || "No saved opportunities yet"}</h3>
                <p className="text-body text-muted-foreground max-w-xs mx-auto">
                  {t("student.profile.noSavedDesc") || "Opportunities you save will appear here for quick access."}
                </p>
              </div>
              <button
                onClick={() => navigate("/student/opportunities")}
                className="btn-primary"
              >
                <Search size={18} />
                {t("home.oppsSection")}
              </button>
            </div>
          )}
        </div>
      </div>
    </ResponsiveLayout>
  );
}
