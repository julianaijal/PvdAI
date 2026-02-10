import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "2rem",
        textAlign: "center",
        fontFamily: "var(--font-inter), system-ui, sans-serif",
      }}
    >
      <h1 style={{ fontSize: "4rem", margin: "0 0 0.5rem", color: "#E30613" }}>404</h1>
      <p style={{ fontSize: "1.25rem", margin: "0 0 2rem", opacity: 0.7 }}>
        Deze pagina bestaat niet.
      </p>
      <Link
        href="/"
        style={{
          padding: "0.75rem 1.5rem",
          background: "#E30613",
          color: "#fff",
          borderRadius: "8px",
          textDecoration: "none",
          fontWeight: 500,
        }}
      >
        Terug naar PvdAI
      </Link>
    </div>
  );
}
