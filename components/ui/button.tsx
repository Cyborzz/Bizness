import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

const variants = {
  primary:
    "bg-primary text-white shadow-[var(--shadow-glow-primary)] hover:bg-primary-dark hover:shadow-[0_18px_44px_-10px_rgba(36,84,255,0.55)]",
  dark: "bg-ink text-white shadow-[0_14px_30px_rgba(10,15,31,0.22)] hover:bg-ink-2",
  secondary:
    "bg-white text-ink ring-1 ring-border hover:ring-border-strong hover:bg-surface-muted",
  outline: "border border-white/20 bg-white/0 text-white hover:bg-white/10",
  ghost: "text-gray-700 hover:bg-gray-100",
  danger:
    "bg-red-600 text-white shadow-[0_14px_30px_rgba(220,38,38,0.18)] hover:bg-red-700",
  mint: "bg-mint text-white shadow-[var(--shadow-glow-mint)] hover:brightness-110",
} as const;

const sizes = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-base",
  xl: "h-14 px-7 text-base",
  icon: "h-10 w-10 p-0",
} as const;

type SharedProps = {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  children: ReactNode;
  className?: string;
};

type ButtonProps = SharedProps & ButtonHTMLAttributes<HTMLButtonElement>;
type LinkButtonProps = SharedProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

const baseClasses =
  "focus-ring btn-press inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition disabled:pointer-events-none disabled:opacity-55";

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button className={cn(baseClasses, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
}

export function LinkButton({
  variant = "primary",
  size = "md",
  className,
  children,
  href,
  ...props
}: LinkButtonProps) {
  return (
    <Link href={href} className={cn(baseClasses, variants[variant], sizes[size], className)} {...props}>
      {children}
    </Link>
  );
}
