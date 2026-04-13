import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Shield, Award, Info, Share2 } from "lucide-react";
import { communities } from "@/lib/constants";
import { useLanguage } from "@/lib/language-context";
import { ChatSection } from "@/components/mentor-connect/ChatSection";
import { SharedResourcesList } from "@/components/mentor-connect/SharedResourcesList";
import { ResponsiveLayout } from "@/components/mentor-connect/ResponsiveLayout";
import { toast } from "sonner";

export default function CommunityScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, getLocalized } = useLanguage();
  const community = communities.find((c) => c.id === id);
  const [activeTab, setActiveTab] = useState("chat");
  const [joined, setJoined] = useState(true);

  if (!community) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-muted-foreground gap-4">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
        <Info size={32} />
      </div>
      <p className="font-medium">{t("community.notFound") || "Community not found"}</p>
      <button onClick={() => navigate("/student/communities")} className="text-primary font-bold hover:underline">
        {t("nav.communities") || "Go back to Communities"}
      </button>
    </div>
  );

  const tabs = [
    { key: "chat", label: t("community.tabChat") || "Chat" },
    { key: "meetings", label: t("nav.meetings") || "Meetings" },
    { key: "members", label: t("community.tabMembers") || "Members" },
    { key: "resources", label: t("community.tabResources") || "Resources" },
  ];

  const handleLeave = () => {
    // Custom premium confirm dialog would be better, but native confirm for now
    if (window.confirm(t("community.leaveConfirm") || "Are you sure you want to leave this community?")) {
      setJoined(false);
      toast.success(t("community.leftSuccess") || "Successfully left the community");
      navigate("/student/communities");
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success(t("post.linkCopied") || "Link copied! 📋");
  };

  return (
    <ResponsiveLayout>
      <div className="min-h-screen bg-background pb-20 lg:pb-0 animate-fade-in flex flex-col">
        {/* Header Section */}
        <div className="bg-card border-b border-border/50 shadow-sm sticky top-0 z-30">
          <div className="max-w-5xl mx-auto px-4 py-4 md:py-6">
            <div className="flex items-start md:items-center justify-between gap-4 mb-6">
              <div className="flex items-start md:items-center gap-4 flex-1">
                <button 
                  onClick={() => navigate(-1)} 
                  className="p-2 rounded-xl bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all mt-1 md:mt-0"
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-h2 text-foreground truncate">{getLocalized(community.name)}</h1>
                    <Shield size={18} className="text-primary/60 shrink-0" />
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-caption text-muted-foreground font-medium">
                    <div className="flex items-center gap-1.5 hover:text-primary cursor-pointer transition-colors" onClick={() => community.mentorId && navigate(`/mentor/profile/${community.mentorId}`)}>
                      <img src={community.mentorAvatar || ""} alt="" className="w-5 h-5 rounded-full border border-border" />
                      <span>{getLocalized(community.mentorName || { en: 'Expert', mr: 'तज्ज्ञ' })}</span>
                      <Award size={12} className="text-mentor" />
                    </div>
                    <span className="opacity-30">•</span>
                    <div className="flex items-center gap-1.5">
                      <Users size={14} className="text-primary/60" />
                      <span>{community.members} {t("community.members") || "members"}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleShare}
                  className="p-2.5 rounded-xl bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all hidden md:flex"
                  title="Share Community"
                >
                  <Share2 size={18} />
                </button>
                <button 
                  onClick={handleLeave} 
                  className="px-4 py-2 rounded-xl border border-destructive/20 text-destructive text-caption font-bold hover:bg-destructive/5 transition-all"
                >
                  {t("community.leave") || "Leave"}
                </button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-1 -mb-4 overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => (
                <button 
                  key={tab.key} 
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative px-5 py-3 text-body font-bold transition-all whitespace-nowrap rounded-t-xl ${
                    activeTab === tab.key 
                      ? "text-primary bg-primary/5 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-1 after:bg-primary" 
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
          <div className="flex-1 p-4 md:p-6">
            {activeTab === "chat" && <ChatSection />}
            
            {activeTab === "meetings" && (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 animate-fade-in">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center shadow-inner">
                  <Award size={40} className="text-muted-foreground opacity-20" />
                </div>
                <div>
                  <h3 className="text-h3 font-bold text-foreground">
                    Mentorship Meetings
                  </h3>
                  <p className="text-body text-muted-foreground max-w-sm mx-auto mt-1">
                    Book 1:1 sessions or group calls directly with your community mentor. Feature coming soon!
                  </p>
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
                    {t("community.memberListSoon") || "Members list is private"}
                  </h3>
                  <p className="text-body text-muted-foreground max-w-sm mx-auto mt-1">
                    {t("community.memberListSoonDesc") || "Connect with peers directly via the chat or mutual interest groups."}
                  </p>
                </div>
              </div>
            )}
            
            {activeTab === "resources" && (
              <div className="animate-fade-in">
                <SharedResourcesList />
              </div>
            )}
          </div>
        </div>
      </div>
    </ResponsiveLayout>
  );
}
