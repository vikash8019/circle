import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  tone = "neutral",
  children,
}: {
  className?: string;
  tone?: "neutral" | "danger" | "mute" | "ok";
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium",
        tone === "neutral" && "border-border bg-secondary text-muted-foreground",
        tone === "danger" && "border-primary/30 bg-primary/15 text-primary",
        tone === "mute" && "border-mute/30 bg-mute/15 text-mute",
        tone === "ok" && "border-ok/30 bg-ok/15 text-ok",
        className,
      )}
    >
      {children}
    </span>
  );
}
