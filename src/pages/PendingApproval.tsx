import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Clock3, Search, LogOut, RefreshCw, UserCircle2, Trophy } from "lucide-react";
import { ResponsiveLayout } from "@/components/mentor-connect/ResponsiveLayout";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export default function PendingApproval() {
  const navigate = useNavigate();
  const { user, logout, refreshUser } = useAuth();

  const onboardingRoute = useMemo(() => {
    if (user?.role === "mentor") return "/onboarding/mentor";
    return "/onboarding/student";
  }, [user?.role]);

  const handleRefresh = async () => {
    await refreshUser();
    toast.success("Approval status refreshed");
  };

  return (
    <ResponsiveLayout>
      <div className="min-h-screen bg-background pb-20 lg:pb-8">
        <div className="max-w-3xl mx-auto px-4 py-10">
          <div className="rounded-[32px] border border-border bg-card shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500/10 via-primary/10 to-mentor/10 p-8 border-b border-border">
              <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-5">
                <ShieldCheck size={32} />
              </div>
              <h1 className="text-h2 font-bold text-foreground">Waiting for Admin Approval</h1>
              <p className="text-body text-muted-foreground mt-3 max-w-2xl">
                Your account has been created successfully. An approval request has been sent to the admin.
                Until approval, you can browse the platform, but actions like messaging, meeting requests,
                follows, and ratings stay locked.
              </p>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-3xl border border-border bg-muted/30 p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <Clock3 size={18} className="text-amber-600" />
                    <h2 className="font-bold text-foreground">Current Status</h2>
                  </div>
                  <p className="text-body text-muted-foreground">
                    Your role is <span className="font-bold text-foreground capitalize">{user?.role || "user"}</span> and your
                    account is pending approval.
                  </p>
                </div>

                <div className="rounded-3xl border border-border bg-muted/30 p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <UserCircle2 size={18} className="text-primary" />
                    <h2 className="font-bold text-foreground">What You Can Do</h2>
                  </div>
                  <p className="text-body text-muted-foreground">
                    Complete your profile details now so you are ready as soon as the admin approves you.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => navigate(user?.onboarding_completed ? "/profile/edit" : onboardingRoute)}
                  className="w-full px-6 py-4 rounded-2xl bg-primary text-primary-foreground font-bold hover:scale-[1.01] active:scale-[0.99] transition-all"
                >
                  Complete Profile Setup
                </button>

                {user?.role === "student" && (
                  <button
                    onClick={() => navigate("/student/explore")}
                    className="w-full px-6 py-4 rounded-2xl border border-border bg-card text-foreground font-bold hover:bg-muted/40 transition-all flex items-center justify-center gap-2"
                  >
                    <Search size={18} />
                    Explore Mentors
                  </button>
                )}

                {user?.role === "student" && (
                  <button
                    onClick={() => navigate("/student/leaderboard")}
                    className="w-full px-6 py-4 rounded-2xl border border-border bg-card text-foreground font-bold hover:bg-muted/40 transition-all flex items-center justify-center gap-2"
                  >
                    <Trophy size={18} />
                    View Leaderboard
                  </button>
                )}

                <button
                  onClick={handleRefresh}
                  className="w-full px-6 py-4 rounded-2xl border border-border bg-card text-foreground font-bold hover:bg-muted/40 transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw size={18} />
                  Refresh Approval Status
                </button>

                <button
                  onClick={logout}
                  className="w-full px-6 py-4 rounded-2xl bg-destructive text-destructive-foreground font-bold hover:brightness-105 transition-all flex items-center justify-center gap-2"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ResponsiveLayout>
  );
}
