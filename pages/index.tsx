import React, { useState } from "react";

type Artwork = {
  title: string;
  image: string;
};

const artworks: Artwork[] = [
  { title: "ART 1", image: "/artwork/art1.jpg" },
  { title: "ART 2", image: "/artwork/art2.jpg" },
  { title: "ART 3", image: "/artwork/art3.jpg" },
  { title: "ART 4", image: "/artwork/art4.jpg" },
  { title: "ART 5", image: "/artwork/art5.jpg" },
  { title: "ART 6", image: "/artwork/art6.jpg" },
];

const imageStyle: React.CSSProperties = {
  width: "100%",
  height: "auto",
  display: "block",
  background: "#111",
};

export default function Home() {
  const [entered, setEntered] = useState(false);
  const [selectedArt, setSelectedArt] = useState<Artwork | null>(null);

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
            marginBottom: "10px",
          }}
        >
          ARTWURK
          <span
            style={{
              fontSize: "18px",
              verticalAlign: "top",
              marginLeft: "4px",
            }}
          >
            ™
          </span>
        </h1>

        <button
          onClick={() => setEntered(true)}
          style={{
            background: "transparent",
            color: "#fff",
            border: "1px solid #666",
            padding: "14px 28px",
            fontSize: "18px",
            letterSpacing: "4px",
            cursor: "pointer",
            fontFamily: "serif",
            marginBottom: "20px",
          }}
        >
          VIEW COLLECTION
        </button>

        <p
          style={{
            fontSize: "18px",
            letterSpacing: "4px",
            opacity: 0.85,
            fontFamily: "serif",
          }}
        >
          PUTTING{" "}
          <span
            style={{
              fontSize: "26px",
              fontWeight: 800,
              letterSpacing: "6px",
            }}
          >
            YOU
          </span>{" "}
          IN THE ART
        </p>
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
        <span
          style={{
            fontSize: "16px",
            verticalAlign: "top",
            marginLeft: "4px",
          }}
        >
          ™
        </span>
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
        {artworks.map((art, index) => (
          <button
            key={index}
            onClick={() => setSelectedArt(art)}
            style={{
              background: "#fff",
              padding: "14px",
              border: "none",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <img src={art.image} alt={art.title} style={imageStyle} />
            <div
              style={{
                color: "#000",
                marginTop: "12px",
                fontSize: "16px",
                letterSpacing: "2px",
              }}
            >
              {art.title}
            </div>
          </button>
        ))}
      </div>

      {selectedArt && (
        <div
          onClick={() => setSelectedArt(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px",
            zIndex: 1000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#111",
              padding: "24px",
              maxWidth: "900px",
              width: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: "28px",
                  letterSpacing: "3px",
                }}
              >
                {selectedArt.title}
              </h2>

              <button
                onClick={() => setSelectedArt(null)}
                style={{
                  background: "transparent",
                  color: "#fff",
                  border: "1px solid #555",
                  padding: "8px 14px",
                  cursor: "pointer",
                  fontFamily: "serif",
                }}
              >
                CLOSE
              </button>
            </div>

            <img
              src={selectedArt.image}
              alt={selectedArt.title}
              style={{
                width: "100%",
                height: "auto",
                display: "block",
                background: "#000",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
