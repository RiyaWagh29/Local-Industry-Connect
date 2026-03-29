import { X } from "lucide-react";

interface SkillTagProps {
  label: string;
  removable?: boolean;
  onRemove?: () => void;
}

export function SkillTag({ label, removable, onRemove }: SkillTagProps) {
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-chip bg-secondary text-secondary-foreground text-caption">
      {label}
      {removable && (
        <button onClick={onRemove} className="hover:text-destructive transition-colors">
          <X size={12} />
        </button>
      )}
    </span>
  );
}
