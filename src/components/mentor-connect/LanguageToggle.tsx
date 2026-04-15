import { useLanguage } from "@/lib/language-context";

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-border bg-muted p-1 text-[12px] font-semibold select-none">
      <button
        onClick={() => setLanguage("en")}
        className={`min-w-[84px] px-3 py-1.5 transition-colors rounded-full whitespace-nowrap ${
          language === "en"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
        aria-label="Switch to English"
        id="lang-toggle-en"
      >
        English
      </button>
      <button
        onClick={() => setLanguage("mr")}
        className={`min-w-[84px] px-3 py-1.5 transition-colors rounded-full whitespace-nowrap ${
          language === "mr"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
        aria-label="Switch to Marathi"
        id="lang-toggle-mr"
      >
        मराठी
      </button>
    </div>
  );
}
