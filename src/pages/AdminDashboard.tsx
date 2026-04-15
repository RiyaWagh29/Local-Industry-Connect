import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { ResponsiveLayout } from "@/components/mentor-connect/ResponsiveLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Calendar, ShieldCheck, RefreshCw, Ban, UserCheck, History, XCircle, ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

export default function AdminDashboard() {
  type AdminUser = {
    _id: string;
    name: string;
    email: string;
    role: string;
    isActive?: boolean;
  };

  type AdminSession = {
    _id: string;
    student?: { name?: string };
    mentor?: { name?: string };
    start: string;
    status: string;
  };

  type AuditLogEntry = {
    _id: string;
    action: string;
    createdAt: string;
    details: string;
    actorId?: { name?: string };
  };

  const [userState, setUserState] = useState<{ data: AdminUser[]; page: number; totalPages: number }>({ data: [], page: 1, totalPages: 1 });
  const [sessionState, setSessionState] = useState<{ data: AdminSession[]; page: number; totalPages: number }>({ data: [], page: 1, totalPages: 1 });
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const fetchUsers = async (page = 1) => {
    try {
      const res = await api.get(`/admin/users?page=${page}&limit=5`);
      const data = res.data;
      if (data.success) {
        setUserState({ data: data.data, page: data.page, totalPages: data.totalPages });
      } else {
        toast.error(data.message || "Error fetching users");
      }
    } catch (e) { toast.error("Error fetching users"); }
  };

  const fetchSessions = async (page = 1) => {
    try {
      const res = await api.get(`/admin/sessions?page=${page}&limit=5`);
      const data = res.data;
      if (data.success) {
        setSessionState({ data: data.data, page: data.page, totalPages: data.totalPages });
      } else {
        toast.error(data.message || "Error fetching sessions");
      }
    } catch (e) { toast.error("Error fetching sessions"); }
  };

  const fetchLogs = async () => {
    try {
      const res = await api.get(`/admin/logs`);
      const data = res.data;
      if (data.success) setLogs(data.data);
      else toast.error(data.message || "Error fetching audit logs");
    } catch (e) { console.error("Logs error:", e); }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchUsers(), fetchSessions(), fetchLogs()]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const promoteUser = async (userId: string) => {
    const res = await api.put(`/admin/promote/${userId}`);
    const data = res.data;
    if (data.success) {
      toast.success("User promoted to Admin");
      fetchData();
    } else toast.error(data.message);
  };

  const toggleUserStatus = async (userId: string) => {
    const res = await api.put(`/admin/users/${userId}/status`);
    const data = res.data;
    if (data.success) {
      toast.success(data.message);
      fetchUsers(userState.page);
      fetchLogs();
    } else toast.error(data.message);
  };

  const cancelSession = async (sessionId: string) => {
    const res = await api.put(`/admin/sessions/${sessionId}/cancel`);
    const data = res.data;
    if (data.success) {
      toast.success("Session cancelled");
      fetchSessions(sessionState.page);
      fetchLogs();
    } else toast.error(data.message);
  };

  return (
    <ResponsiveLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-10 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-h1 text-foreground flex items-center gap-3">
            Admin Panel <ShieldCheck className="text-primary" size={32} />
          </h1>
          <div className="flex items-center gap-3">
            <Button onClick={fetchData} variant="outline" size="sm" disabled={loading} className="gap-2">
              <RefreshCw className={loading ? "animate-spin" : ""} size={16} /> Refresh
            </Button>
            <Button onClick={handleLogout} variant="destructive" size="sm" className="gap-2">
              <LogOut size={16} /> Logout
            </Button>
          </div>
        </div>

        {/* User Management Section */}
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-h3">User Management</CardTitle>
              <CardDescription>Track roles, activity, and suspension status.</CardDescription>
            </div>
            <Users size={24} className="text-muted-foreground opacity-50" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userState.data.map((u) => (
                  <TableRow key={u._id} className={!u.isActive ? "bg-destructive/5" : ""}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground">{u.name}</span>
                        <span className="text-xs text-muted-foreground">{u.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={u.role === 'admin' ? "default" : "secondary"}>
                        {u.role.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {u.isActive ? (
                        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Active</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-amber-700 border-amber-200 bg-amber-50">Pending Approval</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {u.role !== 'admin' && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => promoteUser(u._id)} title="Promote to Admin">
                              <ShieldCheck size={14} />
                            </Button>
                            <Button
                              size="sm"
                              variant={u.isActive ? "destructive" : "secondary"}
                              onClick={() => toggleUserStatus(u._id)}
                              title={u.isActive ? "Revoke access" : "Approve user"}
                            >
                              {u.isActive ? <Ban size={14} /> : <UserCheck size={14} />}
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between pt-4">
              <span className="text-xs text-muted-foreground italic">Page {userState.page} of {userState.totalPages}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={userState.page === 1} onClick={() => fetchUsers(userState.page - 1)}>
                  <ChevronLeft size={16} />
                </Button>
                <Button variant="outline" size="sm" disabled={userState.page === userState.totalPages} onClick={() => fetchUsers(userState.page + 1)}>
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sessions & Moderation */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Global Sessions</CardTitle>
              <Calendar size={20} className="text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mentorship Participant</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Mod</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessionState.data.map((s) => (
                    <TableRow key={s._id}>
                      <TableCell className="text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{s.student?.name}</span>
                          <ChevronRight size={12} className="text-muted-foreground" />
                          <span className="font-medium">{s.mentor?.name}</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-1">
                          {new Date(s.start).toLocaleDateString()} at {new Date(s.start).toLocaleTimeString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize text-[10px]">{s.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {s.status !== 'cancelled' && s.status !== 'completed' && (
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => cancelSession(s._id)}>
                            <XCircle size={16} />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex items-center justify-between pt-2">
                <div className="flex gap-2 ml-auto">
                    <Button variant="ghost" size="sm" disabled={sessionState.page === 1} onClick={() => fetchSessions(sessionState.page - 1)}>
                        <ChevronLeft size={14} />
                    </Button>
                    <Button variant="ghost" size="sm" disabled={sessionState.page === sessionState.totalPages} onClick={() => fetchSessions(sessionState.page + 1)}>
                        <ChevronRight size={14} />
                    </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Audit Viewer */}
          <Card className="lg:col-span-1 border-primary/20 bg-primary/5">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-primary flex items-center gap-2">
                <History size={18} /> Audit Log
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0">
               <div className="max-h-[400px] overflow-y-auto px-6 space-y-4 scrollbar-hide">
                  {logs.map((log) => (
                    <div key={log._id} className="border-l-2 border-primary/30 pl-3 py-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary/70">{log.action}</span>
                        <span className="text-[9px] text-muted-foreground">{new Date(log.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-xs text-foreground/80 leading-tight italic">"{log.details}"</p>
                      <p className="text-[9px] text-muted-foreground">— by {log.actorId?.name}</p>
                    </div>
                  ))}
                  {logs.length === 0 && <p className="text-center text-xs text-muted-foreground py-10 italic">No recent admin actions recorded.</p>}
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ResponsiveLayout>
  );
}
