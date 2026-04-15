import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { ArrowLeft, User, Mail, Target, Save, Camera } from "lucide-react";
import { ResponsiveLayout } from "@/components/mentor-connect/ResponsiveLayout";
import { toast } from "sonner";
import { getAvatarUrl } from "@/lib/avatar";

export default function EditProfile() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { t } = useLanguage();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [goals, setGoals] = useState(user?.goals || "");
  const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error(t("auth.nameRequired"));
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("goals", goals);
      if (selectedAvatar) {
        formData.append("avatar", selectedAvatar);
      }

      await updateUser(formData);
      toast.success(t("student.profile.editSuccess"));
      navigate(-1);
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
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
            <h1 className="text-h3 font-bold text-foreground">{t("student.profile.editProfile")}</h1>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-card rounded-2xl border border-border shadow-card p-6 space-y-5">
              <div className="flex items-center gap-4">
                <img
                  src={avatarPreview || getAvatarUrl(name || user?.name, user?.avatar)}
                  alt={name || user?.name || "Profile"}
                  className="w-20 h-20 rounded-2xl object-cover border border-border"
                />
                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-background text-foreground cursor-pointer hover:bg-muted transition-colors">
                  <Camera size={16} />
                  <span>{t("student.profile.editPhoto") || "Change Photo"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setSelectedAvatar(file);
                      setAvatarPreview(file ? URL.createObjectURL(file) : null);
                    }}
                  />
                </label>
              </div>

              <div className="space-y-2">
                <label className="text-caption font-semibold text-muted-foreground flex items-center gap-2">
                  <User size={14} /> {t("fullName")}
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-body focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder={t("fullName")}
                />
              </div>

              <div className="space-y-2">
                <label className="text-caption font-semibold text-muted-foreground flex items-center gap-2">
                  <Mail size={14} /> {t("email")}
                </label>
                <input
                  type="email"
                  value={email}
                  readOnly
                  className="w-full px-4 py-3 rounded-xl border border-input bg-muted/30 text-muted-foreground text-body outline-none cursor-not-allowed"
                  placeholder={t("email")}
                />
                <p className="text-v-small text-muted-foreground">{t("auth.emailHint")}</p>
              </div>

              <div className="space-y-2">
                <label className="text-caption font-semibold text-muted-foreground flex items-center gap-2">
                  <Target size={14} /> {t("student.profile.goals")}
                </label>
                <textarea
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-body focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                  placeholder={t("student.onboard.goalsPlaceholder")}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              <Save size={18} />
              {loading ? t("auth.saving") : t("submit")}
            </button>
          </form>
        </div>
      </div>
    </ResponsiveLayout>
  );
}
