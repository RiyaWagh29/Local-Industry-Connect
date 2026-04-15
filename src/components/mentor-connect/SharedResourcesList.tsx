import { FileText, Link, Video, File, Download, User, Calendar, QrCode, X } from "lucide-react";
import { useResources } from "@/lib/resources-context";
import { SharedResource } from "@/lib/types";
import { useLanguage } from "@/lib/language-context";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import api from "@/lib/api";

const iconMap = {
  pdf: FileText,
  link: Link,
  video: Video,
  document: File,
};

const colorMap = {
  pdf: "text-red-500 bg-red-500/10",
  link: "text-blue-500 bg-blue-500/10",
  video: "text-purple-500 bg-purple-500/10",
  document: "text-amber-500 bg-amber-500/10",
};

interface SharedResourcesListProps {
  communityId?: string;
  refreshToken?: number;
}

export function SharedResourcesList({ communityId, refreshToken }: SharedResourcesListProps) {
  const { resources } = useResources();
  const { t, getLocalized } = useLanguage();
  const [localResources, setLocalResources] = useState<SharedResource[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResourceAccessUnlocked, setIsResourceAccessUnlocked] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [pendingResource, setPendingResource] = useState<SharedResource | null>(null);

  useEffect(() => {
    const fetchCommunityResources = async () => {
      if (!communityId) return;
      setIsLoading(true);
      try {
        const res = await api.get("/resources", { params: { communityId } });
        const payload = res.data?.data || [];
        const ensureLoc = (val: any) => {
          if (typeof val === "string") return { en: val, mr: val };
          if (val && typeof val === "object" && val.en) return val;
          return { en: "", mr: "" };
        };
        if (Array.isArray(payload)) {
          const mapped: SharedResource[] = payload.map((r: any) => ({
            id: r._id || r.id,
            title: ensureLoc(r.title),
            description: ensureLoc(r.description || ""),
            type: r.type || "link",
            url: r.url || "#",
            sharedBy: ensureLoc(r.sharedBy?.name || "Mentor"),
            sharedDate: ensureLoc(new Date(r.createdAt || Date.now()).toLocaleDateString()),
          }));
          setLocalResources(mapped);
        } else {
          setLocalResources([]);
        }
      } catch (e) {
        console.error("Fetch community resources failed", e);
        setLocalResources([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCommunityResources();
  }, [communityId, refreshToken]);

  const list = communityId ? localResources : resources;

  const getResourceUrl = (url: string) => {
    if (!url || url === "#") return "";
    if (/^https?:\/\//i.test(url)) return url;

    const baseURL = String(api.defaults.baseURL || "");
    if (/^https?:\/\//i.test(baseURL)) {
      return new URL(url, `${baseURL.replace(/\/api\/?$/, "")}/`).toString();
    }

    return url;
  };

  const openResource = (resource: SharedResource) => {
    const title = getLocalized(resource.title);
    toast.success(`${title} ${t("resource.share.download") || "opening"}...`);
    const resolvedUrl = getResourceUrl(resource.url);
    if (resolvedUrl) {
      window.open(resolvedUrl, "_blank", "noopener,noreferrer");
    }
  };

  const downloadResource = async (resource: SharedResource) => {
    const resolvedUrl = getResourceUrl(resource.url);
    if (!resolvedUrl) {
      toast.error("Resource link is unavailable");
      return;
    }

    try {
      const response = await fetch(resolvedUrl, { mode: "cors" });
      if (!response.ok) {
        throw new Error(`Download failed with status ${response.status}`);
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      const safeTitle = getLocalized(resource.title).trim() || "resource";
      const extension = resource.type === "pdf" ? "pdf" : resource.type === "document" ? "doc" : "";

      anchor.href = blobUrl;
      anchor.download = extension ? `${safeTitle}.${extension}` : safeTitle;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      window.URL.revokeObjectURL(blobUrl);
      toast.success(`${safeTitle} ${t("resource.share.download") || "downloaded"}...`);
    } catch (error) {
      console.error("Download resource failed", error);
      toast.error("Failed to download resource");
      openResource(resource);
    }
  };

  const handleDownload = (resource: SharedResource) => {
    if (!isResourceAccessUnlocked) {
      setPendingResource(resource);
      setShowQR(true);
      return;
    }

    if (resource.type === "pdf" || resource.type === "document") {
      void downloadResource(resource);
      return;
    }

    openResource(resource);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 py-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-muted rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (list.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-3 opacity-60">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <File size={32} className="text-muted-foreground" />
        </div>
        <p className="text-body font-medium">{t("resource.share.noResources") || "No resources shared yet"}</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {list.map((r) => {
          const Icon = iconMap[r.type];
          const color = colorMap[r.type];
          const title = getLocalized(r.title);
          const description = getLocalized(r.description);
          const sharedBy = getLocalized(r.sharedBy);
          const sharedDate = getLocalized(r.sharedDate);

          return (
            <div key={r.id} className="group bg-card rounded-2xl border border-border p-5 hover:shadow-lg hover:border-primary/30 transition-all duration-300 animate-fade-in relative overflow-hidden">
              <div className="flex gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform ${color}`}>
                  <Icon size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="text-body font-bold text-foreground truncate group-hover:text-primary transition-colors pr-2">
                      {title}
                    </h4>
                    <button
                      onClick={() => handleDownload(r)}
                      className="p-2 rounded-lg bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all shadow-sm flex-shrink-0"
                      title={t("resource.share.download")}
                    >
                      <Download size={16} />
                    </button>
                  </div>
                  
                  <p className="text-caption text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                    {description}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-4 pt-3 border-t border-border/50 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                    <span className="flex items-center gap-1.5">
                      <User size={12} className="text-primary/60" />
                      {sharedBy}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar size={12} className="text-primary/60" />
                      {sharedDate}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-card w-full max-w-sm rounded-[2rem] border border-border shadow-2xl p-8 relative animate-slide-up">
            <button
              onClick={() => {
                setShowQR(false);
                setPendingResource(null);
              }}
              className="absolute top-4 right-4 w-8 h-8 bg-muted rounded-full flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <X size={16} />
            </button>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                <QrCode size={32} />
              </div>
              <div>
                <h3 className="text-h3 font-extrabold text-foreground tracking-tight">Unlock Resource Access</h3>
                <p className="text-caption text-muted-foreground mt-2">
                  Viewing shared resources is a premium feature. Scan the dummy QR below to unlock access.
                </p>
              </div>

              <div className="bg-white p-4 rounded-2xl mx-auto w-48 h-48 border-[6px] border-primary/20 shadow-inner flex items-center justify-center relative overflow-hidden">
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=PremiumResourceAccessForLocalIndustryConnect&color=121110"
                  alt="Resource access QR"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="pt-4 pb-2">
                <button
                  onClick={() => {
                    setIsResourceAccessUnlocked(true);
                    setShowQR(false);
                    if (pendingResource) {
                      openResource(pendingResource);
                      setPendingResource(null);
                    }
                    toast.success("Payment confirmed! You can now view shared resources.");
                  }}
                  className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Simulate Payment Complete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
