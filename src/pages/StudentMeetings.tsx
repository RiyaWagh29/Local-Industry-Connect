import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { ResponsiveLayout } from "@/components/mentor-connect/ResponsiveLayout";
import { Calendar, Clock, MessageSquare, Info } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function StudentMeetings() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMeetings = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`https://local-industry-connect.onrender.com/api/meetings/student/${user?.id}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setMeetings(data.data);
        }
      } catch (e) {
        console.error(e);
        toast.error("Failed to fetch your meetings");
      } finally {
        setIsLoading(false);
      }
    };
    if (user?.id) fetchMeetings();
  }, [user?.id]);

  return (
    <ResponsiveLayout>
      <div className="min-h-screen bg-background pb-20 lg:pb-8 animate-fade-in">
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
          <div className="flex flex-col space-y-2">
            <h1 className="text-h2 font-bold text-foreground">{t("nav.meetings") || "My Meetings"}</h1>
            <p className="text-body text-muted-foreground">Track your mentorship sessions and requests.</p>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-muted animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : meetings.length > 0 ? (
            <div className="space-y-4">
              {meetings.map((m) => (
                <div key={m._id} className="bg-card border border-border p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-lg transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Calendar size={24} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-body truncate">{m.mentor_id?.name || "Mentor"}</p>
                      <div className="flex items-center gap-2 text-caption text-muted-foreground mt-1 font-medium">
                        <Clock size={14} />
                        <span>{new Date(m.date_time).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest ${
                      m.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-600' : 
                      m.status === 'pending' ? 'bg-amber-500/10 text-amber-600' : 
                      'bg-destructive/10 text-destructive'
                    }`}>
                      {m.status}
                    </span>
                    
                    {m.status === 'accepted' && (
                       <button 
                         onClick={() => navigate(`/messages/${m.mentor_id?._id}`)}
                         className="p-2.5 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
                         title="Message Mentor"
                       >
                         <MessageSquare size={18} />
                       </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center bg-card border border-border rounded-[40px] border-dashed space-y-4">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto opacity-20 shadow-inner">
                <Info size={40} />
              </div>
              <div>
                <h3 className="text-body font-bold text-foreground">No meetings scheduled</h3>
                <p className="text-caption text-muted-foreground max-w-xs mx-auto">
                  Find a mentor and request a session to get started on your professional journey!
                </p>
                <button 
                  onClick={() => navigate("/student/explore")}
                  className="mt-6 px-8 py-3 bg-primary text-primary-foreground font-bold rounded-2xl hover:scale-105 transition-all shadow-lg shadow-primary/20"
                >
                  Explore Mentors
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ResponsiveLayout>
  );
}
