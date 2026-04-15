import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/lib/language-context";
import { Community } from "@/lib/types";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { isCommunityJoined, joinCommunity } from "@/lib/community-join";
import { Check, Users } from "lucide-react";
import api from "@/lib/api";

interface CommunityCardProps {
  community: Community;
}

export function CommunityCard({ community }: CommunityCardProps) {
  const navigate = useNavigate();
  const { getLocalized, t } = useLanguage();
  const [isJoined, setIsJoined] = useState(false);
  const [memberCount, setMemberCount] = useState(community.members);

  const mName = community.mentorName || { en: "Expert", mr: "तज्ज्ञ" };
  const mAvatar = community.mentorAvatar || community.image;
  const unreadCount = community.unread || 0;

  useEffect(() => {
    setIsJoined(isCommunityJoined(community.id));
    setMemberCount(community.members);
  }, [community.id, community.members]);

  const handleJoin = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!community.id) return;
    if (isJoined) {
      navigate(`/community/${community.id}`);
      return;
    }
    try {
      await api.post(`/communities/${community.id}/join`);
      joinCommunity(community.id);
      setIsJoined(true);
      setMemberCount((prev) => prev + 1);
      toast.success(t("community.joined") || "Joined community");
      navigate(`/community/${community.id}`);
    } catch (err: any) {
      const message = err?.response?.data?.message;
      if (message === "Already a member") {
        joinCommunity(community.id);
        setIsJoined(true);
        navigate(`/community/${community.id}`);
        return;
      }
      toast.error(message || "Failed to join community");
    }
  };

  return (
    <div
      onClick={() => navigate(`/community/${community.id}`)}
      className="grid grid-cols-[56px_minmax(0,1fr)_auto] items-center gap-4 p-4 bg-card rounded-2xl shadow-sm border border-border cursor-pointer hover:border-primary/50 hover:shadow-md transition-all duration-300 animate-fade-in group relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative flex-shrink-0">
        <img 
          src={mAvatar} 
          alt={getLocalized(mName)} 
          className="w-14 h-14 rounded-2xl object-cover border border-border group-hover:border-primary/30 transition-colors" 
        />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 min-w-[22px] h-[22px] px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold border-2 border-card shadow-lg animate-pulse-subtle">
            {unreadCount}
          </span>
        )}
      </div>

      <div className="min-w-0 space-y-0.5">
        <h4 className="font-bold text-[15px] leading-5 text-foreground whitespace-nowrap overflow-hidden text-ellipsis group-hover:text-primary transition-colors">
          {getLocalized(community.name)}
        </h4>
        <p className="text-[12px] text-muted-foreground leading-5 truncate">
          {t("by") || "by"} {getLocalized(mName)}
        </p>
        <p className="text-[12px] text-muted-foreground leading-5">
          {memberCount} {t("community.members") || "members"}
        </p>
      </div>

      <div className="flex-shrink-0 self-center">
        <button
          onClick={handleJoin}
          className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all whitespace-nowrap ${
            isJoined
              ? "bg-primary/10 text-primary border-primary/20 cursor-default"
              : "bg-primary text-primary-foreground border-primary hover:brightness-110"
          }`}
          title={isJoined ? "Already joined" : "Join community"}
        >
          <span className="flex items-center gap-1.5">
            {isJoined ? <Check size={12} /> : <Users size={12} />}
            {isJoined ? (t("community.joined") || "Joined") : "Join Community"}
          </span>
        </button>
      </div>
    </div>
  );
}
