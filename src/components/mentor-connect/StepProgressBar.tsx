interface StepProgressBarProps {
  currentStep: number;
  totalSteps: number;
  variant?: "student" | "mentor";
}

export function StepProgressBar({ currentStep, totalSteps, variant = "student" }: StepProgressBarProps) {
  const percentage = (currentStep / totalSteps) * 100;
  const bgClass = variant === "mentor" ? "bg-mentor" : "bg-primary";

  return (
    <div className="w-full">
      <div className="flex justify-between mb-2">
        <span className="text-caption text-muted-foreground">Step {currentStep} of {totalSteps}</span>
      </div>
      <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
        <div className={`h-full ${bgClass} rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
