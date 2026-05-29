import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

const tones = {
  neutral: "bg-gray-100 text-gray-700 ring-gray-200",
  primary: "bg-primary-soft text-primary-dark ring-primary/20",
  mint: "bg-mint-soft text-mint ring-mint/20",
  sun: "bg-sun-soft text-[#9a5b00] ring-sun/30",
  coral: "bg-coral-soft text-coral ring-coral/25",
  violet: "bg-violet-soft text-violet ring-violet/20",
  dark: "bg-ink text-white ring-white/10",
  danger: "bg-red-100 text-red-700 ring-red-200",
} as const;

export type BadgeTone = keyof typeof tones;

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
};

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
