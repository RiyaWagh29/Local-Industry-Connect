import { useState } from "react";
import { ResponsiveLayout } from "@/components/mentor-connect/ResponsiveLayout";
import { Users, Calendar, MoreVertical, MessageSquare, UserMinus, Shield, Search, X } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { toast } from "sonner";
import { LocalizedString } from "@/lib/types";

interface Member {
  id: string;
  name: LocalizedString;
  avatar: string;
  joined: LocalizedString;
  role?: string;
}

const initialMembers: Member[] = [
  { 
    id: "1", 
    name: { en: "Sumit Gaikwad", mr: "सुमित गायकवाड" }, 
    avatar: "https://images.unsplash.com/photo-1599566150163-29194dcabd9c?w=150&h=150&fit=crop&crop=face", 
    joined: { en: "January 2026", mr: "जानेवारी २०२६" },
    role: "Student"
  },
  { 
    id: "2", 
    name: { en: "Sneha Kadam", mr: "स्नेहा कदम" }, 
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face", 
    joined: { en: "February 2026", mr: "फेब्रुवारी २०२६" },
    role: "Student"
  },
  { 
    id: "3", 
    name: { en: "Abhishek More", mr: "अभिषेक मोरे" }, 
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face", 
    joined: { en: "March 2026", mr: "मार्च २०२६" },
    role: "Student"
  },
  { 
    id: "4", 
    name: { en: "Pooja Pawar", mr: "पूजा पवार" }, 
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face", 
    joined: { en: "March 2026", mr: "मार्च २०२६" },
    role: "Student"
  },
];

export default function MentorMembers() {
  const { t, getLocalized } = useLanguage();
  const [members, setMembers] = useState(initialMembers);
  const [query, setQuery] = useState("");

  const handleRemove = (id: string, name: string) => {
    if (window.confirm(`${t("community.leaveConfirm") || "Are you sure you want to remove this member?"}`)) {
      setMembers((prev) => prev.filter((m) => m.id !== id));
      toast.success(t("community.leftSuccess") || "Member removed successfully");
    }
  };

  const filtered = members.filter(m => 
    getLocalized(m.name).toLowerCase().includes(query.toLowerCase())
  );

  return (
    <ResponsiveLayout>
      <div className="min-h-screen bg-background pb-20 lg:pb-8 animate-fade-in">
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-h1 text-foreground tracking-tight">{t("members.title") || "Community Members"}</h1>
              <p className="text-body text-muted-foreground">{t("members.subtitle") || "Manage and interact with the students in your Nashik community."}</p>
            </div>
            <div className="flex items-center gap-3 bg-mentor/10 text-mentor px-5 py-2.5 rounded-2xl font-bold self-start md:self-auto">
              <Users size={20} />
              <span>{members.length} {t("community.members") || "Members"}</span>
            </div>
          </div>

          <div className="relative group">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-mentor transition-colors" />
            <input 
              value={query} 
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("members.searchPlaceholder") || "Search members by name..."}
              className="w-full pl-12 pr-10 py-4 rounded-2xl border border-border bg-card text-foreground text-body focus:ring-4 focus:ring-mentor/10 focus:border-mentor outline-none transition-all shadow-sm" 
            />
            {query && (
              <button onClick={() => setQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted text-muted-foreground">
                <X size={16} />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((m) => {
              const name = getLocalized(m.name);
              const joined = getLocalized(m.joined);
              
              return (
                <div key={m.id} className="group bg-card rounded-3xl border border-border shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300 p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className="relative">
                      <img src={m.avatar} alt={name} className="w-16 h-16 rounded-2xl object-cover border-2 border-transparent group-hover:border-mentor/30 transition-all shadow-md" />
                      <div className="absolute -bottom-1 -right-1 bg-green-500 border-4 border-card rounded-full w-5 h-5 shadow-sm" />
                    </div>
                    <button className="p-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
                      <MoreVertical size={18} />
                    </button>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-h3 text-foreground group-hover:text-mentor transition-colors">{name}</h4>
                      <Shield size={16} className="text-primary/40" />
                    </div>
                    <p className="text-v-small font-bold text-muted-foreground uppercase tracking-widest">{m.role || "Student"}</p>
                  </div>

                  <div className="flex items-center gap-4 mt-6 pt-6 border-t border-border/50">
                    <span className="text-v-small font-medium text-muted-foreground flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-xl">
                      <Calendar size={14} className="text-mentor" />
                      {joined}
                    </span>
                    <div className="flex-1" />
                    <button 
                      onClick={() => toast.info(`Chatting with ${name}...`)}
                      className="p-2.5 rounded-xl bg-mentor/10 text-mentor hover:bg-mentor hover:text-white transition-all shadow-sm"
                      title="Message Member"
                    >
                      <MessageSquare size={18} />
                    </button>
                    <button 
                      onClick={() => handleRemove(m.id, name)} 
                      className="p-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                      title="Remove Member"
                    >
                      <UserMinus size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {(filtered.length === 0 && query) && (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-60">
              <Users size={48} className="text-muted-foreground/30" />
              <p className="text-body font-bold text-muted-foreground">{t("members.noMatch") || "No members matched your search"}</p>
              <button onClick={() => setQuery("")} className="text-mentor font-bold hover:underline">Clear Search</button>
            </div>
          )}
          
          {members.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-60">
              <Users size={48} className="text-muted-foreground/30" />
              <p className="text-body font-bold text-muted-foreground">{t("members.comingSoon")}</p>
            </div>
          )}
        </div>
      </div>
    </ResponsiveLayout>
  );
}
