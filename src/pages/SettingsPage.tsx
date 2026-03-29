import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { ArrowLeft, Globe, LogOut, ChevronRight, Bell, Shield, Info } from "lucide-react";
import { ResponsiveLayout } from "@/components/mentor-connect/ResponsiveLayout";
import { toast } from "sonner";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const handleLogout = () => {
    logout();
    toast.success(t("loggedOut"));
    navigate("/");
  };

  return (
    <ResponsiveLayout>
      <div className="min-h-screen bg-background pb-20 lg:pb-8 animate-fade-in">
        <div className="bg-card border-b border-border px-4 py-4 sticky top-0 z-10">
          <div className="max-w-3xl mx-auto flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-h3 font-bold text-foreground">{t("student.profile.settings")}</h1>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
          {/* Language Section */}
          <section className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border bg-muted/30">
              <h2 className="text-body font-bold text-foreground flex items-center gap-2">
                <Globe size={18} className="text-primary" />
                {t("student.profile.language")}
              </h2>
            </div>
            <div className="p-2">
              {[
                { id: "en", label: "English" },
                { id: "mr", label: "Marathi (मराठी)" },
              ].map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => {
                    setLanguage(lang.id as any);
                    toast.success(t("languageChanged") || `Language changed to ${lang.label}`);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-4 rounded-xl transition-all ${
                    language === lang.id
                      ? "bg-primary/5 text-primary font-semibold"
                      : "text-foreground hover:bg-muted/50"
                  }`}
                >
                  <span>{lang.label}</span>
                  {language === lang.id && (
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* Other Settings */}
          <section className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border bg-muted/30">
              <h2 className="text-body font-bold text-foreground flex items-center gap-2">
                <Bell size={18} className="text-primary" />
                {t("notifications")}
              </h2>
            </div>
            <div className="p-2">
              <div className="flex items-center justify-between px-4 py-4 rounded-xl text-foreground">
                <div className="flex items-center gap-3">
                  <Bell size={18} className="text-muted-foreground" />
                  <span className="text-body font-medium">{t("notifications.enable")}</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </section>

          {/* Logout Section */}
          <button
            onClick={handleLogout}
            className="btn-destructive w-full"
          >
            <LogOut size={18} />
            {t("logout")}
          </button>
        </div>
      </div>
    </ResponsiveLayout>
  );
}
