export default function GlobalLoading() {
  return (
    <div className="fixed inset-x-0 top-0 z-50 h-1 overflow-hidden bg-transparent" role="status" aria-label="Chargement">
      <div className="h-full w-1/3 animate-[fl-marquee_1.2s_ease-in-out_infinite] bg-[linear-gradient(90deg,transparent,var(--color-primary),transparent)]" />
    </div>
  );
}
