import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { ResponsiveLayout } from "@/components/mentor-connect/ResponsiveLayout";
import { Calendar, Clock, CheckCircle, XCircle, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";

export default function MentorMeetings() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMeetings = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/meetings/mentor/${user?.id}`);
      const data = res.data;
      if (data?.success) {
        setMeetings(data.data || []);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to fetch meetings");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) fetchMeetings();
  }, [user?.id]);

  const handleStatusUpdate = async (meetingId: string, status: string) => {
    try {
      const res = await api.put(`/meetings/${meetingId}`, { status });
      const data = res.data;
      if (data?.success) {
        toast.success(`Meeting ${status} successfully!`);
        if (status === "accepted") {
          const meeting = meetings.find((m) => m._id === meetingId);
          const studentId = meeting?.student_id?._id;
          const when = meeting?.date_time ? new Date(meeting.date_time).toLocaleString() : "the scheduled time";
          if (studentId) {
            try {
              await api.post("/messages", {
                recipientId: studentId,
                text: `Hi! Your meeting request has been accepted. Let's connect at ${when}.`
              });
            } catch (e) {
              console.error("Auto message failed", e);
            }
          }
        }
        fetchMeetings();
      } else {
        toast.error(data.message || "Failed to update status");
      }
    } catch (e) {
      toast.error("Update failed");
    }
  };

  return (
    <ResponsiveLayout>
      <div className="min-h-screen bg-background pb-20 lg:pb-8 animate-fade-in">
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
          <div className="flex flex-col space-y-2">
            <h1 className="text-h2 font-bold text-foreground">{t("nav.meetings") || "Mentorship Meetings"}</h1>
            <p className="text-body text-muted-foreground">Manage your meeting requests and schedule from students.</p>
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
                    <div className="w-12 h-12 rounded-2xl bg-mentor/10 flex items-center justify-center text-mentor shrink-0">
                      <Calendar size={24} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-body truncate">{m.student_id?.name || "Student"}</p>
                      <div className="flex items-center gap-2 text-caption text-muted-foreground mt-1 font-medium">
                        <Clock size={14} />
                        <span>{new Date(m.date_time).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {m.status === "pending" ? (
                      <>
                        <button 
                          onClick={() => handleStatusUpdate(m._id, "accepted")}
                          className="flex-1 md:flex-none px-4 py-2 bg-emerald-500 text-white rounded-xl text-caption font-bold flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-emerald-500/20"
                        >
                          <CheckCircle size={16} /> Accept
                        </button>
                        <button 
                          onClick={() => handleStatusUpdate(m._id, "rejected")}
                          className="flex-1 md:flex-none px-4 py-2 bg-muted text-destructive rounded-xl text-caption font-bold flex items-center gap-2 hover:bg-destructive/10 transition-all border border-destructive/10"
                        >
                          <XCircle size={16} /> Decline
                        </button>
                      </>
                    ) : (
                      <div className="flex items-center gap-4">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest ${
                          m.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-600' : 
                          m.status === 'completed' ? 'bg-primary/10 text-primary' :
                          'bg-destructive/10 text-destructive'
                        }`}>
                          {m.status}
                        </span>
                        {m.status === 'accepted' && (
                           <div className="text-v-small font-bold text-muted-foreground italic max-w-[150px] leading-tight">
                              Please share the link via chat!
                           </div>
                        )}
                        {m.status === 'accepted' && (
                          <button 
                            onClick={() => handleStatusUpdate(m._id, "completed")}
                            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-caption font-bold hover:scale-105 transition-all shadow-lg shadow-primary/20"
                          >
                            Meeting Done
                          </button>
                        )}
                        <button 
                          onClick={() => navigate(`/messages/${m.student_id?._id}`)}
                          className="p-2.5 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
                        >
                          <MessageSquare size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center bg-card border border-border rounded-[40px] border-dashed space-y-4">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto opacity-20 shadow-inner">
                <Calendar size={40} />
              </div>
              <div>
                <h3 className="text-body font-bold text-foreground">No meetings found</h3>
                <p className="text-caption text-muted-foreground max-w-xs mx-auto">
                  When students request mentorship sessions with you, they will appear here.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </ResponsiveLayout>
  );
}
