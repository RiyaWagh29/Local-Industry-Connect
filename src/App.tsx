import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { LanguageProvider } from "@/lib/language-context";
import { MessagesProvider } from "@/lib/messages-context";
import { ResourcesProvider } from "@/lib/resources-context";
import { MentorsProvider } from "@/lib/mentors-context";
import { SessionsProvider } from "@/lib/sessions-context";

import SplashScreen from "./pages/SplashScreen";
import AuthPage from "./pages/AuthPage";
import { getHomeRoute } from "./lib/navigation";
import StudentOnboarding from "./pages/StudentOnboarding";
import MentorOnboarding from "./pages/MentorOnboarding";
import StudentHome from "./pages/StudentHome";
import ExploreMentors from "./pages/ExploreMentors";
import CommunityScreen from "./pages/CommunityScreen";
import StudentCommunities from "./pages/StudentCommunities";
import Leaderboard from "./pages/Leaderboard";
import StudentMeetings from "./pages/StudentMeetings";
import MentorMeetings from "./pages/MentorMeetings";
import StudentProfile from "./pages/StudentProfile";
import EditProfile from "./pages/EditProfile";
import SettingsPage from "./pages/SettingsPage";
import PersonalMessages from "./pages/PersonalMessages";
import MentorDashboard from "./pages/MentorDashboard";
import MentorCommunityManagement from "./pages/MentorCommunityManagement";
import MentorMembers from "./pages/MentorMembers";
import MentorProfile from "./pages/MentorProfile";
import PublicMentorProfile from "./pages/PublicMentorProfile";
import AdminDashboard from "./pages/AdminDashboard";
import PendingApproval from "./pages/PendingApproval";
import SessionsPage from "./pages/SessionsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected Route wrapper
const ProtectedRoute = ({ children, roles }: { children: React.ReactNode, roles?: string[] }) => {
  const { isAuthenticated, user, isInitialized, isLoading } = useAuth();
  const location = useLocation();
  
  if (!isInitialized || isLoading) return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  
  console.log("Auth check:", user);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user && roles && !roles.includes(user.role as string)) {
    const homePath = getHomeRoute(user.role as any);
    console.log(`Unauthorized access attempt. Redirecting ${user.role} to ${homePath}`);
    return <Navigate to={homePath} replace />;
  }

  if (user && user.role !== "admin" && user.isActive === false) {
    const pendingApprovalAllowedRoutes = [
      "/pending-approval",
      "/profile/edit",
      "/profile/settings",
      "/onboarding/student",
      "/onboarding/mentor",
      "/student/explore",
      "/student/leaderboard",
    ];

    const isAllowedPendingRoute = pendingApprovalAllowedRoutes.some((route) =>
      location.pathname === route || location.pathname.startsWith(`${route}/`)
    );

    if (!isAllowedPendingRoute) {
      return <Navigate to="/pending-approval" replace />;
    }
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  const { isInitialized } = useAuth();

  if (!isInitialized) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<SplashScreen />} />
      <Route path="/login" element={<AuthPage />} />
      <Route path="/pending-approval" element={<ProtectedRoute><PendingApproval /></ProtectedRoute>} />
      <Route path="/onboarding/student" element={<ProtectedRoute roles={["student"]}><StudentOnboarding /></ProtectedRoute>} />
      <Route path="/onboarding/mentor" element={<ProtectedRoute roles={["mentor"]}><MentorOnboarding /></ProtectedRoute>} />
      
      {/* Student Routes */}
      <Route path="/dashboard" element={<ProtectedRoute roles={["student"]}><StudentHome /></ProtectedRoute>} />
      <Route path="/student/home" element={<Navigate to="/dashboard" replace />} />
      <Route path="/student/explore" element={<ProtectedRoute roles={["student"]}><ExploreMentors /></ProtectedRoute>} />
      <Route path="/student/leaderboard" element={<ProtectedRoute roles={["student"]}><Leaderboard /></ProtectedRoute>} />
      <Route path="/student/communities" element={<ProtectedRoute roles={["student"]}><StudentCommunities /></ProtectedRoute>} />
      <Route path="/student/meetings" element={<ProtectedRoute roles={["student"]}><StudentMeetings /></ProtectedRoute>} />
      <Route path="/student/profile" element={<ProtectedRoute roles={["student"]}><StudentProfile /></ProtectedRoute>} />
      
      {/* Profile Sub-pages */}
      <Route path="/profile/edit" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
      <Route path="/profile/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

      {/* Messaging */}
      <Route path="/messages" element={<ProtectedRoute><PersonalMessages /></ProtectedRoute>} />
      <Route path="/messages/:id" element={<ProtectedRoute><PersonalMessages /></ProtectedRoute>} />
      
      {/* Shared */}
      <Route path="/community/:id" element={<ProtectedRoute><CommunityScreen /></ProtectedRoute>} />
      <Route path="/sessions" element={<ProtectedRoute><SessionsPage /></ProtectedRoute>} />
      
      {/* Mentor Routes */}
      <Route path="/mentor/dashboard" element={<ProtectedRoute roles={["mentor"]}><MentorDashboard /></ProtectedRoute>} />
      <Route path="/mentor/community" element={<ProtectedRoute roles={["mentor"]}><MentorCommunityManagement /></ProtectedRoute>} />
      <Route path="/mentor/meetings" element={<ProtectedRoute roles={["mentor"]}><MentorMeetings /></ProtectedRoute>} />
      <Route path="/mentor/members" element={<ProtectedRoute roles={["mentor"]}><MentorMembers /></ProtectedRoute>} />
      <Route path="/mentor/profile" element={<ProtectedRoute roles={["mentor"]}><MentorProfile /></ProtectedRoute>} />
      <Route path="/mentor/profile/:id" element={<ProtectedRoute><PublicMentorProfile /></ProtectedRoute>} />
      
      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={<ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <AuthProvider>
          <MentorsProvider>
            <MessagesProvider>
              <SessionsProvider>
                <ResourcesProvider>
                  <Toaster />
                  <Sonner position="top-center" />
                  <HashRouter>
                    <AppRoutes />
                  </HashRouter>
                </ResourcesProvider>
              </SessionsProvider>
            </MessagesProvider>
          </MentorsProvider>
        </AuthProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
