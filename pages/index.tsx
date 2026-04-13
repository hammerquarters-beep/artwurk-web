import React, { useState } from "react";

const imageStyle: React.CSSProperties = {
  width: "100%",
  height: "auto",
  display: "block",
  background: "#111",
};

export default function Home() {
  const [entered, setEntered] = useState(false);

  if (!entered) {
    return (
      <div
        style={{
          background: "#000",
          color: "#fff",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "serif",
          padding: "40px",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: "64px",
            letterSpacing: "8px",
            marginBottom: "28px",
          }}
        >
          ARTWORK
        </h1>

        <button
          onClick={() => setEntered(true)}
          style={{
            background: "transparent",
            color: "#fff",
            border: "1px solid #666",
            padding: "14px 28px",
            fontSize: "20px",
            letterSpacing: "4px",
            cursor: "pointer",
            fontFamily: "serif",
          }}
        >
          ARTWURK
        </button>
      </div>
    );
  }

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
          maxWidth: "1400px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "30px",
          alignItems: "start",
        }}
      >
        <div style={{ background: "#fff", padding: "14px" }}>
          <img src="/artwork/art1.jpg" alt="Art 1" style={imageStyle} />
        </div>

        <div style={{ background: "#fff", padding: "14px" }}>
          <img src="/artwork/art2.jpg" alt="Art 2" style={imageStyle} />
        </div>

        <div style={{ background: "#fff", padding: "14px" }}>
          <img src="/artwork/art3.jpg" alt="Art 3" style={imageStyle} />
        </div>
      </div>
    </div>
  );
}
