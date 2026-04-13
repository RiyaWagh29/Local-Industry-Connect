import { Home, Search, Users, Briefcase, User, LayoutDashboard, MessageSquare, PlusCircle, MessagesSquare, LogOut } from "lucide-react";
import { useNavigate, useLocation, NavLink } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { Logo } from "@/components/mentor-connect/Logo";
import { Calendar } from "lucide-react";
import { LanguageToggle } from "@/components/mentor-connect/LanguageToggle";

export function BottomNav() {
  const location = useLocation();
  const { user, role: contextRole } = useAuth();
  const role = user?.role || contextRole || "student";
  const { t } = useLanguage();

  const studentTabs = [
    { path: "/dashboard", icon: Home, label: t("nav.home") },
    { path: "/student/explore", icon: Search, label: t("nav.explore") },
    { path: "/student/communities", icon: Users, label: t("nav.communities") },
    { path: "/student/leaderboard", icon: Briefcase, label: t("nav.leaderboard") }, // Swapping briefcase from jobs to leaderboard
    { path: "/messages", icon: MessagesSquare, label: t("nav.messages") },
  ];

  const mentorTabs = [
    { path: "/mentor/dashboard", icon: LayoutDashboard, label: t("nav.dashboard") },
    { path: "/mentor/community", icon: MessageSquare, label: t("nav.community") },
    { path: "/mentor/meetings", icon: Calendar, label: t("nav.meetings") },
    { path: "/messages", icon: MessagesSquare, label: t("nav.messages") },
    { path: "/mentor/profile", icon: User, label: t("nav.profile") },
  ];

  const adminTabs = [
    { path: "/admin/dashboard", icon: LayoutDashboard, label: "Admin" },
    { path: "/messages", icon: MessagesSquare, label: t("nav.messages") },
  ];

  let tabs = studentTabs;
  if (role === "mentor") tabs = mentorTabs;
  if (role === "admin") tabs = adminTabs;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 lg:hidden">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path || (tab.path !== "/" && location.pathname.startsWith(tab.path));
          const Icon = tab.icon;
          const activeColor = role === "mentor" ? "text-mentor" : "text-primary";
          
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={`flex flex-col items-center gap-1 px-3 py-1 transition-colors ${isActive ? activeColor : "text-muted-foreground"}`}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

export function DesktopSidebar() {
  const location = useLocation();
  const { user, role: contextRole, logout } = useAuth();
  const role = user?.role || contextRole || "student";
  const { t } = useLanguage();

  const studentTabs = [
    { path: "/dashboard", icon: Home, label: t("nav.home") },
    { path: "/student/explore", icon: Search, label: t("nav.explore") },
    { path: "/student/communities", icon: Users, label: t("nav.communities") },
    { path: "/student/leaderboard", icon: Briefcase, label: t("nav.leaderboard") },
    { path: "/messages", icon: MessagesSquare, label: t("nav.messages") },
    { path: "/student/profile", icon: User, label: t("nav.profile") },
  ];

  const mentorTabs = [
    { path: "/mentor/dashboard", icon: LayoutDashboard, label: t("nav.dashboard") },
    { path: "/mentor/community", icon: MessageSquare, label: t("nav.community") },
    { path: "/mentor/meetings", icon: Calendar, label: t("nav.meetings") },
    { path: "/mentor/members", icon: Users, label: t("nav.members") },
    { path: "/messages", icon: MessagesSquare, label: t("nav.messages") },
    { path: "/mentor/profile", icon: User, label: t("nav.profile") },
  ];

  const adminTabs = [
    { path: "/admin/dashboard", icon: LayoutDashboard, label: "Admin Dashboard" },
    { path: "/messages", icon: MessagesSquare, label: t("nav.messages") },
  ];

  let tabs = studentTabs;
  if (role === "mentor") tabs = mentorTabs;
  if (role === "admin") tabs = adminTabs;

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
          const isActive = location.pathname === tab.path || (tab.path !== "/" && location.pathname.startsWith(tab.path));
          const Icon = tab.icon;
          const activeClass = role === "mentor"
            ? "bg-mentor/5 text-mentor border-r-4 border-mentor"
            : "bg-primary/5 text-primary border-r-4 border-primary";
            
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={`w-full flex items-center gap-3 px-6 py-3 text-body font-bold transition-all ${isActive ? activeClass : "text-muted-foreground hover:bg-muted/50 hover:text-foreground hover:translate-x-1"}`}
            >
              <Icon size={20} />
              <span>{tab.label}</span>
            </NavLink>
          );
        })}
      </nav>
      <div className="p-4 border-t border-border space-y-4">
        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-6 py-2 rounded-xl text-body font-bold text-destructive hover:bg-destructive/10 transition-all group"
        >
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span>{t("logout")}</span>
        </button>
        <p className="text-caption text-muted-foreground text-center">{t("made.in.nashik")}</p>
      </div>
    </aside>
  );
}
