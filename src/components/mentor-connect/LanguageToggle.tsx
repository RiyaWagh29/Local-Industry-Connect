import { useLanguage } from "@/lib/language-context";

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center rounded-full border border-border bg-muted overflow-hidden text-[11px] font-semibold select-none">
      <button
        onClick={() => setLanguage("en")}
        className={`px-3 py-1 transition-colors rounded-full ${
          language === "en"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
        aria-label="Switch to English"
        id="lang-toggle-en"
      >
        EN
      </button>
      <button
        onClick={() => setLanguage("mr")}
        className={`px-3 py-1 transition-colors rounded-full ${
          language === "mr"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
        aria-label="Switch to Marathi"
        id="lang-toggle-mr"
      >
        मर
      </button>
    </div>
  );
}
