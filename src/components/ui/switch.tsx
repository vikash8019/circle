import { cn } from "@/lib/utils";

type SwitchProps = {
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
};

export function Switch({ checked, onCheckedChange, disabled, className, "aria-label": ariaLabel }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border border-transparent bg-secondary transition-colors duration-[var(--motion-quick)] ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40",
        checked && "bg-primary",
        className,
      )}
    >
      <span
        className={cn(
          "pointer-events-none block size-6 rounded-full bg-foreground shadow-sm transition-transform duration-[var(--motion-quick)] ease-[var(--ease-out)]",
          checked ? "translate-x-5 bg-primary-foreground" : "translate-x-0.5",
        )}
      />
    </button>
  );
}
