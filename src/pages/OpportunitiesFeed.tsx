import { useState } from "react";
import { Search, Briefcase, Filter, X } from "lucide-react";
import { opportunities } from "@/lib/mock-data";
import { OpportunityCard } from "@/components/mentor-connect/OpportunityCard";
import { IndustryChip } from "@/components/mentor-connect/IndustryChip";
import { ResponsiveLayout } from "@/components/mentor-connect/ResponsiveLayout";
import { useLanguage } from "@/lib/language-context";

export default function OpportunitiesFeed() {
  const { t, getLocalized } = useLanguage();
  const [selectedType, setSelectedType] = useState("All");
  const [query, setQuery] = useState("");

  const typeFilters = [
    { id: "All", label: t("home.allMentors") || "All" },
    { id: "Internship", label: t("opps.typeInternship") || "Internships" },
    { id: "Job", label: t("opps.typeJob") || "Jobs" },
  ];

  const filtered = opportunities.filter((o) => {
    const matchesType = selectedType === "All" || o.type === selectedType;
    const title = getLocalized(o.title).toLowerCase();
    const company = o.company.toLowerCase();
    const matchesSearch = title.includes(query.toLowerCase()) || company.includes(query.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <ResponsiveLayout>
      <div className="min-h-screen bg-background pb-20 lg:pb-8 animate-fade-in">
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
          <div>
            <h1 className="text-h1 text-foreground tracking-tight">{t("opps.title")}</h1>
            <p className="text-body text-muted-foreground mt-2">
              {t("opps.subtitle") || "Explore internship and job opportunities from Nashik's top companies."}
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 group">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input 
                value={query} 
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("opps.searchPlaceholder") || "Search opportunities or companies..."}
                className="w-full pl-12 pr-10 py-4 rounded-2xl border border-border bg-card text-foreground text-body focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all shadow-sm" 
              />
              {query && (
                <button 
                  onClick={() => setQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted text-muted-foreground"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide md:max-w-[40%]">
              {typeFilters.map((type) => (
                <IndustryChip 
                  key={type.id} 
                  label={type.label} 
                  selected={selectedType === type.id} 
                  onPress={() => setSelectedType(type.id)} 
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {filtered.map((o) => <OpportunityCard key={o.id} opportunity={o} />)}
          </div>

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center shadow-inner">
                <Briefcase size={40} className="text-muted-foreground opacity-20" />
              </div>
              <div>
                <h3 className="text-h3 font-bold text-foreground">
                  {t("opps.noOpps") || "No opportunities found"}
                </h3>
                <p className="text-body text-muted-foreground mt-1 max-w-xs mx-auto">
                  {t("opps.noOppsDesc") || "Try adjusting your filters or search to find other roles."}
                </p>
              </div>
              <button 
                onClick={() => { setQuery(""); setSelectedType("All"); }}
                className="text-primary font-bold hover:underline"
              >
                {t("explore.clearFilters") || "Clear all filters"}
              </button>
            </div>
          )}
        </div>
      </div>
    </ResponsiveLayout>
  );
}
