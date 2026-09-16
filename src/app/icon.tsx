import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
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
          backgroundColor: "#ea580c",
          borderRadius: 14,
          fontFamily: "sans-serif",
        }}
      >
        <span style={{ fontSize: 32, fontWeight: 700, color: "white" }}>SK</span>
      </div>
    ),
    { ...size }
  );
}
