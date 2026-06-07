import { Star } from "lucide-react";

// Affiché au client quand il a une récompense débloquée : moment idéal pour
// solliciter un avis Google (satisfaction au plus haut).
export function GoogleReviewCta({
  url,
  businessName,
}: {
  url: string;
  businessName: string;
}) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-[24px] bg-gradient-to-br from-amber-400 to-amber-500 p-5 text-white shadow-xl transition hover:brightness-105"
    >
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} aria-hidden className="h-4 w-4 fill-white text-white" />
        ))}
      </div>
      <p className="mt-3 text-lg font-black leading-tight">
        Vous adorez {businessName} ?
      </p>
      <p className="mt-1 text-sm font-semibold text-white/90">
        Laissez un avis Google en 30 secondes — ça aide énormément le commerce.
      </p>
      <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-sm font-black text-amber-600">
        Laisser un avis ⭐
      </span>
    </a>
  );
}
