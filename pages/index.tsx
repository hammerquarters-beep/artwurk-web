import Image from "next/image";
import React, { useEffect, useState } from "react";

type Artwork = {
  id: string;
  displayId?: string;
  title: string;
  image: string;
  price: string;
  dimensions: string;
  story: string;
};

const artworks = [
  {
    id: "ART-001-002",
    displayId: "ART-001 / ART-002",
    title: "Static Mind + Fragile King (Pair)",
    image: "/artwork/art-001-002-static-mind-fragile-king-pair.png",
    price: "Price on request",
    dimensions: '24 x 24 in each panel, 48 x 24 in combined',
    story:
      "Original paired presentation of the duo, intended to be viewed as one larger narrative statement.",
  },
  {
    id: "ART-003",
    title: "The Watcher",
    image: "/artwork/art-003-the-watcher.jpg",
    price: "$1,050",
    dimensions: '24 x 48 in',
    story:
      "A faceless observer with stillness, mystery, and quiet authority.",
  },
  {
    id: "ART-004",
    title: "Impact",
    image: "/artwork/art-004-impact.jpg",
    price: "$1,920",
    dimensions: '30 x 40 in',
    story:
      "A raw-energy release piece with force, movement, and emotional collision.",
  },
  {
    id: "ART-005",
    title: "Gilded Veil",
    image: "/artwork/art-005-gilded-veil.jpg",
    price: "$2,040",
    dimensions: '30 x 40 in',
    story:
      "A luxury abstract built on concealment, contrast, and hidden value.",
  },
  {
    id: "ART-007",
    title: "Aftermath",
    image: "/artwork/art-007-aftermath.jpg",
    price: "$2,880",
    dimensions: '24 x 24 in each panel, 48 x 24 in combined',
    story:
      "A diptych installation capturing what remains after intensity passes.",
  },
  {
    id: "ART-008",
    title: "Three States",
    image: "/artwork/art-008-three-states.png",
    price: "$1,740",
    dimensions: '24 x 48 in',
    story:
      "A narrative character group built around emotional contrast and merch-ready identity.",
  },
  {
    id: "ART-009",
    title: "Velocity Within",
    image: "/artwork/art-009-velocity-within.jpg",
    price: "$1,920",
    dimensions: '30 x 40 in',
    story:
      "A controlled-motion abstract with tension, energy, and internal restraint.",
  },
  {
    id: "ART-013",
    title: "Confrontation / Reflection",
    image: "/artwork/art-013-confrontation-reflection.jpg",
    price: "$1,320",
    dimensions: '16 x 16 in each panel, 32 x 16 in combined',
    story:
      "A dual-identity diptych built around self-versus-self tension.",
  },
  {
    id: "ART-014",
    title: "Gold Current",
    image: "/artwork/art-014-gold-current.png",
    price: "$960",
    dimensions: '20 x 20 in',
    story:
      "A minimal luxury flow piece with vein-like direction and controlled movement.",
  },
  {
    id: "ART-018",
    title: "Velocity of Chaos",
    image: "/artwork/art-018-velocity-of-chaos.png",
    price: "$2,520",
    dimensions: '24 x 48 in',
    story:
      "A visually aggressive statement work centered on force, impact, and collision.",
  },
  {
    id: "ART-032",
    title: "Structured Force",
    image: "/artwork/art-032-structured-force.jpg",
    price: "$1,140",
    dimensions: '24 x 36 in',
    story:
      "A geometric and gestural bridge piece balancing structure with expression.",
  },
  {
    id: "ART-033",
    title: "Inner Conflict",
    image: "/artwork/art-033-inner-conflict.png",
    price: "$1,440",
    dimensions: '24 x 36 in',
    story:
      "A psychological abstract with hidden-face energy and dark internal tension.",
  },
  {
    id: "ART-035",
    title: "Whispered Ascent",
    image: "/artwork/art-035-whispered-ascent.png",
    price: "$840",
    dimensions: '16 x 20 in',
    story:
      "A quiet spiritual collector piece with restrained lift and minimal presence.",
  },
  {
    id: "ART-038",
    title: "Black Gold Current",
    image: "/artwork/art-038-black-gold-current.jpg",
    price: "$960",
    dimensions: '16 x 20 in',
    story:
      "A flagship commercial-style luxury minimal abstract in the black-gold lane.",
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
  const [showGallery, setShowGallery] = useState(false);
  const [galleryVisible, setGalleryVisible] = useState(false);

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

  useEffect(() => {
    if (!showGallery) {
      setGalleryVisible(false);
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      setGalleryVisible(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [showGallery]);

  const enterCollection = () => {
    setShowGallery(true);
  };

  return (
    <div style={pageStyle}>
      {!showGallery ? (
        <section
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            animation: "artwurk-fade-in 420ms ease both",
          }}
        >
          <div
            style={{
              width: "min(980px, 100%)",
              textAlign: "center",
              padding: "48px 24px",
            }}
          >
            <div
              style={{
                fontSize: "clamp(64px, 15vw, 156px)",
                lineHeight: 0.88,
                letterSpacing: "0.12em",
                fontWeight: 700,
                textTransform: "uppercase",
                color: "#ffffff",
                textShadow: "0 24px 60px rgba(0, 0, 0, 0.45)",
              }}
            >
              ARTWURK
              <span
                style={{
                  fontSize: "0.22em",
                  verticalAlign: "top",
                  marginLeft: "8px",
                  fontWeight: 400,
                }}
              >
                {"\u2122"}
              </span>
            </div>

            <div
              style={{
                marginTop: "24px",
                display: "flex",
                justifyContent: "center",
                alignItems: "baseline",
                flexWrap: "wrap",
                gap: "12px",
                whiteSpace: "normal",
              }}
            >
              <span
                style={{
                  fontSize: "clamp(22px, 3vw, 34px)",
                  color: "rgba(247, 242, 233, 0.72)",
                  fontWeight: 400,
                }}
              >
                PUTTING
              </span>
              <span
                style={{
                  fontSize: "clamp(34px, 5vw, 56px)",
                  color: "#ffffff",
                  fontWeight: 700,
                  lineHeight: 1,
                  letterSpacing: "0.04em",
                }}
              >
                YOU
              </span>
              <span
                style={{
                  fontSize: "clamp(22px, 3vw, 34px)",
                  color: "rgba(247, 242, 233, 0.72)",
                  fontWeight: 400,
                }}
              >
                IN THE ART
              </span>
            </div>

            <button
              onClick={enterCollection}
              style={{
                marginTop: "42px",
                padding: "16px 30px",
                border: "1px solid rgba(255, 255, 255, 0.16)",
                background: "rgba(255, 255, 255, 0.03)",
                color: "#f7f2e9",
                cursor: "pointer",
                fontSize: "12px",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                transition:
                  "transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease, background 180ms ease",
                boxShadow: "0 16px 50px rgba(0, 0, 0, 0.26)",
              }}
            >
              View Collection
            </button>
          </div>
        </section>
      ) : null}

      {showGallery ? (
        <div
          style={{
            opacity: galleryVisible ? 1 : 0,
            transform: galleryVisible ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 360ms ease, transform 360ms ease",
          }}
        >
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
                  A premium black gallery experience built to present ARTWURK
                  with restraint, presence, and space. Each piece is framed to
                  feel deliberate, collectible, and elevated on both desktop and
                  mobile.
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
                      onMouseLeave={() =>
                        setHoveredArtworkId((current) =>
                          current === artwork.id ? null : current,
                        )
                      }
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
                              alt={artwork.title}
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
                                  {artwork.title}
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
                          {artwork.title}
                        </h2>
                        <div
                          style={{
                            marginTop: "12px",
                            fontSize: "18px",
                            color: "#D4AF37",
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
        </div>
      ) : null}

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
              width: "min(1240px, 100%)",
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
                  minHeight: "min(80vh, 860px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    "linear-gradient(160deg, rgba(17, 17, 17, 1), rgba(92, 70, 29, 0.18))",
                  borderRight: "1px solid rgba(255, 255, 255, 0.06)",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "min(80vh, 860px)",
                  }}
                >
                  <Image
                    src={selectedArtwork.image}
                    alt={selectedArtwork.title}
                    fill
                    sizes="(max-width: 900px) 100vw, 58vw"
                    style={{ objectFit: "contain" }}
                  />
                </div>
              </div>

              <div
                style={{
                  padding: "32px 30px",
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
                        fontWeight: 700,
                        color: "#faf6ef",
                      }}
                    >
                      {selectedArtwork.title}
                    </h2>
                  </div>

                  <button
                    onClick={() => setSelectedArtwork(null)}
                    aria-label="Close artwork view"
                    style={{
                      width: "42px",
                      height: "42px",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      background: "transparent",
                      color: "#f7f2e9",
                      cursor: "pointer",
                      fontSize: "18px",
                      lineHeight: 1,
                      flexShrink: 0,
                    }}
                  >
                    {"\u00D7"}
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
                    <div
                      style={{
                        marginTop: "8px",
                        fontSize: "24px",
                        color: "#D4AF37",
                        letterSpacing: "0.03em",
                        fontWeight: 700,
                      }}
                    >
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
        @keyframes artwurk-fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

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
