import type { ComponentType, ReactNode } from "react";
import { Inbox } from "lucide-react";

export function EmptyState({
  title,
  children,
  icon: Icon = Inbox,
}: {
  title: string;
  children?: ReactNode;
  icon?: ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-dashed border-border-strong bg-white/70 p-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted text-muted">
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 font-semibold text-ink">{title}</p>
      {children ? <div className="mt-2 max-w-md text-sm text-muted">{children}</div> : null}
    </div>
  );
}
