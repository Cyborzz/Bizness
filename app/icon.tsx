import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/brand";
import { GLYPH } from "@/lib/brand-glyph";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: `linear-gradient(135deg, ${BRAND.colors.ink} 0%, ${BRAND.colors.primary} 100%)`,
          borderRadius: 7,
        }}
      >
        <svg width="24" height="24" viewBox={GLYPH.viewBox} fill="none">
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
      </div>
    ),
    size,
  );
}
