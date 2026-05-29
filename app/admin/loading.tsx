import { Loader2 } from "lucide-react";

export default function AdminLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-muted text-muted">
      <div className="flex flex-col items-center gap-3">
        <Loader2 aria-hidden className="h-6 w-6 animate-spin" />
        <p className="text-sm font-semibold">Chargement…</p>
      </div>
    </div>
  );
}
