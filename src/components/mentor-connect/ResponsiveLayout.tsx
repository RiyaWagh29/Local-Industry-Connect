import { ReactNode } from "react";
import { BottomNav, DesktopSidebar } from "./BottomNav";
import { useAuth } from "@/lib/auth-context";

interface ResponsiveLayoutProps {
  children: ReactNode;
  hideNav?: boolean;
}

export function ResponsiveLayout({ children, hideNav }: ResponsiveLayoutProps) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated || hideNav) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background">
      <DesktopSidebar />
      <div className="lg:ml-64">
        {children}
      </div>
      <BottomNav />
    </div>
  );
}
