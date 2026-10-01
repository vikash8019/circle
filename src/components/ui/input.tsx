import { type InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = "text", ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-11 w-full rounded-lg border border-border bg-secondary px-3 text-sm text-foreground placeholder:text-subtle outline-none transition-[border-color,box-shadow] duration-[var(--motion-quick)] ease-[var(--ease-out)] focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";
