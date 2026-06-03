import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/brand";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
        }}
      >
        <svg width="132" height="132" viewBox="0 0 48 48" fill="none">
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
      </div>
    ),
    size,
  );
}
