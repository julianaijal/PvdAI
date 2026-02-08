import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "PvdAI — Stel vragen over de statuten van de PvdA";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          backgroundColor: "#FAFAFA",
          padding: "80px 100px",
          position: "relative",
        }}
      >
        {/* Top red bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: 6,
            backgroundColor: "#E30613",
          }}
        />

        {/* Title */}
        <div
          style={{
            display: "flex",
            fontSize: 72,
            fontWeight: 700,
            color: "#0A0A0A",
            marginBottom: 24,
          }}
        >
          Pvd
          <span style={{ color: "#E30613" }}>AI</span>
        </div>

        {/* Subtitle */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 32,
            color: "#4B5563",
            gap: 8,
          }}
        >
          <span>Stel vragen over de statuten en reglementen</span>
          <span>van de Partij van de Arbeid</span>
        </div>

        {/* Button */}
        <div
          style={{
            display: "flex",
            marginTop: 56,
            backgroundColor: "#E30613",
            color: "#fff",
            fontSize: 18,
            fontWeight: 600,
            padding: "12px 40px",
            borderRadius: 8,
            width: 200,
            justifyContent: "center",
          }}
        >
          Stel een vraag
        </div>

        {/* Domain */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            right: 100,
            fontSize: 24,
            color: "#9CA3AF",
          }}
        >
          pvdai.tech
        </div>
      </div>
    ),
    { ...size }
  );
}
