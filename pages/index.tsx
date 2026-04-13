export default function Home() {
  return (
    <div
      style={{
        background: "#000",
        color: "#fff",
        minHeight: "100vh",
        padding: "60px 40px",
        fontFamily: "serif",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          fontSize: "48px",
          marginBottom: "80px",
          letterSpacing: "6px",
        }}
      >
        ARTWURK
      </h1>

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "30px",
        }}
      >
        <img src="/artwork/art1.jpg" style={imageStyle} />
        <img src="/artwork/art2.jpg" style={imageStyle} />
        <img src="/artwork/art3.jpg" style={imageStyle} />
      </div>
    </div>
  );
}

const imageStyle = {
  width: "100%",
  height: "400px",
  objectFit: "cover",
  borderRadius: "4px",
};
