import { communities } from "@/lib/constants";
import { CommunityCard } from "@/components/mentor-connect/CommunityCard";
import { ResponsiveLayout } from "@/components/mentor-connect/ResponsiveLayout";
import { useLanguage } from "@/lib/language-context";

export default function StudentCommunities() {
  const { t } = useLanguage();
  return (
    <ResponsiveLayout>
      <div className="min-h-screen bg-background pb-20 lg:pb-8">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
          <h1 className="text-h2 text-foreground">{t("home.communitiesSection")}</h1>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {communities.length > 0 ? (
              communities.map((c) => (
                <CommunityCard key={c.id} community={c} />
              ))
            ) : (
              <div className="col-span-full py-20 border border-dashed border-border rounded-3xl flex flex-col items-center justify-center text-center space-y-3 bg-muted/20">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-2xl font-bold opacity-20">🏙️</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">No communities found</h3>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                    New professional communities in Nashik will be listed here soon.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ResponsiveLayout>
  );
}
