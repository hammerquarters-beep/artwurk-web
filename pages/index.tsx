import Image from "next/image";
import Script from "next/script";
import React, { FormEvent, useEffect, useState } from "react";

import artworks, { type ArtworkRecord } from "../data/artworks";
import type { ArtworkTrackingRecord, InquiryIntent, LeadStatus } from "../lib/crm-types";
import {
  getTrackingSessionState,
  trackEvent,
  trackInquiry,
  trackLead,
} from "../lib/tracking";

type CollectorFormState = {
  name: string;
  email: string;
  phone: string;
  preferredContact: "email" | "whatsapp" | "phone";
  budgetRange: string;
  message: string;
};

type SubmissionState = {
  status: "idle" | "submitting" | "success" | "error";
  message?: string;
};

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

const trustLineStyle: React.CSSProperties = {
  padding: "14px 0",
  borderBottom: "1px solid rgba(255, 255, 255, 0.07)",
  color: "rgba(247, 242, 233, 0.82)",
  fontSize: "15px",
  lineHeight: 1.5,
};

const fieldStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  border: "1px solid rgba(255, 255, 255, 0.12)",
  background: "rgba(255, 255, 255, 0.03)",
  color: "#f7f2e9",
  fontSize: "15px",
  fontFamily: '"Times New Roman", Georgia, serif',
};

const inquiryEmail = "hammerhq@outlook.com";
const inquiryWhatsAppLabel = "HQ";
const inquiryWhatsAppDisplay = "+1 (209) 684-2964";
const inquiryWhatsAppUrl = "https://wa.me/12096842964";
const paypalSdkSrc =
  "https://www.paypal.com/sdk/js?client-id=BAApqENv-0EtbRTyPYL5WXCWQjYvRGMtjcYUpTgN1a9CZ16b5MhC38hZAAa5un2j64qLDI5DwknEPwuFt0&components=hosted-buttons&enable-funding=venmo&currency=USD";
const theWatcherHostedButtonId = "EA68DYJEMEDNW";
const theWatcherArtworkId = "ART-003";
const theWatcherPaypalContainerId = "paypal-container-EA68DYJEMEDNW";

type PayPalHostedButtonsApi = {
  HostedButtons: (config: { hostedButtonId: string }) => {
    render: (selector: string) => Promise<void> | void;
  };
};

const createInitialCollectorForm = (): CollectorFormState => ({
  name: "",
  email: "",
  phone: "",
  preferredContact: "email",
  budgetRange: "",
  message: "",
});

const collectorActionConfig: Record<
  InquiryIntent,
  {
    label: string;
    event: "inquire_click" | "buy_now_click" | "pay_in_4_click";
    helper: string;
    submitLabel: string;
  }
> = {
  inquire: {
    label: "Inquire",
    event: "inquire_click",
    helper: "Request availability, collector notes, and next steps from Hammer HQ.",
    submitLabel: "Send Inquiry",
  },
  buy_now: {
    label: "Buy Now",
    event: "buy_now_click",
    helper: "Signal immediate purchase intent so Hammer HQ can reserve the piece and follow up.",
    submitLabel: "Request Purchase",
  },
  pay_in_4: {
    label: "Pay In 4",
    event: "pay_in_4_click",
    helper: "Register financing interest so Hammer HQ can follow up with installment options.",
    submitLabel: "Request Pay In 4",
  },
};

const formatStatusLabel = (status?: string) => {
  if (!status) {
    return "Available";
  }

  return status.replaceAll("-", " ");
};

