import { ImageResponse } from "next/og";

export const alt = "SceneIt — AI Movie Recommendations";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "linear-gradient(135deg,#111827,#312e81,#9a3412)", color: "white", fontFamily: "sans-serif" }}>
      <div style={{ fontSize: 30, color: "#fdba74", marginBottom: 22 }}>SCENEIT</div>
      <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05 }}>AI Movie Recommendations</div>
      <div style={{ marginTop: 30, fontSize: 30, color: "#e5e7eb" }}>Find the right movie or show for this moment.</div>
    </div>, size
  );
}
