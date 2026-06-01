import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/brand";

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
        <svg width="24" height="24" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="23" r="11.5" fill="none" stroke="#ffffff" strokeWidth="2.6" />
          <path
            d="M18.6 23.4 L22.4 27.2 L30 18.6"
            fill="none"
            stroke={BRAND.colors.sun}
            strokeWidth="3.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    size,
  );
}