export default function Home() {
  const [missingImages, setMissingImages] = useState<Record<string, boolean>>({});
  const [selectedArtwork, setSelectedArtwork] = useState<ArtworkRecord | null>(null);
  const [hoveredArtworkId, setHoveredArtworkId] = useState<string | null>(null);
  const [hoverTracked, setHoverTracked] = useState<Record<string, boolean>>({});
  const [showGallery, setShowGallery] = useState(false);
  const [galleryVisible, setGalleryVisible] = useState(false);
  const [hasTrackedGalleryView, setHasTrackedGalleryView] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [paypalSdkReady, setPaypalSdkReady] = useState(false);
  const [collectorIntent, setCollectorIntent] = useState<InquiryIntent>("inquire");
  const [collectorForm, setCollectorForm] = useState<CollectorFormState>(
    createInitialCollectorForm(),
  );
  const [submissionState, setSubmissionState] = useState<SubmissionState>({
    status: "idle",
  });

  const toTrackingArtwork = (artwork: ArtworkRecord): ArtworkTrackingRecord => ({
    id: artwork.id,
    displayId: artwork.displayId,
    name: artwork.name,
    image: artwork.image,
    price: artwork.price,
    dimensions: artwork.dimensions,
    category: artwork.category,
    status: artwork.status,
  });

  useEffect(() => {
    const sessionState = getTrackingSessionState();

    trackEvent({
      event: "landing_page_view",
      route: "/",
      page: "landing",
      source: "page-load",
      metadata: {
        isReturningVisitor: sessionState.isReturningVisitor,
      },
    });

    if (sessionState.isNewSession) {
      trackEvent({
        event: "session_started",
        route: "/",
        page: "landing",
        source: "session-start",
      });
    }

    if (sessionState.isReturningVisitor) {
      trackEvent({
        event: "return_visit",
        route: "/",
        page: "landing",
        source: "session-start",
      });
    }
  }, []);

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

  useEffect(() => {
    if (!showGallery || !galleryVisible || hasTrackedGalleryView) {
      return;
    }

    trackEvent({
      event: "gallery_view",
      route: "/",
      page: "gallery",
      source: "collection-view",
    });
    setHasTrackedGalleryView(true);
  }, [galleryVisible, hasTrackedGalleryView, showGallery]);

  useEffect(() => {
    if (!selectedArtwork) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    setCollectorIntent("inquire");
    setCollectorForm(createInitialCollectorForm());
    setSubmissionState({ status: "idle" });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeArtwork("escape-key");
      }
    };

    const frame = window.requestAnimationFrame(() => {
      setModalVisible(true);
    });

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(frame);
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedArtwork]);

  useEffect(() => {
    if (!selectedArtwork || !modalVisible) {
      return;
    }

    trackEvent({
      event: "modal_open",
      route: "/",
      page: "gallery",
      source: "artwork-modal",
      artwork: toTrackingArtwork(selectedArtwork),
    });
  }, [modalVisible, selectedArtwork]);

  useEffect(() => {
    const isTheWatcherOpen =
      selectedArtwork?.id === theWatcherArtworkId && modalVisible && paypalSdkReady;

    if (!isTheWatcherOpen || typeof window === "undefined") {
      return;
    }

    const paypal = (window as Window & { paypal?: PayPalHostedButtonsApi }).paypal;
    const container = document.getElementById(theWatcherPaypalContainerId);

    if (!paypal?.HostedButtons || !container) {
      return;
    }

    container.innerHTML = "";

    void paypal
      .HostedButtons({
        hostedButtonId: theWatcherHostedButtonId,
      })
      .render(`#${theWatcherPaypalContainerId}`);
  }, [modalVisible, paypalSdkReady, selectedArtwork]);

  useEffect(() => {
    if (!selectedArtwork || modalVisible) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setSelectedArtwork(null);
      setSubmissionState({ status: "idle" });
    }, 220);

    return () => window.clearTimeout(timeout);
  }, [modalVisible, selectedArtwork]);

  const enterCollection = () => {
    trackEvent({
      event: "view_collection_click",
      route: "/",
      page: "landing",
      source: "landing-cta",
    });
    setShowGallery(true);
  };

  const openArtwork = (artwork: ArtworkRecord) => {
    trackEvent({
      event: "artwork_click",
      route: "/",
      page: "gallery",
      source: "artwork-card",
      artwork: toTrackingArtwork(artwork),
    });
    setSelectedArtwork(artwork);
    setModalVisible(false);
  };

  const closeArtwork = (reason: string) => {
    if (selectedArtwork) {
      trackEvent({
        event: "modal_close",
        route: "/",
        page: "gallery",
        source: reason,
        artwork: toTrackingArtwork(selectedArtwork),
      });
    }

    setModalVisible(false);
  };

  const handleArtworkHover = (artwork: ArtworkRecord) => {
    setHoveredArtworkId(artwork.id);

    if (hoverTracked[artwork.id]) {
      return;
    }

    setHoverTracked((current) => ({
      ...current,
      [artwork.id]: true,
    }));

    trackEvent({
      event: "artwork_card_hover",
      route: "/",
      page: "gallery",
      source: "artwork-card",
      artwork: toTrackingArtwork(artwork),
    });
  };

  const handleCollectorIntent = (intent: InquiryIntent) => {
    if (!selectedArtwork) {
      return;
    }

    setCollectorIntent(intent);
    setSubmissionState({ status: "idle" });

    trackEvent({
      event: collectorActionConfig[intent].event,
      route: "/",
      page: "gallery",
      source: "collector-action",
      artwork: toTrackingArtwork(selectedArtwork),
      metadata: {
        intent,
      },
    });
  };

  const handleFieldChange = (
    field: keyof CollectorFormState,
    value: CollectorFormState[keyof CollectorFormState],
  ) => {
    setCollectorForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const buildWhatsAppHref = (artwork: ArtworkRecord, intent: InquiryIntent) => {
    const actionLabel = collectorActionConfig[intent].label;
    const message = [
      `Hello Hammer HQ, I want to ${actionLabel.toLowerCase()} for ${artwork.name}.`,
      `Artwork ID: ${artwork.displayId ?? artwork.id}`,
      `Price: ${artwork.price}`,
      collectorForm.name ? `Name: ${collectorForm.name}` : "",
      collectorForm.email ? `Email: ${collectorForm.email}` : "",
      collectorForm.phone ? `Phone: ${collectorForm.phone}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    return `${inquiryWhatsAppUrl}?text=${encodeURIComponent(message)}`;
  };

  const handleCollectorSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedArtwork) {
      return;
    }

    const trimmedName = collectorForm.name.trim();
    const trimmedEmail = collectorForm.email.trim();

    if (!trimmedName || !trimmedEmail) {
      setSubmissionState({
        status: "error",
        message: "Please provide your name and email so Hammer HQ can follow up.",
      });
      return;
    }

    setSubmissionState({ status: "submitting" });

    const trackingArtwork = toTrackingArtwork(selectedArtwork);
    const leadStatus: LeadStatus = collectorIntent === "buy_now" ? "qualified" : "new";

    try {
      trackEvent({
        event: "inquiry_submit",
        route: "/",
        page: "gallery",
        source: "collector-form",
        artwork: trackingArtwork,
        metadata: {
          intent: collectorIntent,
        },
      });

      trackInquiry({
        route: "/",
        page: "gallery",
        source: "collector-form",
        status: "new",
        intent: collectorIntent,
        artwork: trackingArtwork,
        inquiry: {
          channel: "form",
          destination: inquiryEmail,
          preferredContact: collectorForm.preferredContact,
          budgetRange: collectorForm.budgetRange || undefined,
        },
        customer: {
          name: trimmedName,
          email: trimmedEmail,
          phone: collectorForm.phone.trim() || undefined,
          message: collectorForm.message.trim() || undefined,
        },
        metadata: {
          whatsappNumber: inquiryWhatsAppDisplay,
          action: collectorActionConfig[collectorIntent].label,
        },
      });

      trackLead({
        route: "/",
        page: "gallery",
        source: "collector-form",
        status: leadStatus,
        intent: collectorIntent,
        artwork: trackingArtwork,
        customer: {
          name: trimmedName,
          email: trimmedEmail,
          phone: collectorForm.phone.trim() || undefined,
          preferredContact: collectorForm.preferredContact,
        },
        metadata: {
          budgetRange: collectorForm.budgetRange || undefined,
          requestedAction: collectorActionConfig[collectorIntent].label,
        },
      });

      setSubmissionState({
        status: "success",
        message:
          collectorIntent === "buy_now"
            ? "Purchase intent captured. Hammer HQ can now follow up to reserve the work."
            : collectorIntent === "pay_in_4"
              ? "Financing interest captured. Hammer HQ can now follow up with installment options."
              : "Inquiry captured. Hammer HQ can now follow up with collector details.",
      });
    } catch {
      setSubmissionState({
        status: "error",
        message: "Something interrupted the request. Please try again or use the direct contact links.",
      });
    }
  };

  const handleEmailClick = (artwork: ArtworkRecord) => {
    trackEvent({
      event: "email_click",
      route: "/",
      page: "gallery",
      source: "collector-contact",
      artwork: toTrackingArtwork(artwork),
      metadata: {
        intent: collectorIntent,
        destination: inquiryEmail,
      },
    });
  };

  const handleWhatsAppClick = (artwork: ArtworkRecord) => {
    trackEvent({
      event: "whatsapp_click",
      route: "/",
      page: "gallery",
      source: "collector-contact",
      artwork: toTrackingArtwork(artwork),
      metadata: {
        intent: collectorIntent,
        destination: inquiryWhatsAppDisplay,
      },
    });
  };

  const shouldShowTheWatcherCheckout = selectedArtwork?.id === theWatcherArtworkId;

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
                      onClick={() => openArtwork(artwork)}
                      onMouseEnter={() => handleArtworkHover(artwork)}
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
          onClick={() => closeArtwork("overlay")}
          style={{
            position: "fixed",
            inset: 0,
            background: modalVisible ? "rgba(0, 0, 0, 0.9)" : "rgba(0, 0, 0, 0)",
            backdropFilter: modalVisible ? "blur(10px)" : "blur(0px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            zIndex: 80,
            opacity: modalVisible ? 1 : 0,
            transition: "opacity 220ms ease, background 220ms ease, backdrop-filter 220ms ease",
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "min(1280px, 100%)",
              maxHeight: "calc(100vh - 48px)",
              overflow: "auto",
              background: "#060606",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              boxShadow: "0 40px 120px rgba(0, 0, 0, 0.45)",
              opacity: modalVisible ? 1 : 0,
              transform: modalVisible ? "translateY(0) scale(1)" : "translateY(18px) scale(0.985)",
              transition: "opacity 240ms ease, transform 240ms ease",
            }}
          >
            <div
              className="artwurk-modal-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1.08fr) minmax(360px, 0.92fr)",
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
                  padding: "24px",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "min(80vh, 820px)",
                  }}
                >
                  <Image
                    src={selectedArtwork.image}
                    alt={selectedArtwork.name}
                    fill
                    sizes="(max-width: 900px) 100vw, 58vw"
                    style={{ objectFit: "contain" }}
                  />
                </div>
              </div>

              <div
                style={{
                  padding: "34px 30px 30px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "28px",
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0))",
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
                      {selectedArtwork.name}
                    </h2>
                  </div>

                  <button
                    onClick={() => closeArtwork("close-button")}
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
                      transition: "border-color 180ms ease, background 180ms ease",
                    }}
                  >
                    {"\u00D7"}
                  </button>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
                    gap: "18px",
                    padding: "20px 0 0",
                    borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                  }}
                >
                  <div>
                    <div style={modalMetaStyle}>Price</div>
                    <div
                      style={{
                        marginTop: "8px",
                        fontSize: "28px",
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
                  <div>
                    <div style={modalMetaStyle}>Category</div>
                    <div style={{ marginTop: "8px", fontSize: "18px" }}>
                      {selectedArtwork.category}
                    </div>
                  </div>
                  <div>
                    <div style={modalMetaStyle}>Availability</div>
                    <div style={{ marginTop: "8px", fontSize: "18px", textTransform: "capitalize" }}>
                      {formatStatusLabel(selectedArtwork.status)}
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

                <div
                  style={{
                    borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                    paddingTop: "24px",
                  }}
                >
                  <div style={modalMetaStyle}>Collector Assurance</div>
                  <div style={{ marginTop: "8px" }}>
                    <div style={trustLineStyle}>Original • One of One</div>
                    <div style={trustLineStyle}>Hand-painted acrylic on canvas</div>
                    <div style={trustLineStyle}>Signed by artist</div>
                    <div
                      style={{
                        ...trustLineStyle,
                        borderBottom: "none",
                        paddingBottom: 0,
                      }}
                    >
                      Certificate of authenticity included
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                    paddingTop: "24px",
                  }}
                >
                  <div style={modalMetaStyle}>Collector Actions</div>
                  <div
                    style={{
                      marginTop: "14px",
                      display: "grid",
                      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                      gap: "12px",
                    }}
                  >
                    {(Object.keys(collectorActionConfig) as InquiryIntent[]).map((intent) => {
                      const isActive = collectorIntent === intent;

                      return (
                        <button
                          key={intent}
                          type="button"
                          onClick={() => handleCollectorIntent(intent)}
                          style={{
                            padding: "14px 12px",
                            border: isActive
                              ? "1px solid rgba(212, 175, 55, 0.7)"
                              : "1px solid rgba(255, 255, 255, 0.12)",
                            background: isActive
                              ? "linear-gradient(180deg, rgba(212, 175, 55, 0.18), rgba(212, 175, 55, 0.06))"
                              : "rgba(255, 255, 255, 0.03)",
                            color: "#f7f2e9",
                            cursor: "pointer",
                            fontSize: "11px",
                            fontWeight: 700,
                            letterSpacing: "0.16em",
                            textTransform: "uppercase",
                            transition:
                              "transform 180ms ease, border-color 180ms ease, background 180ms ease, box-shadow 180ms ease",
                            boxShadow: isActive
                              ? "0 18px 40px rgba(0, 0, 0, 0.22)"
                              : "none",
                          }}
                        >
                          {collectorActionConfig[intent].label}
                        </button>
                      );
                    })}
                  </div>
                  <p
                    style={{
                      margin: "14px 0 0",
                      color: "rgba(247, 242, 233, 0.68)",
                      fontSize: "15px",
                      lineHeight: 1.7,
                    }}
                  >
                    {collectorActionConfig[collectorIntent].helper}
                  </p>
                </div>

                {shouldShowTheWatcherCheckout ? (
                  <div
                    style={{
                      borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                      paddingTop: "24px",
                    }}
                  >
                    <div style={modalMetaStyle}>Secure Checkout</div>
                    <div
                      style={{
                        marginTop: "14px",
                        padding: "18px",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        background:
                          "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.015))",
                      }}
                    >
                      <div id={theWatcherPaypalContainerId} />
                    </div>
                  </div>
                ) : null}

                <div
                  style={{
                    borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                    paddingTop: "24px",
                  }}
                >
                  <div style={modalMetaStyle}>Collector Form</div>
                  <form
                    onSubmit={handleCollectorSubmit}
                    style={{
                      marginTop: "16px",
                      display: "grid",
                      gap: "14px",
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                        gap: "12px",
                      }}
                    >
                      <input
                        value={collectorForm.name}
                        onChange={(event) => handleFieldChange("name", event.target.value)}
                        placeholder="Your name"
                        style={fieldStyle}
                      />
                      <input
                        value={collectorForm.email}
                        onChange={(event) => handleFieldChange("email", event.target.value)}
                        placeholder="Email"
                        type="email"
                        style={fieldStyle}
                      />
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                        gap: "12px",
                      }}
                    >
                      <input
                        value={collectorForm.phone}
                        onChange={(event) => handleFieldChange("phone", event.target.value)}
                        placeholder="Phone or WhatsApp"
                        style={fieldStyle}
                      />
                      <select
                        value={collectorForm.preferredContact}
                        onChange={(event) =>
                          handleFieldChange(
                            "preferredContact",
                            event.target.value as CollectorFormState["preferredContact"],
                          )
                        }
                        style={fieldStyle}
                      >
                        <option value="email">Preferred contact: Email</option>
                        <option value="whatsapp">Preferred contact: WhatsApp</option>
                        <option value="phone">Preferred contact: Phone</option>
                      </select>
                    </div>
                    <select
                      value={collectorForm.budgetRange}
                      onChange={(event) => handleFieldChange("budgetRange", event.target.value)}
                      style={fieldStyle}
                    >
                      <option value="">Budget range</option>
                      <option value="Under $1,000">Under $1,000</option>
                      <option value="$1,000 - $2,500">$1,000 - $2,500</option>
                      <option value="$2,500 - $5,000">$2,500 - $5,000</option>
                      <option value="$5,000+">$5,000+</option>
                    </select>
                    <textarea
                      value={collectorForm.message}
                      onChange={(event) => handleFieldChange("message", event.target.value)}
                      placeholder="Tell Hammer HQ what you want to know, purchase, or reserve."
                      rows={4}
                      style={{
                        ...fieldStyle,
                        resize: "vertical",
                      }}
                    />
                    {submissionState.message ? (
                      <div
                        style={{
                          padding: "14px 16px",
                          border:
                            submissionState.status === "error"
                              ? "1px solid rgba(215, 108, 108, 0.35)"
                              : "1px solid rgba(212, 175, 55, 0.28)",
                          background:
                            submissionState.status === "error"
                              ? "rgba(120, 28, 28, 0.16)"
                              : "rgba(212, 175, 55, 0.08)",
                          color: "#f7f2e9",
                          fontSize: "15px",
                          lineHeight: 1.7,
                        }}
                      >
                        {submissionState.message}
                      </div>
                    ) : null}
                    <button
                      type="submit"
                      className="artwurk-inquire-button"
                      disabled={submissionState.status === "submitting"}
                      style={{
                        width: "100%",
                        padding: "16px 20px",
                        border: "1px solid rgba(212, 175, 55, 0.58)",
                        background:
                          "linear-gradient(180deg, rgba(212, 175, 55, 0.16), rgba(212, 175, 55, 0.05))",
                        color: "#faf6ef",
                        cursor: submissionState.status === "submitting" ? "wait" : "pointer",
                        fontSize: "13px",
                        fontWeight: 700,
                        letterSpacing: "0.22em",
                        textTransform: "uppercase",
                        transition:
                          "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease, background 180ms ease",
                        boxShadow: "0 18px 40px rgba(0, 0, 0, 0.25)",
                        opacity: submissionState.status === "submitting" ? 0.7 : 1,
                      }}
                    >
                      {submissionState.status === "submitting"
                        ? "Sending"
                        : collectorActionConfig[collectorIntent].submitLabel}
                    </button>
                  </form>
                </div>

                <div
                  style={{
                    borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                    paddingTop: "24px",
                  }}
                >
                  <div style={modalMetaStyle}>Contact</div>
                  <div
                    style={{
                      marginTop: "12px",
                      display: "grid",
                      gap: "10px",
                    }}
                  >
                    <a
                      href={`mailto:${inquiryEmail}`}
                      onClick={() => handleEmailClick(selectedArtwork)}
                      style={{
                        color: "rgba(247, 242, 233, 0.82)",
                        textDecoration: "none",
                        fontSize: "15px",
                      }}
                    >
                      {inquiryEmail}
                    </a>
                    <a
                      href={buildWhatsAppHref(selectedArtwork, collectorIntent)}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => handleWhatsAppClick(selectedArtwork)}
                      style={{
                        color: "rgba(247, 242, 233, 0.82)",
                        textDecoration: "none",
                        fontSize: "15px",
                      }}
                    >
                      WhatsApp {inquiryWhatsAppLabel}: {inquiryWhatsAppDisplay}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {shouldShowTheWatcherCheckout ? (
        <Script
          id="paypal-hosted-buttons-sdk"
          src={paypalSdkSrc}
          strategy="afterInteractive"
          onReady={() => {
            setPaypalSdkReady(true);
          }}
        />
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

        .artwurk-inquire-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 24px 50px rgba(0, 0, 0, 0.32), 0 0 26px rgba(212, 175, 55, 0.14);
          border-color: rgba(212, 175, 55, 0.82);
          background: linear-gradient(180deg, rgba(212, 175, 55, 0.22), rgba(212, 175, 55, 0.08));
        }

        @media (max-width: 960px) {
          .artwurk-modal-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
