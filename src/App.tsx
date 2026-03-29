import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { LanguageProvider } from "@/lib/language-context";
import { MessagesProvider } from "@/lib/messages-context";
import { ResourcesProvider } from "@/lib/resources-context";

import SplashScreen from "./pages/SplashScreen";
import AuthPage from "./pages/AuthPage";
import StudentOnboarding from "./pages/StudentOnboarding";
import MentorOnboarding from "./pages/MentorOnboarding";
import StudentHome from "./pages/StudentHome";
import ExploreMentors from "./pages/ExploreMentors";
import CommunityScreen from "./pages/CommunityScreen";
import OpportunitiesFeed from "./pages/OpportunitiesFeed";
import StudentCommunities from "./pages/StudentCommunities";
import StudentProfile from "./pages/StudentProfile";
import EditProfile from "./pages/EditProfile";
import SavedOpportunities from "./pages/SavedOpportunities";
import SettingsPage from "./pages/SettingsPage";
import PersonalMessages from "./pages/PersonalMessages";
import MentorDashboard from "./pages/MentorDashboard";
import MentorCommunityManagement from "./pages/MentorCommunityManagement";
import PostOpportunity from "./pages/PostOpportunity";
import MentorMembers from "./pages/MentorMembers";
import MentorProfile from "./pages/MentorProfile";
import PublicMentorProfile from "./pages/PublicMentorProfile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected Route wrapper
const ProtectedRoute = ({ children, roles }: { children: React.ReactNode, roles?: string[] }) => {
  const { isAuthenticated, user, isInitialized } = useAuth();
  
  if (!isInitialized) return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && user && !roles.includes(user.role as string)) return <Navigate to="/" replace />;
  
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
      <Route path="/onboarding/student" element={<ProtectedRoute roles={["student"]}><StudentOnboarding /></ProtectedRoute>} />
      <Route path="/onboarding/mentor" element={<ProtectedRoute roles={["mentor"]}><MentorOnboarding /></ProtectedRoute>} />
      
      {/* Student Routes */}
      <Route path="/student/home" element={<ProtectedRoute roles={["student"]}><StudentHome /></ProtectedRoute>} />
      <Route path="/student/explore" element={<ProtectedRoute roles={["student"]}><ExploreMentors /></ProtectedRoute>} />
      <Route path="/student/communities" element={<ProtectedRoute roles={["student"]}><StudentCommunities /></ProtectedRoute>} />
      <Route path="/student/opportunities" element={<ProtectedRoute roles={["student"]}><OpportunitiesFeed /></ProtectedRoute>} />
      <Route path="/student/profile" element={<ProtectedRoute roles={["student"]}><StudentProfile /></ProtectedRoute>} />
      
      {/* Profile Sub-pages */}
      <Route path="/profile/edit" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
      <Route path="/profile/saved" element={<ProtectedRoute><SavedOpportunities /></ProtectedRoute>} />
      <Route path="/profile/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

      {/* Messaging */}
      <Route path="/messages" element={<ProtectedRoute><PersonalMessages /></ProtectedRoute>} />
      <Route path="/messages/:id" element={<ProtectedRoute><PersonalMessages /></ProtectedRoute>} />
      
      {/* Shared */}
      <Route path="/community/:id" element={<ProtectedRoute><CommunityScreen /></ProtectedRoute>} />
      
      {/* Mentor Routes */}
      <Route path="/mentor/dashboard" element={<ProtectedRoute roles={["mentor"]}><MentorDashboard /></ProtectedRoute>} />
      <Route path="/mentor/community" element={<ProtectedRoute roles={["mentor"]}><MentorCommunityManagement /></ProtectedRoute>} />
      <Route path="/mentor/post" element={<ProtectedRoute roles={["mentor"]}><PostOpportunity /></ProtectedRoute>} />
      <Route path="/mentor/members" element={<ProtectedRoute roles={["mentor"]}><MentorMembers /></ProtectedRoute>} />
      <Route path="/mentor/profile" element={<ProtectedRoute roles={["mentor"]}><MentorProfile /></ProtectedRoute>} />
      <Route path="/mentor/profile/:id" element={<ProtectedRoute><PublicMentorProfile /></ProtectedRoute>} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <AuthProvider>
          <MessagesProvider>
            <ResourcesProvider>
              <Toaster />
              <Sonner position="top-center" />
              <BrowserRouter>
                <AppRoutes />
              </BrowserRouter>
            </ResourcesProvider>
          </MessagesProvider>
        </AuthProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
