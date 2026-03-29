import { cn } from "@/lib/utils";

interface IndustryChipProps {
  label: string;
  selected?: boolean;
  variant?: "student" | "mentor";
  onPress?: () => void;
}

export function IndustryChip({ label, selected, variant = "student", onPress }: IndustryChipProps) {
  return (
    <button
      onClick={onPress}
      className={cn(
        "px-4 py-2 rounded-chip text-body font-medium transition-all whitespace-nowrap",
        selected
          ? variant === "mentor"
            ? "bg-mentor text-mentor-foreground"
            : "bg-primary text-primary-foreground"
          : "bg-secondary text-secondary-foreground hover:bg-muted"
      )}
    >
      {label}
    </button>
  );
}
