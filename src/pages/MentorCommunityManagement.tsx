import { useState } from "react";
import { communities } from "@/lib/constants";
import { ChatSection } from "@/components/mentor-connect/ChatSection";
import { SharedResourcesList } from "@/components/mentor-connect/SharedResourcesList";
import { ShareResourceForm } from "@/components/mentor-connect/ShareResourceForm";
import { ResponsiveLayout } from "@/components/mentor-connect/ResponsiveLayout";
import { Settings, Users, Upload, Plus, ShieldCheck, Award } from "lucide-react";
import { OpportunityCard } from "@/components/mentor-connect/OpportunityCard";
import { useOpportunities } from "@/lib/opportunities-context";
import { useLanguage } from "@/lib/language-context";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function MentorCommunityManagement() {
  const [activeTab, setActiveTab] = useState("chat");
  const [showShareForm, setShowShareForm] = useState(false);
  const { t, getLocalized } = useLanguage();
  const navigate = useNavigate();
  const { opportunities } = useOpportunities();
  
  // Real app would fetch the community owned by the mentor
  const community = communities[0];

  const tabs = [
    { key: "chat", label: t("mentor.community.tabChat") || "Communnity Chat" },
    { key: "opportunities", label: t("mentor.community.tabOpportunities") || "Opportunities" },
    { key: "members", label: t("mentor.community.tabMembers") || "Members" },
    { key: "shared resources", label: t("mentor.community.tabResources") || "Shared Resources" },
  ];

  // Using a simplified match for MVP: Nashville expert network synchronization
  const communityOpps = opportunities.slice(0, 5); 

  return (
    <ResponsiveLayout>
      <div className="min-h-screen bg-background pb-20 lg:pb-0 animate-fade-in flex flex-col">
        {/* Header Section */}
        <div className="bg-card border-b border-border/50 shadow-sm sticky top-0 z-30">
          <div className="max-w-5xl mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-mentor/10 text-mentor flex items-center justify-center shadow-inner">
                  <ShieldCheck size={32} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-h2 text-foreground font-bold tracking-tight">{getLocalized(community.name)}</h1>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-bold uppercase tracking-widest">{t("community.admin") || "Admin"}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-caption text-muted-foreground font-medium">
                    <div className="flex items-center gap-1.5">
                      <Users size={14} className="text-mentor" />
                      <span>{community.members} {t("community.members") || "members"}</span>
                    </div>
                    <span className="opacity-30">•</span>
                    <div className="flex items-center gap-1.5">
                      <Award size={14} className="text-mentor" />
                      <span>{t("community.verified") || "Verified Community"}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => navigate("/mentor/post")}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-caption font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  <Plus size={18} /> {t("mentor.dashboard.postOpportunity") || "Post Opportunity"}
                </button>
                <button 
                  onClick={() => toast.info(t("mentor.community.settings") || "Community settings coming soon")}
                  className="p-2.5 rounded-xl bg-muted text-muted-foreground hover:bg-mentor/10 hover:text-mentor transition-all shadow-sm"
                  aria-label="Settings"
                >
                  <Settings size={20} />
                </button>
              </div>
            </div>

            {/* Premium Tab Navigation */}
            <div className="flex gap-2 -mb-6 overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => (
                <button 
                  key={tab.key} 
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative px-6 py-3 text-body font-bold transition-all whitespace-nowrap rounded-t-2xl ${
                    activeTab === tab.key 
                      ? "text-mentor bg-mentor/5 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-1 after:bg-mentor" 
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full">
          <div className="flex-1 p-4 md:p-8">
            {activeTab === "chat" && <ChatSection />}

            {activeTab === "opportunities" && (
              <div className="animate-fade-in space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-h3 font-bold text-foreground">{t("mentor.community.tabOpportunities") || "Internal Opportunities"}</h2>
                  <button onClick={() => navigate("/mentor/post")} className="text-caption font-bold text-primary hover:underline flex items-center gap-1">
                    {t("add_new") || "Add New"} <Plus size={14} />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {communityOpps.length > 0 ? (
                    communityOpps.map((o) => <OpportunityCard key={o.id} opportunity={o} />)
                  ) : (
                    <div className="col-span-full py-20 text-center opacity-40">
                      <Plus size={48} className="mx-auto mb-4" />
                      <p className="text-body font-bold">{t("mentor.community.noOpportunities")}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "members" && (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 animate-fade-in">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center shadow-inner">
                  <Users size={40} className="text-muted-foreground opacity-20" />
                </div>
                <div>
                  <h3 className="text-h3 font-bold text-foreground">
                    {t("mentor.community.memberManagement") || "Manage Members"}
                  </h3>
                  <p className="text-body text-muted-foreground max-w-sm mx-auto mt-2 italic">
                    {t("mentor.community.memberManagementDesc") || "Approvals, roles, and community moderation features are launching in the next update."}
                  </p>
                </div>
              </div>
            )}

            {activeTab === "shared resources" && (
              <div className="animate-fade-in space-y-8">
                <div className="bg-gradient-to-r from-mentor to-primary p-1 rounded-3xl">
                  <div className="bg-card flex flex-col md:flex-row items-center justify-between p-6 rounded-[22px] gap-6">
                    <div className="space-y-1 text-center md:text-left">
                      <h2 className="text-h3 font-bold text-foreground">{t("mentor.community.sharedResources")}</h2>
                      <p className="text-caption text-muted-foreground">{t("mentor.community.sharedResourcesDesc") || "Upload documents, links, and videos for your students."}</p>
                    </div>
                    <button
                      onClick={() => setShowShareForm(true)}
                      className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-mentor text-mentor-foreground text-body font-bold shadow-lg shadow-mentor/20 hover:scale-[1.02] active:scale-95 transition-all w-full md:w-auto justify-center"
                    >
                      <Upload size={18} /> {t("resource.share.submitBtn")}
                    </button>
                  </div>
                </div>
                <div className="px-1">
                  <SharedResourcesList />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showShareForm && <ShareResourceForm onClose={() => setShowShareForm(false)} />}
    </ResponsiveLayout>
  );
}
