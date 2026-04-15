import Image from "next/image";
import React, { useEffect, useState } from "react";

type Artwork = {
  id: string;
  displayId?: string;
  name: string;
  image: string;
  price: string;
  dimensions: string;
  story: string;
};

const artworks = [
  {
    id: "ART-001-002",
    displayId: "ART-001 / ART-002",
    name: "Static Mind / Fragile King",
    image: "/artwork/art-001-002-static-mind-fragile-king-pair.png",
    price: "Private catalog release",
    dimensions: "Diptych dimensions to be finalized",
    story:
      "Story placement is being refined. This paired work is currently held as a character-driven dual entry inside the ARTWURK catalog.",
  },
  {
    id: "ART-003",
    name: "The Watcher",
    image: "/artwork/art-003-the-watcher.jpg",
    price: "Private catalog release",
    dimensions: "Dimensions to be finalized",
    story:
      "Story placement is being refined. This work is currently presented as a symbolic character study within the evolving ARTWURK collection.",
  },
  {
    id: "ART-004",
    name: "Impact",
    image: "/artwork/art-004-impact.jpg",
    price: "Private catalog release",
    dimensions: "Dimensions to be finalized",
    story:
      "Story placement is being refined. The piece is currently positioned as a force-forward abstract built around tension, movement, and immediate visual strike.",
  },
  {
    id: "ART-005",
    name: "Gilded Veil",
    image: "/artwork/art-005-gilded-veil.jpg",
    price: "Private catalog release",
    dimensions: "Dimensions to be finalized",
    story:
      "Story placement is being refined. This entry leans into a controlled luxury tone, using softness and metallic presence to hold attention quietly.",
  },
  {
    id: "ART-007",
    name: "Aftermath",
    image: "/artwork/art-007-aftermath.jpg",
    price: "Private catalog release",
    dimensions: "Dimensions to be finalized",
    story:
      "Story placement is being refined. The composition is being treated as a post-impact emotional field, where residue and silence become the subject.",
  },
  {
    id: "ART-008",
    name: "Three States",
    image: "/artwork/art-008-three-states.png",
    price: "Private catalog release",
    dimensions: "Dimensions to be finalized",
    story:
      "Story placement is being refined. This work is currently cataloged as a psychological and character-based piece centered on shifting emotional condition.",
  },
  {
    id: "ART-009",
    name: "Velocity Within",
    image: "/artwork/art-009-velocity-within.jpg",
    price: "Private catalog release",
    dimensions: "Dimensions to be finalized",
    story:
      "Story placement is being refined. The current reading frames this work as interior acceleration held beneath an otherwise controlled surface.",
  },
  {
    id: "ART-013",
    name: "Confrontation / Reflection",
    image: "/artwork/art-013-confrontation-reflection.jpg",
    price: "Private catalog release",
    dimensions: "Dimensions to be finalized",
    story:
      "Story placement is being refined. This mirrored structure is currently held as a dual-image examination of tension, identity, and self-recognition.",
  },
  {
    id: "ART-014",
    name: "Gold Current",
    image: "/artwork/art-014-gold-current.png",
    price: "Private catalog release",
    dimensions: "Dimensions to be finalized",
    story:
      "Story placement is being refined. The piece is cataloged around a focused current of value and motion cutting through a darker field.",
  },
  {
    id: "ART-018",
    name: "Velocity of Chaos",
    image: "/artwork/art-018-velocity-of-chaos.png",
    price: "Private catalog release",
    dimensions: "Dimensions to be finalized",
    story:
      "Story placement is being refined. This work is currently read as unstable momentum held inside a charged red-violet atmosphere.",
  },
  {
    id: "ART-032",
    name: "Structured Force",
    image: "/artwork/art-032-structured-force.jpg",
    price: "Private catalog release",
    dimensions: "Dimensions to be finalized",
    story:
      "Story placement is being refined. The composition is positioned as a disciplined force study, balancing geometry, pressure, and restraint.",
  },
  {
    id: "ART-033",
    name: "Inner Conflict",
    image: "/artwork/art-033-inner-conflict.png",
    price: "Private catalog release",
    dimensions: "Dimensions to be finalized",
    story:
      "Story placement is being refined. This piece is currently cataloged as an inward psychological tension study with a fractured emotional center.",
  },
  {
    id: "ART-035",
    name: "Whispered Ascent",
    image: "/artwork/art-035-whispered-ascent.png",
    price: "Private catalog release",
    dimensions: "Dimensions to be finalized",
    story:
      "Story placement is being refined. The work is being held as a softer upward movement piece, where lift and subtlety replace spectacle.",
  },
  {
    id: "ART-038",
    name: "Black Gold Current",
    image: "/artwork/art-038-black-gold-current.jpg",
    price: "Private catalog release",
    dimensions: "Dimensions to be finalized",
    story:
      "Story placement is being refined. This entry focuses on contrast, luxury, and directional energy through a black-gold current motif.",
  },
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

const modalMetaStyle: React.CSSProperties = {
  fontSize: "12px",
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: "rgba(247, 242, 233, 0.52)",
};

export default function Home() {
  const [missingImages, setMissingImages] = useState<Record<string, boolean>>({});
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [hoveredArtworkId, setHoveredArtworkId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedArtwork) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedArtwork(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedArtwork]);

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
              const isHovered = hoveredArtworkId === artwork.id;

              return (
                <button
                  key={artwork.id}
                  onClick={() => setSelectedArtwork(artwork)}
                  onMouseEnter={() => setHoveredArtworkId(artwork.id)}
                  onMouseLeave={() => setHoveredArtworkId((current) => (current === artwork.id ? null : current))}
                  style={{
                    background: "#050505",
                    border: isHovered
                      ? "1px solid rgba(212, 175, 55, 0.34)"
                      : "1px solid rgba(255, 255, 255, 0.08)",
                    padding: "18px",
                    textAlign: "left",
                    color: "inherit",
                    cursor: "pointer",
                    transition:
                      "transform 220ms ease, border-color 220ms ease, background 220ms ease, box-shadow 220ms ease",
                    transform: isHovered ? "scale(1.03)" : "scale(1)",
                    boxShadow: isHovered
                      ? "0 24px 60px rgba(0, 0, 0, 0.32), 0 0 28px rgba(212, 175, 55, 0.12)"
                      : "0 0 0 rgba(0, 0, 0, 0)",
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
                          style={{
                            objectFit: "cover",
                            transform: isHovered ? "scale(1.03)" : "scale(1)",
                            transition: "transform 260ms ease",
                          }}
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
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </main>

      {selectedArtwork ? (
        <div
          onClick={() => setSelectedArtwork(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.9)",
            backdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            zIndex: 80,
            animation: "artwurk-modal-fade 240ms ease both",
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "min(1220px, 100%)",
              maxHeight: "calc(100vh - 48px)",
              overflow: "auto",
              background: "#060606",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              boxShadow: "0 40px 120px rgba(0, 0, 0, 0.45)",
              animation: "artwurk-modal-panel 280ms ease both",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              }}
            >
              <div
                style={{
                  position: "relative",
                  minHeight: "min(72vh, 820px)",
                  background:
                    "linear-gradient(160deg, rgba(17, 17, 17, 1), rgba(92, 70, 29, 0.28))",
                }}
              >
                <Image
                  src={selectedArtwork.image}
                  alt={selectedArtwork.name}
                  fill
                  sizes="(max-width: 900px) 100vw, 60vw"
                  style={{ objectFit: "contain" }}
                />
              </div>

              <div
                style={{
                  padding: "28px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "26px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "18px",
                    alignItems: "start",
                  }}
                >
                  <div>
                    <div style={modalMetaStyle}>
                      {selectedArtwork.displayId ?? selectedArtwork.id}
                    </div>
                    <h2
                      style={{
                        margin: "12px 0 0",
                        fontSize: "clamp(34px, 5vw, 54px)",
                        lineHeight: 0.96,
                        fontWeight: 400,
                      }}
                    >
                      {selectedArtwork.name}
                    </h2>
                  </div>

                  <button
                    onClick={() => setSelectedArtwork(null)}
                    aria-label="Close artwork view"
                    style={{
                      padding: "10px 14px",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      background: "transparent",
                      color: "#f7f2e9",
                      cursor: "pointer",
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      fontSize: "11px",
                      flexShrink: 0,
                    }}
                  >
                    Close
                  </button>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: "18px",
                  }}
                >
                  <div>
                    <div style={modalMetaStyle}>Artwork ID</div>
                    <div style={{ marginTop: "8px", fontSize: "18px" }}>
                      {selectedArtwork.displayId ?? selectedArtwork.id}
                    </div>
                  </div>
                  <div>
                    <div style={modalMetaStyle}>Price</div>
                    <div style={{ marginTop: "8px", fontSize: "18px", color: "#e5c88f" }}>
                      {selectedArtwork.price}
                    </div>
                  </div>
                  <div>
                    <div style={modalMetaStyle}>Dimensions</div>
                    <div style={{ marginTop: "8px", fontSize: "18px" }}>
                      {selectedArtwork.dimensions}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                    paddingTop: "24px",
                  }}
                >
                  <div style={modalMetaStyle}>Story</div>
                  <p
                    style={{
                      margin: "14px 0 0",
                      color: "rgba(247, 242, 233, 0.76)",
                      fontSize: "17px",
                      lineHeight: 1.9,
                    }}
                  >
                    {selectedArtwork.story}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <style jsx global>{`
        @keyframes artwurk-modal-fade {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes artwurk-modal-panel {
          from {
            opacity: 0;
            transform: translateY(18px) scale(0.985);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
