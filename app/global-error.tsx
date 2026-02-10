"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="nl">
      <body
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          padding: "2rem",
          textAlign: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#0A0A0A",
          color: "#fff",
          margin: 0,
        }}
      >
        <h1 style={{ fontSize: "2rem", margin: "0 0 0.5rem" }}>Er ging iets mis</h1>
        <p style={{ fontSize: "1.1rem", margin: "0 0 2rem", opacity: 0.7 }}>
          Er is een onverwachte fout opgetreden.
        </p>
        <button
          onClick={reset}
          style={{
            padding: "0.75rem 1.5rem",
            background: "#E30613",
            color: "#fff",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            fontWeight: 500,
            fontSize: "1rem",
          }}
        >
          Opnieuw proberen
        </button>
      </body>
    </html>
  );
}
