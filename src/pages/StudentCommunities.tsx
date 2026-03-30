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
            {communities.map((c) => (
              <CommunityCard key={c.id} community={c} />
            ))}
          </div>
        </div>
      </div>
    </ResponsiveLayout>
  );
}
