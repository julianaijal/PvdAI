import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Over PvdAI — De gratis AI-documentbrowser voor PvdA-statuten";
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
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 50%, #0A0A0A 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Top accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: 4,
            background: "linear-gradient(90deg, #F43F5E, #FF6B81, #F43F5E)",
          }}
        />

        {/* Background glow */}
        <div
          style={{
            position: "absolute",
            top: -100,
            right: -100,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(244, 63, 94, 0.15) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -150,
            left: -50,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(244, 63, 94, 0.08) 0%, transparent 70%)",
          }}
        />

        {/* Main card */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "48px 64px",
            borderRadius: 24,
            background: "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))",
            border: "1px solid rgba(255,255,255,0.1)",
            gap: 8,
          }}
        >
          {/* Rose icon */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 72,
              height: 72,
              borderRadius: 18,
              background: "linear-gradient(135deg, #F43F5E, #FF6B81)",
              marginBottom: 16,
              boxShadow: "0 8px 32px rgba(244, 63, 94, 0.4)",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="white"
              width="40"
              height="40"
            >
              <path d="M12 2C9.5 2 7.5 3.5 7 5.5C5 5 3 6.5 3 9c0 2 1.5 3.5 3 4-0.5 1.5 0 3.5 1.5 4.5 1 0.7 2.2 0.8 3.2 0.5L12 21l1.3-3c1 0.3 2.2 0.2 3.2-0.5C18 16.5 18.5 14.5 18 13c1.5-0.5 3-2 3-4 0-2.5-2-4-4-3.5C16.5 3.5 14.5 2 12 2z" />
            </svg>
          </div>

          {/* Title */}
          <div
            style={{
              display: "flex",
              fontSize: 64,
              fontWeight: 700,
              color: "#F9FAFB",
              letterSpacing: "-1px",
            }}
          >
            Pvd
            <span style={{ color: "#F43F5E" }}>AI</span>
          </div>

          {/* Subtitle */}
          <div
            style={{
              display: "flex",
              fontSize: 24,
              color: "#9CA3AF",
              textAlign: "center",
              marginTop: 4,
            }}
          >
            Wat is PvdAI? Lees meer over de gratis AI-documentbrowser
          </div>

          {/* Pill badges */}
          <div
            style={{
              display: "flex",
              gap: 12,
              marginTop: 28,
            }}
          >
            {["Open source", "Gratis", "Onafhankelijk"].map((label) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#F43F5E",
                  padding: "6px 16px",
                  borderRadius: 20,
                  background: "rgba(244, 63, 94, 0.12)",
                  border: "1px solid rgba(244, 63, 94, 0.2)",
                }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Domain */}
        <div
          style={{
            position: "absolute",
            bottom: 28,
            right: 40,
            fontSize: 18,
            color: "#4B5563",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          pvdai.tech
        </div>
      </div>
    ),
    { ...size }
  );
}
