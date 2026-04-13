import { Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/lib/language-context";
import { getText } from "@/lib/getText";
import { Mentor } from "@/lib/types";

interface MentorCardProps {
  mentor: Mentor;
}

export function MentorCard({ mentor }: MentorCardProps) {
  const navigate = useNavigate();
  const { t } = useLanguage();

  if (!mentor) return null;

  const mentorId = mentor.id || (mentor as any)._id;
  const name = getText(mentor.name);
  const role = getText(mentor.role);
  const company = mentor.company || "Professional";
  const industry = mentor.industry || "Software";
  const avatar = mentor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Mentor')}&background=random`;

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
        <p className="text-caption text-muted-foreground line-clamp-1">{role}</p>
        <p className="text-v-small text-muted-foreground font-medium truncate">{company}</p>
      </div>

      <div className="flex items-center gap-3 w-full justify-center">
        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-v-small font-bold uppercase tracking-wider truncate max-w-[80px]">
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
