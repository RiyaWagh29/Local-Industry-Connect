import { Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLanguage } from "@/lib/language-context";
import { LocalizedString } from "@/lib/types";

interface PostCardProps {
  post: {
    id: string;
    authorName: LocalizedString;
    authorAvatar: string;
    isMentor: boolean;
    timestamp: LocalizedString;
    content: LocalizedString;
    likes: number;
    comments: number;
  };
}

export function PostCard({ post }: PostCardProps) {
  const { getLocalized, t } = useLanguage();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);

  const toggleLike = () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
    if (!liked) toast.success(t("post.liked") || "❤️ Liked!");
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success(t("post.linkCopied") || "Link copied! 📋");
  };

  const handleComment = () => {
    toast.info(t("student.profile.featureSoon") || "Comments feature coming soon!");
  };

  return (
    <div className="bg-card rounded-2xl shadow-sm border border-border p-5 animate-fade-in hover:shadow-md transition-all duration-300 group">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img 
              src={post.authorAvatar || `https://ui-avatars.com/api/?name=${getLocalized(post.authorName)}&background=random`} 
              alt={getLocalized(post.authorName)} 
              className="w-12 h-12 rounded-full object-cover border-2 border-transparent group-hover:border-primary/30 transition-all" 
            />
            {post.isMentor && (
              <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-0.5 border-2 border-card" title="Mentor">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-body text-foreground group-hover:text-primary transition-colors">
                {getLocalized(post.authorName)}
              </span>
              {post.isMentor && (
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                  Mentor
                </span>
              )}
            </div>
            <span className="text-v-small text-muted-foreground font-medium">
              {getLocalized(post.timestamp)}
            </span>
          </div>
        </div>
        <button className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors">
          <MoreHorizontal size={20} />
        </button>
      </div>

      <p className="text-body text-foreground leading-relaxed mb-6 whitespace-pre-wrap">
        {getLocalized(post.content)}
      </p>

      <div className="flex items-center gap-8 pt-4 border-t border-border/50">
        <button 
          onClick={toggleLike} 
          className={`flex items-center gap-2 text-caption font-semibold transition-all hover:scale-110 ${liked ? "text-red-500" : "text-muted-foreground hover:text-red-500"}`}
        >
          <Heart size={20} fill={liked ? "currentColor" : "none"} />
          <span>{likeCount}</span>
        </button>
        
        <button 
          onClick={handleComment} 
          className="flex items-center gap-2 text-caption font-semibold text-muted-foreground hover:text-primary transition-all hover:scale-110"
        >
          <MessageCircle size={20} />
          <span>{post.comments}</span>
        </button>
        
        <button 
          onClick={handleShare} 
          className="flex items-center gap-2 text-caption font-semibold text-muted-foreground hover:text-primary transition-all hover:scale-110 ml-auto"
        >
          <Share2 size={20} />
        </button>
      </div>
    </div>
  );
}
