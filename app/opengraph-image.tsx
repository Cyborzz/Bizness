import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/brand";
import { GLYPH } from "@/lib/brand-glyph";

export const alt =
  "Fidélise-moi — Carte fidélité digitale pour commerces locaux";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background:
            "linear-gradient(135deg, #0a0f1f 0%, #131a30 55%, #2454ff 100%)",
          color: "#fff",
          padding: 80,
          fontFamily: "system-ui",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 26,
            fontWeight: 700,
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 12,
              background: `linear-gradient(135deg, ${BRAND.colors.ink} 0%, ${BRAND.colors.primary} 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="38" height="38" viewBox={GLYPH.viewBox} fill="none">
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
          <span>{BRAND.name}</span>
        </div>
        <div
          style={{
            marginTop: 56,
            fontSize: 84,
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: -2,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <span>La carte fidélité</span>
          <span style={{ color: "#f5b84b" }}>digitale simple</span>
          <span>pour commerces locaux.</span>
        </div>
        <div
          style={{
            marginTop: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 22,
            color: "rgba(255,255,255,0.65)",
          }}
        >
          <span>QR code · Carte mobile · Sans application</span>
          <span style={{ color: "#fff", fontWeight: 700 }}>{BRAND.domain}</span>
        </div>
      </div>
    ),
    size,
  );
}
