import Image from "next/image";
import React, { useState } from "react";

type Artwork = {
  id: string;
  displayId?: string;
  name: string;
  image: string;
  price: string;
};

const artworks = [
  { id: "ART-001-002", displayId: "ART-001 / ART-002", name: "Static Mind / Fragile King", image: "/artwork/art-001-002-static-mind-fragile-king-pair.png", price: "" },
  { id: "ART-003", name: "The Watcher", image: "/artwork/art-003-the-watcher.jpg", price: "" },
  { id: "ART-004", name: "Impact", image: "/artwork/art-004-impact.jpg", price: "" },
  { id: "ART-005", name: "Gilded Veil", image: "/artwork/art-005-gilded-veil.jpg", price: "" },
  { id: "ART-007", name: "Aftermath", image: "/artwork/art-007-aftermath.jpg", price: "" },
  { id: "ART-008", name: "Three States", image: "/artwork/art-008-three-states.png", price: "" },
  { id: "ART-009", name: "Velocity Within", image: "/artwork/art-009-velocity-within.jpg", price: "" },
  { id: "ART-013", name: "Confrontation / Reflection", image: "/artwork/art-013-confrontation-reflection.jpg", price: "" },
  { id: "ART-014", name: "Gold Current", image: "/artwork/art-014-gold-current.png", price: "" },
  { id: "ART-018", name: "Velocity of Chaos", image: "/artwork/art-018-velocity-of-chaos.png", price: "" },
  { id: "ART-032", name: "Structured Force", image: "/artwork/art-032-structured-force.jpg", price: "" },
  { id: "ART-033", name: "Inner Conflict", image: "/artwork/art-033-inner-conflict.png", price: "" },
  { id: "ART-035", name: "Whispered Ascent", image: "/artwork/art-035-whispered-ascent.png", price: "" },
  { id: "ART-038", name: "Black Gold Current", image: "/artwork/art-038-black-gold-current.jpg", price: "" },
] satisfies Artwork[];

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at top, rgba(196, 154, 89, 0.14), transparent 28%), #020202",
  color: "#f7f2e9",
  fontFamily: '"Times New Roman", Georgia, serif',
};

const containerStyle: React.CSSProperties = {
  width: "min(1180px, calc(100vw - 32px))",
  margin: "0 auto",
};

const eyebrowStyle: React.CSSProperties = {
  fontSize: "12px",
  letterSpacing: "0.32em",
  textTransform: "uppercase",
  color: "rgba(247, 242, 233, 0.58)",
};

const metaLabelStyle: React.CSSProperties = {
  fontSize: "11px",
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: "rgba(247, 242, 233, 0.48)",
};

export default function Home() {
  const [missingImages, setMissingImages] = useState<Record<string, boolean>>({});

  return (
    <div style={pageStyle}>
      <main style={{ ...containerStyle, padding: "36px 0 72px" }}>
        <section
          style={{
            border: "1px solid rgba(255, 255, 255, 0.08)",
            padding: "44px 24px 40px",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.015))",
          }}
        >
          <div style={eyebrowStyle}>Hammer HQ LLC</div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "28px",
              alignItems: "end",
              marginTop: "18px",
            }}
          >
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: "clamp(54px, 12vw, 120px)",
                  lineHeight: 0.88,
                  letterSpacing: "0.12em",
                  fontWeight: 400,
                  textTransform: "uppercase",
                }}
              >
                ARTWURK
                <span
                  style={{
                    fontSize: "0.24em",
                    verticalAlign: "top",
                    marginLeft: "6px",
                  }}
                >
                  {"\u2122"}
                </span>
              </h1>

              <div
                style={{
                  marginTop: "20px",
                  fontSize: "clamp(28px, 5vw, 46px)",
                  lineHeight: 1,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Collection
              </div>
            </div>

            <p
              style={{
                margin: 0,
                maxWidth: "520px",
                justifySelf: "end",
                color: "rgba(247, 242, 233, 0.72)",
                fontSize: "17px",
                lineHeight: 1.8,
              }}
            >
              A premium black gallery experience built to present ARTWURK with
              restraint, presence, and space. Each piece is framed to feel
              deliberate, collectible, and elevated on both desktop and mobile.
            </p>
          </div>
        </section>

        <section style={{ marginTop: "36px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "28px",
            }}
          >
            {artworks.map((artwork) => {
              const isMissing = missingImages[artwork.id];
              const displayId = artwork.displayId ?? artwork.id;

              return (
                <article
                  key={artwork.id}
                  style={{
                    background: "#050505",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    padding: "18px",
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      aspectRatio: "4 / 5",
                      background: "#fff",
                      padding: "14px",
                    }}
                  >
                    <div
                      style={{
                        position: "relative",
                        width: "100%",
                        height: "100%",
                        background:
                          "linear-gradient(160deg, rgba(22, 22, 22, 1), rgba(78, 63, 35, 0.85))",
                      }}
                    >
                      {!isMissing ? (
                        <Image
                          src={artwork.image}
                          alt={artwork.name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          style={{ objectFit: "cover" }}
                          onError={() =>
                            setMissingImages((current) => ({
                              ...current,
                              [artwork.id]: true,
                            }))
                          }
                        />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            padding: "22px",
                            color: "#f7f2e9",
                          }}
                        >
                          <div style={metaLabelStyle}>Image Missing</div>
                          <div>
                            <div style={metaLabelStyle}>{displayId}</div>
                            <div
                              style={{
                                marginTop: "10px",
                                fontSize: "30px",
                                lineHeight: 1,
                              }}
                            >
                              {artwork.name}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ padding: "18px 4px 4px" }}>
                    <div style={metaLabelStyle}>{displayId}</div>
                    <h2
                      style={{
                        margin: "10px 0 0",
                        fontSize: "24px",
                        lineHeight: 1.15,
                        fontWeight: 400,
                      }}
                    >
                      {artwork.name}
                    </h2>
                    {artwork.price ? (
                      <div
                        style={{
                          marginTop: "12px",
                          fontSize: "18px",
                          color: "#e5c88f",
                          letterSpacing: "0.04em",
                        }}
                      >
                        {artwork.price}
                      </div>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
