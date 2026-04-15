import { Users, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/lib/language-context";
import { getText } from "@/lib/getText";
import { Mentor } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";

interface MentorCardProps {
  mentor: Mentor;
}

export function MentorCard({ mentor }: MentorCardProps) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();

  if (!mentor) return null;

  const mentorId = mentor.id || (mentor as any)._id;
  const name = getText(mentor.name);
  const role = getText(mentor.role);
  const company = mentor.company || "Professional";
  const industry = mentor.industry || "Software";
  const avatar = mentor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Mentor')}&background=random`;
  const isFollowing = !!mentorId && Array.isArray(user?.following) && user.following.includes(mentorId);

  return (
    <div className="min-w-[200px] bg-card rounded-card shadow-card p-4 flex flex-col items-center gap-3 border border-border animate-fade-in group hover:border-primary/50 transition-all duration-300">
      <div className="relative">
        <img 
          src={avatar} 
          alt={name} 
          className="w-20 h-20 rounded-full object-cover border-2 border-transparent group-hover:border-primary transition-all" 
        />
        <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 border-2 border-card rounded-full shadow-sm" />
      </div>
      
      <div className="text-center space-y-1 w-full overflow-hidden">
        <h4 className="font-bold text-body text-foreground line-clamp-1">{name}</h4>
        <p className="text-[11px] leading-4 text-muted-foreground line-clamp-2 min-h-8">{role}</p>
        <p className="text-[10px] leading-4 text-muted-foreground font-medium line-clamp-2 min-h-8">{company}</p>
        {isFollowing && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-bold uppercase tracking-wider">
            <Check size={12} /> Following
          </span>
        )}
      </div>


      <div className="flex items-center gap-2 w-full justify-center">
        <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-[9px] font-bold tracking-wide leading-none whitespace-nowrap">
          {industry}
        </span>
        <div className="flex items-center gap-1 text-v-small text-muted-foreground">
          <Users size={12} />
          <span>{mentor.followers || 0}</span>
        </div>
      </div>

      <button
        onClick={() => mentorId && navigate(`/mentor/profile/${mentorId}`)}
        className="btn-primary w-full mt-1"
      >
        {t("mentor.viewProfile") || "View Profile"}
      </button>
    </div>
  );
}
