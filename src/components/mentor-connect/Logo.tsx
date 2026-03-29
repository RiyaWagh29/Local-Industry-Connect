interface LogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "student" | "mentor" | "default";
  showText?: boolean;
}

const sizeMap = {
  sm: { icon: "w-8 h-8 rounded-lg", text: "text-caption", letter: "text-caption" },
  md: { icon: "w-10 h-10 rounded-xl", text: "text-body", letter: "text-caption" },
  lg: { icon: "w-16 h-16 rounded-2xl", text: "text-h2", letter: "text-h2" },
};

const variantMap = {
  default: "bg-primary",
  student: "bg-primary",
  mentor: "bg-mentor",
};

export function Logo({ size = "md", variant = "default", showText = true }: LogoProps) {
  const s = sizeMap[size];
  const bg = variantMap[variant];

  return (
    <div className="flex items-center gap-3">
      <div className={`${s.icon} ${bg} flex items-center justify-center flex-shrink-0 shadow-sm`}>
        <span className={`text-white font-bold ${s.letter}`}>M</span>
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold text-foreground ${s.text} leading-tight`}>MentorConnect</span>
        </div>
      )}
    </div>
  );
}
