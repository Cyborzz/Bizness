import { BRAND } from "@/lib/brand";

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
        <linearGradient
          id="brandMarkGradient"
          x1="0"
          y1="0"
          x2="48"
          y2="48"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={BRAND.colors.ink} />
          <stop offset="1" stopColor={BRAND.colors.primary} />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="13" fill="url(#brandMarkGradient)" />
      <rect x="10" y="10" width="28" height="28" rx="8" fill="#ffffff" />
      <path
        d="M17 18H33M17 18V33M17 25H28"
        fill="none"
        stroke={BRAND.colors.primary}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="32" cy="32" r="7.5" fill={BRAND.colors.sun} />
      <path
        d="M28.7 32.2L31.1 34.6L36.1 28.8"
        fill="none"
        stroke={BRAND.colors.ink}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
