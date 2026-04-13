import { useState, useEffect } from "react";
import { communities } from "@/lib/constants";
import { ChatSection } from "@/components/mentor-connect/ChatSection";
import { SharedResourcesList } from "@/components/mentor-connect/SharedResourcesList";
import { ShareResourceForm } from "@/components/mentor-connect/ShareResourceForm";
import { ResponsiveLayout } from "@/components/mentor-connect/ResponsiveLayout";
import { Settings, Users, Upload, Plus, ShieldCheck, Award, Calendar } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function MentorCommunityManagement() {
  const [activeTab, setActiveTab] = useState("chat");
  const [showShareForm, setShowShareForm] = useState(false);
  const { user } = useAuth();
  const { t, getLocalized } = useLanguage();
  const navigate = useNavigate();
  const [community, setCommunity] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newComm, setNewComm] = useState({ name: "", description: "" });
  const [meetings, setMeetings] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { "Authorization": `Bearer ${token}` };
        
        // Fetch community
        const commRes = await fetch(`http://localhost:5000/api/communities/mentor/${user?.id}`, { headers });
        const commData = await commRes.json();
        if (commData.success && commData.data?.[0]) {
          setCommunity(commData.data[0]);
        }

        // Fetch meetings
        const meetRes = await fetch(`http://localhost:5000/api/meetings/mentor/${user?.id}`, { headers });
        const meetData = await meetRes.json();
        if (meetData.success) {
          setMeetings(meetData.data);
        }
      } catch (e) { 
        console.error("Fetch data error:", e);
      }
    };
    if (user?.id) fetchData();
  }, [user?.id]);

  const handleCreateCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComm.name || !newComm.description) return toast.error("Please fill all fields");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch('http://localhost:5000/api/communities', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newComm)
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Community created successfully!");
        setCommunity(data.data);
        setIsCreating(false);
      } else {
        toast.error(data.message || "Failed to create community");
      }
    } catch (e) {
      toast.error("Creation failed");
    }
  };

  if (!community && !isCreating) {
    return (
      <ResponsiveLayout>
        <div className="min-h-screen bg-background pb-20 lg:pb-0 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
          <div className="w-24 h-24 rounded-3xl bg-muted flex items-center justify-center mb-6 shadow-inner">
            <Users size={48} className="text-muted-foreground opacity-20" />
          </div>
          <h1 className="text-h2 font-bold text-foreground mb-2">No community yet</h1>
          <p className="text-body text-muted-foreground max-w-sm mb-8">
            Create your professional community to start interacting with students and sharing resources.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs">
            <button 
              onClick={() => setIsCreating(true)}
              className="flex-1 px-6 py-3 rounded-2xl bg-mentor text-mentor-foreground font-bold shadow-xl shadow-mentor/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
              Create Community
            </button>
            <button 
              onClick={() => navigate("/mentor/dashboard")}
              className="flex-1 px-6 py-3 rounded-2xl bg-muted text-muted-foreground font-bold hover:bg-muted/80 transition-all"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  if (isCreating) {
    return (
      <ResponsiveLayout>
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 animate-fade-in">
          <div className="w-full max-w-md bg-card border border-border rounded-3xl p-8 shadow-2xl">
             <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setIsCreating(false)} className="p-2 rounded-xl bg-muted"><ArrowLeft size={18} /></button>
                <h2 className="text-h2 font-bold">New Community</h2>
             </div>
             <form onSubmit={handleCreateCommunity} className="space-y-6">
                <div className="space-y-2">
                   <label className="text-caption font-bold text-muted-foreground uppercase tracking-widest ml-1">Community Name</label>
                   <input 
                      value={newComm.name} 
                      onChange={e => setNewComm(p => ({...p, name: e.target.value}))}
                      placeholder="e.g. Nashik React Developers"
                      className="w-full px-5 py-4 rounded-2xl border border-border bg-muted/30 text-foreground text-body focus:ring-4 focus:ring-mentor/10 focus:border-mentor outline-none transition-all"
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-caption font-bold text-muted-foreground uppercase tracking-widest ml-1">Description</label>
                   <textarea 
                      value={newComm.description} 
                      onChange={e => setNewComm(p => ({...p, description: e.target.value}))}
                      placeholder="Describe your community..."
                      rows={4}
                      className="w-full px-5 py-4 rounded-2xl border border-border bg-muted/30 text-foreground text-body focus:ring-4 focus:ring-mentor/10 focus:border-mentor outline-none transition-all resize-none"
                   />
                </div>
                <button type="submit" className="w-full py-4 rounded-2xl bg-mentor text-mentor-foreground font-bold shadow-xl shadow-mentor/20 hover:scale-[1.02] active:scale-95 transition-all">
                  Launch Community 🚀
                </button>
             </form>
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  const tabs = [
    { key: "chat", label: t("mentor.community.tabChat") || "Communnity Chat" },
    { key: "meetings", label: t("nav.meetings") || "Meetings" },
    { key: "members", label: t("mentor.community.tabMembers") || "Members" },
    { key: "shared resources", label: t("mentor.community.tabResources") || "Shared Resources" },
  ];


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
                    <h1 className="text-h2 text-foreground font-bold tracking-tight">{community?.name}</h1>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-bold uppercase tracking-widest">{t("community.admin") || "Admin"}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-caption text-muted-foreground font-medium">
                    <div className="flex items-center gap-1.5">
                      <Users size={14} className="text-mentor" />
                      <span>{community?.members || 0} {t("community.members") || "members"}</span>
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
                  onClick={() => setActiveTab("meetings")}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-caption font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  <Calendar size={18} /> Manage Meetings
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
                  className={`relative px-6 py-3 text-body font-bold transition-all whitespace-nowrap rounded-t-2xl ${activeTab === tab.key
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

            {activeTab === "meetings" && (
              <div className="animate-fade-in space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-h3 font-bold text-foreground">Pending Requests</h2>
                </div>
                {meetings.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {meetings.map((m) => (
                      <div key={m._id} className="bg-card border border-border p-6 rounded-3xl flex items-center justify-between hover:shadow-md transition-all">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary">
                             <Calendar size={24} />
                           </div>
                           <div>
                              <p className="font-bold text-body">{m.student_id?.name}</p>
                              <p className="text-caption text-muted-foreground">{new Date(m.date_time).toLocaleString()}</p>
                           </div>
                        </div>
                        <div className="flex gap-2">
                           <button className="px-4 py-2 bg-mentor text-mentor-foreground rounded-xl text-caption font-bold hover:scale-105 transition-all">Review</button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-20 text-center border-2 border-dashed border-border rounded-[40px] space-y-4">
                    <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto opacity-20">
                      <Calendar size={40} />
                    </div>
                    <div>
                        <h4 className="text-body font-bold text-foreground">No meeting requests</h4>
                        <p className="text-caption text-muted-foreground">Requests from your community will appear here.</p>
                    </div>
                  </div>
                )}
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
