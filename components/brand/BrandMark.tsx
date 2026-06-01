import { BRAND } from "@/lib/brand";

/**
 * Logotype Fidélise-moi : un badge dégradé avec un anneau de tampon
 * (pointillés = carte à tamponner) et une coche couleur récompense.
 * Composant sans hook → utilisable en Server ou Client Component.
 */
export function BrandMark({
  size = 40,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      role="img"
      aria-label={BRAND.name}
      className={className}
    >
      <defs>
        <linearGradient id="brandMarkGradient" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor={BRAND.colors.ink} />
          <stop offset="1" stopColor={BRAND.colors.primary} />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="13" fill="url(#brandMarkGradient)" />
      <circle
        cx="24"
        cy="23"
        r="11.5"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.4"
        strokeDasharray="3.2 3.4"
        strokeLinecap="round"
        opacity="0.92"
      />
      <path
        d="M18.6 23.4 L22.4 27.2 L30 18.6"
        fill="none"
        stroke={BRAND.colors.sun}
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
