import { BRAND } from "@/lib/brand";
import { GLYPH } from "@/lib/brand-glyph";

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
      viewBox={GLYPH.viewBox}
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
      <rect width="48" height="48" rx={GLYPH.tile.rx} fill="url(#brandMarkGradient)" />
      <rect
        x={GLYPH.card.x}
        y={GLYPH.card.y}
        width={GLYPH.card.w}
        height={GLYPH.card.h}
        rx={GLYPH.card.rx}
        fill="#ffffff"
      />
      <path
        d={GLYPH.fPath}
        fill="none"
        stroke={BRAND.colors.primary}
        strokeWidth={GLYPH.fStroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={GLYPH.stamp.cx} cy={GLYPH.stamp.cy} r={GLYPH.stamp.r} fill={BRAND.colors.sun} />
      <path
        d={GLYPH.checkPath}
        fill="none"
        stroke={BRAND.colors.ink}
        strokeWidth={GLYPH.checkStroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
