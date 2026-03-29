interface StatCardProps {
  label: string;
  value: string | number;
  variant?: "primary" | "mentor" | "default";
}

export function StatCard({ label, value, variant = "default" }: StatCardProps) {
  const colorClass =
    variant === "primary" ? "text-primary" : variant === "mentor" ? "text-mentor" : "text-foreground";

  return (
    <div className="bg-card rounded-card shadow-card border border-border p-4 text-center">
      <p className={`text-h2 font-bold ${colorClass}`}>{value}</p>
      <p className="text-caption text-muted-foreground mt-1">{label}</p>
    </div>
  );
}
