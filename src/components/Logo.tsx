import { Sparkles } from "lucide-react";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-hero shadow-elegant">
        <Sparkles className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
      </div>
      <span className="text-xl font-bold tracking-tight">
        Skill<span className="text-gradient">-Hire</span>
      </span>
    </div>
  );
}
