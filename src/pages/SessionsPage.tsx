import { useSessions } from "@/lib/sessions-context";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { ResponsiveLayout } from "@/components/mentor-connect/ResponsiveLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Video, XCircle, CheckCircle, ExternalLink, User, History } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function SessionsPage() {
  const { sessions, isLoading, updateStatus, fetchSessions } = useSessions();
  const { user } = useAuth();
  const { t } = useLanguage();

  const handleAction = async (id: string, status: string) => {
    await updateStatus(id, status);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-500/10 text-green-600 border-green-500/20";
      case "pending": return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      case "cancelled": return "bg-red-500/10 text-red-600 border-red-500/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <ResponsiveLayout>
      <div className="min-h-screen bg-background pb-20 lg:pb-8 animate-fade-in">
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-h1 text-foreground">My Sessions</h1>
              <p className="text-body text-muted-foreground">Manage your mentorship appointments and joined meetings.</p>
            </div>
            <Button onClick={fetchSessions} variant="outline" size="sm" className="gap-2">
               <History size={16} /> Refresh
            </Button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {[...Array(4)].map((_, i) => <div key={i} className="h-48 rounded-3xl bg-muted animate-pulse" />)}
            </div>
          ) : sessions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sessions.map((session) => (
                <Card key={session._id} className="overflow-hidden border-border/50 shadow-lg hover:shadow-xl transition-all rounded-3xl group">
                  <div className={`h-2 w-full ${session.status === 'confirmed' ? 'bg-green-500' : 'bg-primary'}`} />
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <Badge variant="outline" className={`font-bold uppercase tracking-widest text-[10px] ${getStatusColor(session.status)}`}>
                        {session.status}
                      </Badge>
                      <div className="text-v-small text-muted-foreground font-medium">
                        {format(new Date(session.createdAt), 'MMM d, yyyy')}
                      </div>
                    </div>
                    <CardTitle className="text-h3 mt-2 flex items-center gap-2">
                      <User size={18} className="text-primary" />
                      {user?.role === 'mentor' ? session.student.name : session.mentor.name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 font-medium">
                       <Clock size={14} /> 
                       {format(new Date(session.start), 'h:mm a')} - {format(new Date(session.end), 'h:mm a')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-2xl border border-border/50">
                      <Calendar size={18} className="text-primary" />
                      <span className="text-body font-bold">{format(new Date(session.start), 'EEEE, MMMM do')}</span>
                    </div>

                    <div className="flex gap-2">
                      {session.status === 'pending' && user?.role === 'mentor' && (
                        <>
                          <Button onClick={() => handleAction(session._id, 'confirmed')} className="flex-1 bg-green-600 hover:bg-green-700 gap-2 rounded-2xl">
                            <CheckCircle size={18} /> Confirm
                          </Button>
                          <Button onClick={() => handleAction(session._id, 'cancelled')} variant="destructive" className="flex-1 gap-2 rounded-2xl">
                            <XCircle size={18} /> Decline
                          </Button>
                        </>
                      )}
                      
                      {session.status === 'confirmed' && session.meetingLink && (
                        <Button asChild className="w-full gap-2 rounded-2xl shadow-lg shadow-primary/20">
                          <a href={session.meetingLink} target="_blank" rel="noreferrer">
                            <Video size={18} /> Join Zoom Meeting <ExternalLink size={14} />
                          </a>
                        </Button>
                      )}

                      {session.status === 'pending' && user?.role === 'student' && (
                        <Button onClick={() => handleAction(session._id, 'cancelled')} variant="outline" className="w-full gap-2 rounded-2xl text-destructive hover:bg-destructive/10 border-destructive/20">
                          <XCircle size={18} /> Cancel Request
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center space-y-4 bg-muted/20 rounded-3xl border-2 border-dashed border-border">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto opacity-50">
                <Calendar size={40} />
              </div>
              <div>
                <h3 className="text-body font-bold text-foreground">No sessions scheduled</h3>
                <p className="text-caption text-muted-foreground">Book a mentor to start your career guidance journey.</p>
              </div>
              <Button onClick={() => window.history.back()} variant="outline" className="rounded-2xl">Go Back</Button>
            </div>
          )}
        </div>
      </div>
    </ResponsiveLayout>
  );
}
