import { useState, type ComponentType } from "react";
import { useLanguage } from "@/lib/language-context";
import { useResources } from "@/lib/resources-context";
import { useAuth } from "@/lib/auth-context";
import { X, Share2, Link as LinkIcon, FileText, Video as VideoIcon, File as FileIcon, Send, Upload } from "lucide-react";
import { toast } from "sonner";
import { LocalizedString } from "@/lib/types";

interface ShareResourceFormProps {
  onClose: () => void;
  communityId?: string;
  onShared?: () => void;
}

type ResourceType = "pdf" | "link" | "video" | "document";

export function ShareResourceForm({ onClose, communityId, onShared }: ShareResourceFormProps) {
  const { t } = useLanguage();
  const { addResource } = useResources();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [type, setType] = useState<ResourceType>("link");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = t("resource.share.titleRequired") || "Title is required";
    if (!description.trim()) errs.desc = t("resource.share.descRequired") || "Description is required";
    if (!url.trim() && !selectedFile) errs.url = t("resource.share.urlRequired") || "URL or file is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    
    try {
      // Create objects from input
      const localizedTitle = { en: title.trim(), mr: title.trim() };
      const localizedDesc = { en: description.trim(), mr: description.trim() };
      const authorName = user?.name || "Mentor";

      if (selectedFile) {
        const formData = new FormData();
        formData.append("title", JSON.stringify(localizedTitle));
        formData.append("description", JSON.stringify(localizedDesc));
        formData.append("type", type);
        formData.append("url", url.trim());
        if (communityId) formData.append("communityId", communityId);
        formData.append("file", selectedFile);

        await addResource(formData, authorName);
      } else {
        await addResource(
          {
            title: localizedTitle as LocalizedString,
            description: localizedDesc as LocalizedString,
            url: url.trim(),
            type,
            communityId
          },
          authorName
        );
      }
      
      toast.success(t("resource.share.success") || "Resource shared successfully!");
      onShared?.();
      onClose();
    } catch (error) {
       console.error('Error sharing resource:', error);
       toast.error("Failed to share resource");
    } finally {
      setLoading(false);
    }
  };

  const typeOptions: { value: ResourceType; label: string; icon: ComponentType<{ size?: number }> }[] = [
    { value: "link", label: t("resource.share.typeLink") || "Link", icon: LinkIcon },
    { value: "pdf", label: t("resource.share.typePdf") || "PDF", icon: FileText },
    { value: "video", label: t("resource.share.typeVideo") || "Video", icon: VideoIcon },
    { value: "document", label: t("resource.share.typeDocument") || "Doc", icon: FileIcon },
  ];

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-card w-full max-w-lg rounded-3xl border border-border shadow-2xl shadow-primary/10 animate-slide-up overflow-hidden">
        {/* Header */}
        <div className="relative p-6 border-b border-border bg-gradient-to-r from-mentor/5 to-transparent">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-mentor/10 text-mentor flex items-center justify-center shadow-inner">
              <Share2 size={24} />
            </div>
            <div>
              <h2 className="text-h3 text-foreground font-bold leading-tight">
                {t("resource.share.title") || "Share Resource"}
              </h2>
              <p className="text-caption text-muted-foreground mt-0.5">
                {t("resource.share.subtitle") || "Provide valuable materials to your community members."}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute right-6 top-6 p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6" noValidate>
          <div className="grid grid-cols-1 gap-6">
            {/* Title */}
            <div className="space-y-2">
              <label className="text-caption font-bold text-muted-foreground uppercase tracking-wider ml-1">
                {t("resource.share.resourceTitle") || "Resource Title"}
              </label>
              <input
                value={title}
                onChange={(e) => { setTitle(e.target.value); setErrors((p) => ({ ...p, title: "" })); }}
                placeholder={t("resource.share.titlePlaceholder") || "e.g. Master React Hooks in 10 minutes"}
                className={`w-full px-5 py-4 rounded-2xl border ${errors.title ? "border-destructive ring-destructive/10" : "border-border focus:border-mentor ring-mentor/10"} bg-muted/30 text-foreground text-body focus:ring-4 outline-none transition-all`}
                id="resource-title"
              />
              {errors.title && <p className="text-caption text-destructive font-medium ml-1">{errors.title}</p>}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-caption font-bold text-muted-foreground uppercase tracking-wider ml-1">
                {t("resource.share.description") || "Short Description"}
              </label>
              <textarea
                value={description}
                onChange={(e) => { setDescription(e.target.value); setErrors((p) => ({ ...p, desc: "" })); }}
                placeholder={t("resource.share.descPlaceholder") || "Explain what this resource is about..."}
                rows={3}
                className={`w-full px-5 py-4 rounded-2xl border ${errors.desc ? "border-destructive ring-destructive/10" : "border-border focus:border-mentor ring-mentor/10"} bg-muted/30 text-foreground text-body focus:ring-4 outline-none transition-all resize-none`}
                id="resource-description"
              />
              {errors.desc && <p className="text-caption text-destructive font-medium ml-1">{errors.desc}</p>}
            </div>

            {/* Type & URL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-caption font-bold text-muted-foreground uppercase tracking-wider ml-1">
                  {t("resource.share.type") || "Resource Type"}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {typeOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setType(opt.value)}
                      className={`flex items-center gap-2 px-3 py-3 rounded-xl text-[11px] font-bold uppercase tracking-tight border-2 transition-all ${
                        type === opt.value
                          ? "border-mentor bg-mentor/5 text-mentor shadow-sm"
                          : "border-border text-muted-foreground hover:border-muted-foreground"
                      }`}
                    >
                      <opt.icon size={14} />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-caption font-bold text-muted-foreground uppercase tracking-wider ml-1">
                  {t("resource.share.url") || "Link URL"}
                </label>
                <input
                  value={url}
                  onChange={(e) => { setUrl(e.target.value); setErrors((p) => ({ ...p, url: "" })); }}
                  placeholder="https://..."
                  type="url"
                  className={`w-full px-5 py-3 rounded-2xl border ${errors.url ? "border-destructive ring-destructive/10" : "border-border focus:border-mentor ring-mentor/10"} bg-muted/30 text-foreground text-body focus:ring-4 outline-none transition-all h-[54px]`}
                  id="resource-url"
                />
                {errors.url && <p className="text-caption text-destructive font-medium ml-1">{errors.url}</p>}

                <label className="mt-3 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-dashed border-border bg-muted/20 text-caption font-bold text-muted-foreground hover:border-mentor hover:text-mentor transition-all cursor-pointer">
                  <Upload size={16} />
                  {selectedFile ? selectedFile.name : "Upload from gallery, files, laptop, or mobile"}
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.png,.jpg,.jpeg,.gif,.webp,.mp4,.mov,.avi"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setSelectedFile(file);
                      setErrors((p) => ({ ...p, url: "" }));
                    }}
                  />
                </label>
                {selectedFile && (
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="text-caption text-primary font-bold hover:underline"
                  >
                    Remove selected file
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 rounded-2xl border border-border text-body font-bold text-muted-foreground hover:bg-muted transition-all active:scale-95"
            >
              {t("cancel") || "Cancel"}
            </button>
            <button
              type="submit"
              disabled={loading}
              id="resource-submit-btn"
              className="flex-1 py-4 rounded-2xl bg-mentor text-mentor-foreground text-body font-bold flex items-center justify-center gap-2 shadow-lg shadow-mentor/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-40"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-card border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send size={18} />
                  {t("resource.share.submitBtn") || "Share Now"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
