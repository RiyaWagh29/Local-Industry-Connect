import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/lib/language-context";
import { LocalizedString } from "@/lib/mock-data";

interface CommunityCardProps {
  community: {
    id: string;
    name: LocalizedString;
    mentorName: LocalizedString;
    mentorAvatar: string;
    members: number;
    unread: number;
  };
}

export function CommunityCard({ community }: CommunityCardProps) {
  const navigate = useNavigate();
  const { getLocalized, t } = useLanguage();

  return (
    <div
      onClick={() => navigate(`/community/${community.id}`)}
      className="flex items-center gap-4 p-4 bg-card rounded-2xl shadow-sm border border-border cursor-pointer hover:border-primary/50 hover:shadow-md transition-all duration-300 animate-fade-in group relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative flex-shrink-0">
        <img 
          src={community.mentorAvatar} 
          alt={getLocalized(community.mentorName)} 
          className="w-14 h-14 rounded-2xl object-cover border border-border group-hover:border-primary/30 transition-colors" 
        />
        {community.unread > 0 && (
          <span className="absolute -top-2 -right-2 min-w-[22px] h-[22px] px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold border-2 border-card shadow-lg animate-pulse-subtle">
            {community.unread}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-body text-foreground truncate group-hover:text-primary transition-colors">
          {getLocalized(community.name)}
        </h4>
        <p className="text-caption text-muted-foreground mt-0.5">
          <span className="font-medium">{t("by") || "by"} {getLocalized(community.mentorName)}</span> 
          <span className="mx-2 opacity-30">•</span> 
          <span>{community.members} {t("community.members") || "members"}</span>
        </p>
      </div>

      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </div>
      </div>
    </div>
  );
}
