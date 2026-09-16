import { ImageResponse } from "next/og";

export const alt = "SKMS Brique — Gestion Briques";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0f172a",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 140,
            height: 140,
            borderRadius: 28,
            backgroundColor: "#ea580c",
            marginBottom: 40,
          }}
        >
          <span style={{ fontSize: 64, fontWeight: 700, color: "white" }}>SK</span>
        </div>
        <div style={{ fontSize: 56, fontWeight: 700, color: "white" }}>SKMS Brique</div>
        <div style={{ fontSize: 28, color: "#94a3b8", marginTop: 12 }}>
          Gestion des livraisons, ventes et comptabilité
        </div>
      </div>
    ),
    { ...size }
  );
}
