import { ImageResponse } from "next/og";

export const dynamic = "force-static";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0a0f1f 0%, #2454ff 100%)",
          color: "#fff",
          fontSize: 340,
          fontWeight: 900,
          fontFamily: "system-ui",
          borderRadius: 78,
        }}
      >
        F
      </div>
    ),
    { width: 512, height: 512 },
  );
}
