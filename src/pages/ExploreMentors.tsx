import { useState } from "react";
import { Search, Filter, X } from "lucide-react";
import { mentors, industries } from "@/lib/mock-data";
import { useLanguage } from "@/lib/language-context";
import { IndustryChip } from "@/components/mentor-connect/IndustryChip";
import { MentorCard } from "@/components/mentor-connect/MentorCard";
import { ResponsiveLayout } from "@/components/mentor-connect/ResponsiveLayout";

export default function ExploreMentors() {
  const [query, setQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("All");
  const { t, getLocalized } = useLanguage();

  const filtered = mentors.filter((m) => {
    const name = getLocalized(m.name).toLowerCase();
    const company = m.company.toLowerCase();
    const matchesSearch = name.includes(query.toLowerCase()) || company.includes(query.toLowerCase());
    const matchesIndustry = selectedIndustry === "All" || m.industry === selectedIndustry;
    return matchesSearch && matchesIndustry;
  });

  return (
    <ResponsiveLayout>
      <div className="min-h-screen bg-background pb-20 lg:pb-8 animate-fade-in">
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
          <div>
            <h1 className="text-h1 text-foreground tracking-tight">{t("explore.title")}</h1>
            <p className="text-body text-muted-foreground mt-2">{t("explore.subtitle") || "Find and connect with industry experts from Nashik."}</p>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 group">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input 
                value={query} 
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("explore.searchPlaceholder")}
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
            
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide md:max-w-[50%]">
              <IndustryChip 
                label={t("home.allMentors")} 
                selected={selectedIndustry === "All"} 
                onPress={() => setSelectedIndustry("All")} 
              />
              {industries.map((ind) => (
                <IndustryChip 
                  key={ind} 
                  label={ind} 
                  selected={selectedIndustry === ind} 
                  onPress={() => setSelectedIndustry(ind)} 
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((mentor) => (
              <MentorCard key={mentor.id} mentor={mentor} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                <Search size={40} className="text-muted-foreground opacity-20" />
              </div>
              <div>
                <h3 className="text-h3 font-bold text-foreground">
                  {t("explore.noMentors") || "No mentors found"}
                </h3>
                <p className="text-body text-muted-foreground mt-1">
                  {t("explore.tryDifferentSearch") || "Try adjusting your search or filters to find what you're looking for."}
                </p>
              </div>
              <button 
                onClick={() => { setQuery(""); setSelectedIndustry("All"); }}
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
