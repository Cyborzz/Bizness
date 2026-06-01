import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/brand";

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
              background: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="38" height="38" viewBox="0 0 48 48" fill="none">
              <circle
                cx="24"
                cy="23"
                r="11.5"
                fill="none"
                stroke={BRAND.colors.ink}
                strokeWidth="2.4"
                strokeDasharray="3.2 3.4"
                strokeLinecap="round"
              />
              <path
                d="M18.6 23.4 L22.4 27.2 L30 18.6"
                fill="none"
                stroke={BRAND.colors.primary}
                strokeWidth="3.4"
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
