import { Home, Search, Users, Briefcase, User, LayoutDashboard, MessageSquare, PlusCircle, MessagesSquare, LogOut } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { Logo } from "@/components/mentor-connect/Logo";
import { LanguageToggle } from "@/components/mentor-connect/LanguageToggle";

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role: contextRole } = useAuth();
  const role = user?.role || contextRole;
  const { t } = useLanguage();

  const studentTabs = [
    { path: "/student/home", icon: Home, label: t("nav.home") },
    { path: "/student/explore", icon: Search, label: t("nav.explore") },
    { path: "/student/communities", icon: Users, label: t("nav.communities") },
    { path: "/messages", icon: MessagesSquare, label: t("nav.messages") },
    { path: "/student/profile", icon: User, label: t("nav.profile") },
  ];

  const mentorTabs = [
    { path: "/mentor/dashboard", icon: LayoutDashboard, label: t("nav.dashboard") },
    { path: "/mentor/community", icon: MessageSquare, label: t("nav.community") },
    { path: "/mentor/post", icon: PlusCircle, label: t("nav.post") },
    { path: "/messages", icon: MessagesSquare, label: t("nav.messages") },
    { path: "/mentor/profile", icon: User, label: t("nav.profile") },
  ];

  const tabs = role === "mentor" ? mentorTabs : studentTabs;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 lg:hidden">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = location.pathname.startsWith(tab.path);
          const Icon = tab.icon;
          const activeColor = role === "mentor" ? "text-mentor" : "text-primary";
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center gap-1 px-3 py-1 transition-colors ${isActive ? activeColor : "text-muted-foreground"}`}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export function DesktopSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role: contextRole, logout } = useAuth();
  const role = user?.role || contextRole;
  const { t } = useLanguage();

  const studentTabs = [
    { path: "/student/home", icon: Home, label: t("nav.home") },
    { path: "/student/explore", icon: Search, label: t("nav.explore") },
    { path: "/student/communities", icon: Users, label: t("nav.communities") },
    { path: "/student/opportunities", icon: Briefcase, label: t("nav.jobs") },
    { path: "/messages", icon: MessagesSquare, label: t("nav.messages") },
    { path: "/student/profile", icon: User, label: t("nav.profile") },
  ];

  const mentorTabs = [
    { path: "/mentor/dashboard", icon: LayoutDashboard, label: t("nav.dashboard") },
    { path: "/mentor/community", icon: MessageSquare, label: t("nav.community") },
    { path: "/mentor/post", icon: PlusCircle, label: t("nav.post") },
    { path: "/mentor/members", icon: Users, label: t("nav.members") },
    { path: "/messages", icon: MessagesSquare, label: t("nav.messages") },
    { path: "/mentor/profile", icon: User, label: t("nav.profile") },
  ];

  const tabs = role === "mentor" ? mentorTabs : studentTabs;

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border flex-col z-50">
      <div className="p-6 border-b border-border">
        <Logo size="md" variant={role === "mentor" ? "mentor" : "student"} />
        <p className="text-caption text-muted-foreground mt-1.5 ml-[52px]">🏔️ {t("nav.nashik")}</p>
      </div>
      <div className="px-3 py-3 border-b border-border">
        <LanguageToggle />
      </div>
      <nav className="flex-1 py-4">
        {tabs.map((tab) => {
          const isActive = location.pathname.startsWith(tab.path);
          const Icon = tab.icon;
          const activeClass = role === "mentor"
            ? "bg-mentor/10 text-mentor border-r-2 border-mentor"
            : "bg-primary/10 text-primary border-r-2 border-primary";
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`w-full flex items-center gap-3 px-6 py-3 text-body font-medium transition-colors ${isActive ? activeClass : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"}`}
            >
              <Icon size={20} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="p-4 border-t border-border space-y-4">
        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-6 py-2 rounded-xl text-body font-medium text-destructive hover:bg-destructive/10 transition-all"
        >
          <LogOut size={20} />
          <span>{t("logout")}</span>
        </button>
        <p className="text-caption text-muted-foreground text-center">{t("made.in.nashik")}</p>
      </div>
    </aside>
  );
}
