import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { ResponsiveLayout } from "@/components/mentor-connect/ResponsiveLayout";
import { Award, Star, TrendingUp, User, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Leaderboard() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [mentors, setMentors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('https://local-industry-connect.onrender.com/api/users/leaderboard');
        const data = await res.json();
        if (data.success) {
          setMentors(data.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <ResponsiveLayout>
      <div className="min-h-screen bg-background pb-20 lg:pb-8 animate-fade-in text-foreground">
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">
          <div className="text-center space-y-4">
             <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto text-primary animate-bounce shadow-xl">
                <Award size={40} />
             </div>
             <h1 className="text-h1 font-bold tracking-tight">Mentor Leaderboard</h1>
             <p className="text-body text-muted-foreground max-w-md mx-auto">
               Nashik's top-rated mentors recognized for their professional impact and guidance.
             </p>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-muted animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : mentors.length > 0 ? (
            <div className="bg-card border border-border rounded-[32px] overflow-hidden shadow-2xl divide-y divide-border/50">
              {mentors.map((mentor, index) => (
                <div 
                  key={mentor._id} 
                  onClick={() => navigate(`/mentor/${mentor._id}`)}
                  className="p-6 flex items-center gap-6 hover:bg-muted/30 transition-all cursor-pointer group"
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-lg shrink-0 ${
                    index === 0 ? "bg-yellow-500/20 text-yellow-600 shadow-lg shadow-yellow-500/10" :
                    index === 1 ? "bg-slate-400/20 text-slate-500 shadow-lg shadow-slate-500/10" :
                    index === 2 ? "bg-orange-400/20 text-orange-500 shadow-lg shadow-orange-500/10" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {index + 1}
                  </div>
                  
                  <div className="w-14 h-14 rounded-2xl bg-muted overflow-hidden shrink-0 border-2 border-border/50 shadow-sm relative">
                    {mentor.avatar ? (
                      <img src={mentor.avatar} alt={mentor.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground"><User size={24} /></div>
                    )}
                    {index < 3 && (
                      <div className="absolute -top-1 -right-1">
                        <Star size={14} className="fill-yellow-500 text-yellow-500" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-body truncate group-hover:text-primary transition-colors">{mentor.name}</h4>
                    <p className="text-caption text-muted-foreground truncate font-medium">{mentor.role} at {mentor.company}</p>
                    <div className="flex items-center gap-4 mt-1">
                       <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">{mentor.industry}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="flex items-center justify-end gap-1.5 font-extrabold text-primary text-lg">
                      <Star size={18} className="fill-primary" />
                      <span>{mentor.averageRating?.toFixed(1) || "5.0"}</span>
                    </div>
                    <p className="text-v-small font-bold text-muted-foreground uppercase tracking-tighter">Average Rating</p>
                  </div>
                  
                  <ChevronRight size={20} className="text-muted-foreground opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center bg-card border border-border rounded-[40px] border-dashed space-y-4">
               <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto opacity-20">
                  <TrendingUp size={32} />
               </div>
               <p className="text-body font-bold text-muted-foreground">Rankings arriving soon!</p>
            </div>
          )}
        </div>
      </div>
    </ResponsiveLayout>
  );
}

function ChevronRight({ size, className }: { size: number, className: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}
