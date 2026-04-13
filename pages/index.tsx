export default function Home() {
  return (
    <div
      style={{
        background: "#000",
        color: "#fff",
        minHeight: "100vh",
        padding: "40px",
        fontFamily: "serif",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          fontSize: "48px",
          marginBottom: "60px",
          letterSpacing: "4px",
        }}
      >
        ARTWURK
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "20px",
        }}
      >
        <img src="/artwork/art1.jpg" alt="Art 1" style={{ width: "100%" }} />
        <img src="/artwork/art2.jpg" alt="Art 2" style={{ width: "100%" }} />
        <img src="/artwork/art3.jpg" alt="Art 3" style={{ width: "100%" }} />
      </div>
    </div>
  );
}
