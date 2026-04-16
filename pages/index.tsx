import Image from "next/image";
import Script from "next/script";
import React, { FormEvent, useEffect, useState } from "react";

import CollectorMenu from "../components/CollectorMenu";
import PromoPopup from "../components/PromoPopup";
import { MessageSquareIcon } from "../components/ArtwurkIcons";
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

const theWatcherDescription = {
  primary: "A silent presence that commands attention without identity.",
  secondary: "The Watcher exists between shadow and intention — unseen, yet undeniable.",
};

const theWatcherValuePoints = [
  "Original Painting",
  "One of One",
  "Signed Work",
  "Certificate of Authenticity Included",
  "Secure Shipment from Hammer HQ",
];

const trustBadges = ["PayPal", "Visa", "Mastercard", "Secure Checkout"];
const galleryPriorityArtworkIds = ["ART-005", "ART-007", "ART-004", "ART-035", "ART-038", "ART-003"];
const theWatcherPricing = {
  artwork: "The Watcher",
  basePrice: 1050,
  frame: "premium",
  framePrice: 750,
  total: 1800,
};

const galleryCardDescriptions: Partial<Record<ArtworkRecord["id"], string>> = {
  "ART-005": "Bold, refined, and quietly commanding.",
  "ART-007": "Raw force shaped into visual presence.",
  "ART-004": "A statement piece built to stop the room.",
  "ART-035": "Quiet elevation with unmistakable presence.",
  "ART-038": "Dark energy, movement, and luxury in one frame.",
  "ART-003": "Stillness, mystery, and quiet authority.",
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
  const isTheWatcherSelected = shouldShowTheWatcherCheckout && !!selectedArtwork;
  const orderedArtworks = [
    ...galleryPriorityArtworkIds
      .map((id) => artworks.find((artwork) => artwork.id === id))
      .filter((artwork): artwork is ArtworkRecord => Boolean(artwork)),
    ...artworks.filter((artwork) => !galleryPriorityArtworkIds.includes(artwork.id)),
  ];

  const handleAcquireArtwork = () => {
    if (!selectedArtwork) {
      return;
    }

    setCollectorIntent("buy_now");
    trackEvent({
      event: "buy_now_click",
      route: "/",
      page: "gallery",
      source: "watcher-acquire-button",
      artwork: toTrackingArtwork(selectedArtwork),
    });

    if (typeof window !== "undefined") {
      window.requestAnimationFrame(() => {
        document
          .getElementById("collector-inquiry")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  };

  return (
    <div style={pageStyle}>
      <PromoPopup enabled={showGallery && !selectedArtwork} />

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
          <main>
            <section className="gallery-hero">
              <div className="gallery-hero-inner">
                <div className="gallery-topbar">
                  <CollectorMenu />
                  <a href="/contact" className="gallery-contact-link">
                    <MessageSquareIcon className="gallery-contact-icon" />
                    <span>Contact Us</span>
                  </a>
                </div>
                <p className="gallery-kicker">Curated Original Works</p>
                <h1 className="gallery-brand">
                  ARTWURK
                  <span className="gallery-brand-mark">{"\u2122"}</span>
                </h1>
                <p className="gallery-description">
                  Enter a curated world of bold originals designed to command attention,
                  elevate interiors, and leave a lasting impression. Each piece is created
                  to carry presence, emotion, and collector-level distinction.
                </p>
              </div>
            </section>

            <section className="gallery-grid-section">
              <div className="gallery-grid">
                {orderedArtworks.map((artwork) => {
                  const isMissing = missingImages[artwork.id];
                  const isHovered = hoveredArtworkId === artwork.id;
                  const isFeatured = galleryPriorityArtworkIds.indexOf(artwork.id) < 5;
                  const displayId = artwork.displayId ?? artwork.id;
                  const description = galleryCardDescriptions[artwork.id] ?? artwork.story;

                  return (
                    <button
                      key={artwork.id}
                      type="button"
                      className={`gallery-card${isFeatured ? " featured" : ""}`}
                      onClick={() => openArtwork(artwork)}
                      onMouseEnter={() => handleArtworkHover(artwork)}
                      onMouseLeave={() =>
                        setHoveredArtworkId((current) =>
                          current === artwork.id ? null : current,
                        )
                      }
                    >
                      <div className="gallery-card-link">
                        <div className="gallery-image-wrap">
                          {!isMissing ? (
                            <Image
                              src={artwork.image}
                              alt={`${artwork.name} artwork`}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 980px) 50vw, 33vw"
                              style={{
                                objectFit: "cover",
                                transform: isHovered ? "scale(1.03)" : "scale(1)",
                                transition: "transform 0.4s ease",
                              }}
                              onError={() =>
                                setMissingImages((current) => ({
                                  ...current,
                                  [artwork.id]: true,
                                }))
                              }
                            />
                          ) : (
                            <div className="gallery-image-fallback">
                              <div style={metaLabelStyle}>Image Missing</div>
                              <div>
                                <div style={metaLabelStyle}>{displayId}</div>
                                <div className="gallery-image-fallback-title">{artwork.name}</div>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="gallery-card-copy">
                          <div className="gallery-card-meta">{displayId}</div>
                          <h2>{artwork.name}</h2>
                          <p>{description}</p>
                          <div className="gallery-card-price">{artwork.price}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            <footer className="gallery-footer-note">A Hammer HQ LLC company</footer>
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

                {isTheWatcherSelected ? (
                  <div
                    style={{
                      borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                      paddingTop: "24px",
                    }}
                  >
                    <div style={modalMetaStyle}>Original Artwork</div>
                    <p
                      style={{
                        margin: "16px 0 0",
                        color: "rgba(247, 242, 233, 0.82)",
                        fontSize: "18px",
                        lineHeight: 1.9,
                      }}
                    >
                      {theWatcherDescription.primary}
                      <span style={{ display: "block", marginTop: "8px" }}>
                        {theWatcherDescription.secondary}
                      </span>
                    </p>
                    <div
                      style={{
                        marginTop: "18px",
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "10px",
                      }}
                    >
                      {theWatcherValuePoints.map((point) => (
                        <div
                          key={point}
                          style={{
                            padding: "10px 14px",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            background: "rgba(255, 255, 255, 0.03)",
                            fontSize: "12px",
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            color: "rgba(247, 242, 233, 0.82)",
                          }}
                        >
                          {point}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

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
                        marginTop: "16px",
                        display: "grid",
                        gap: "10px",
                        border: "1px solid rgba(212, 175, 55, 0.18)",
                        background: "rgba(212, 175, 55, 0.05)",
                        padding: "18px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: "16px",
                          fontSize: "15px",
                          color: "rgba(247, 242, 233, 0.78)",
                        }}
                      >
                        <span>Original artwork</span>
                        <span>${theWatcherPricing.basePrice}</span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: "16px",
                          fontSize: "15px",
                          color: "rgba(247, 242, 233, 0.78)",
                        }}
                      >
                        <span>{theWatcherPricing.frame} frame</span>
                        <span>${theWatcherPricing.framePrice}</span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: "16px",
                          paddingTop: "10px",
                          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                          fontSize: "18px",
                          fontWeight: 700,
                          color: "#d4af37",
                          letterSpacing: "0.04em",
                          textTransform: "uppercase",
                        }}
                      >
                        <span>Collector total</span>
                        <span>${theWatcherPricing.total}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAcquireArtwork}
                      className="artwurk-inquire-button"
                      style={{
                        width: "100%",
                        marginTop: "16px",
                        padding: "16px 20px",
                        border: "1px solid rgba(212, 175, 55, 0.58)",
                        background:
                          "linear-gradient(180deg, rgba(212, 175, 55, 0.16), rgba(212, 175, 55, 0.05))",
                        color: "#faf6ef",
                        cursor: "pointer",
                        fontSize: "13px",
                        fontWeight: 700,
                        letterSpacing: "0.22em",
                        textTransform: "uppercase",
                        transition:
                          "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease, background 180ms ease",
                        boxShadow: "0 18px 40px rgba(0, 0, 0, 0.25)",
                      }}
                    >
                      Acquire Artwork
                    </button>
                    <div
                      style={{
                        marginTop: "18px",
                        color: "rgba(247, 242, 233, 0.68)",
                        fontSize: "12px",
                        letterSpacing: "0.16em",
                        textTransform: "uppercase",
                      }}
                    >
                      Preferred payment options
                    </div>
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
                      <div
                        style={{
                          marginTop: "14px",
                          display: "grid",
                          gap: "10px",
                        }}
                      >
                        <a
                          href={buildWhatsAppHref(selectedArtwork, "buy_now")}
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => handleWhatsAppClick(selectedArtwork)}
                          style={{
                            display: "block",
                            padding: "14px 16px",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            background: "rgba(255, 255, 255, 0.02)",
                            textDecoration: "none",
                            color: "#f7f2e9",
                            textAlign: "center",
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                            fontSize: "11px",
                          }}
                        >
                          Pay with Venmo
                        </a>
                        <a
                          href={`mailto:${inquiryEmail}`}
                          onClick={() => handleEmailClick(selectedArtwork)}
                          style={{
                            display: "block",
                            padding: "14px 16px",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            background: "rgba(255, 255, 255, 0.02)",
                            textDecoration: "none",
                            color: "#f7f2e9",
                            textAlign: "center",
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                            fontSize: "11px",
                          }}
                        >
                          Request Card Invoice
                        </a>
                      </div>
                    </div>
                    <div
                      style={{
                        marginTop: "14px",
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "10px",
                      }}
                    >
                      {trustBadges.map((badge) => (
                        <span
                          key={badge}
                          style={{
                            padding: "8px 12px",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            background: "rgba(255, 255, 255, 0.02)",
                            fontSize: "11px",
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                            color: "rgba(247, 242, 233, 0.78)",
                          }}
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div
                  id={isTheWatcherSelected ? "collector-inquiry" : undefined}
                  style={{
                    borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                    paddingTop: "24px",
                    scrollMarginTop: "24px",
                  }}
                >
                  <div style={modalMetaStyle}>
                    {isTheWatcherSelected ? "Collector Inquiry" : "Collector Form"}
                  </div>
                  {isTheWatcherSelected ? (
                    <p
                      style={{
                        margin: "12px 0 0",
                        color: "rgba(247, 242, 233, 0.72)",
                        fontSize: "15px",
                        lineHeight: 1.8,
                      }}
                    >
                      Request availability, private viewing details, or acquisition support
                      directly from Hammer HQ.
                    </p>
                  ) : null}
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

        .gallery-hero {
          padding: 88px 24px 52px;
          background:
            radial-gradient(circle at top, rgba(212, 175, 55, 0.16), transparent 28%),
            #040404;
          border-bottom: 1px solid rgba(212, 175, 55, 0.12);
          text-align: center;
        }

        .gallery-hero-inner {
          max-width: 980px;
          margin: 0 auto;
        }

        .gallery-topbar {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 40px;
        }

        .gallery-contact-link {
          min-height: 48px;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(0, 0, 0, 0.2);
          padding: 0 16px;
          text-decoration: none;
          font-size: 11px;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: rgba(247, 242, 232, 0.8);
          transition: border-color 180ms ease, color 180ms ease;
        }

        .gallery-contact-link:hover {
          border-color: rgba(212, 175, 55, 0.4);
          color: #f7f2e8;
        }

        .gallery-contact-icon {
          width: 16px;
          height: 16px;
          color: #d4af37;
        }

        .gallery-kicker {
          margin: 0 0 14px;
          font-size: 0.78rem;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: rgba(212, 175, 55, 0.78);
        }

        .gallery-brand {
          margin: 0;
          font-size: clamp(3rem, 8vw, 6.4rem);
          line-height: 0.95;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #f7f2e8;
          text-shadow:
            0 0 10px rgba(212, 175, 55, 0.32),
            0 0 22px rgba(212, 175, 55, 0.2),
            0 0 42px rgba(212, 175, 55, 0.14);
        }

        .gallery-brand-mark {
          font-size: 0.2em;
          vertical-align: top;
          margin-left: 8px;
          font-weight: 400;
        }

        .gallery-description {
          max-width: 760px;
          margin: 24px auto 0;
          font-size: 1.08rem;
          line-height: 1.9;
          color: rgba(247, 242, 233, 0.78);
        }

        .gallery-grid-section {
          padding: 42px 24px 72px;
          background: #040404;
        }

        .gallery-grid {
          width: min(1280px, 100%);
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 24px;
        }

        .gallery-card {
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.015));
          overflow: hidden;
          transition: transform 0.28s ease, box-shadow 0.28s ease, border-color 0.28s ease;
          appearance: none;
          width: 100%;
          padding: 0;
          text-align: left;
          color: inherit;
          cursor: pointer;
        }

        .gallery-card:hover {
          transform: translateY(-4px);
          border-color: rgba(212, 175, 55, 0.28);
          box-shadow: 0 18px 38px rgba(0, 0, 0, 0.38);
        }

        .gallery-card.featured {
          border-color: rgba(212, 175, 55, 0.2);
        }

        .gallery-card-link {
          text-decoration: none;
          color: inherit;
          display: block;
        }

        .gallery-image-wrap {
          position: relative;
          background: #0b0b0b;
          aspect-ratio: 1 / 1;
          overflow: hidden;
        }

        .gallery-image-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.4s ease;
        }

        .gallery-card:hover .gallery-image-wrap img {
          transform: scale(1.03);
        }

        .gallery-image-fallback {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 22px;
          color: #f7f2e9;
          background: linear-gradient(160deg, rgba(22, 22, 22, 1), rgba(78, 63, 35, 0.85));
        }

        .gallery-image-fallback-title {
          margin-top: 10px;
          font-size: 30px;
          line-height: 1;
        }

        .gallery-card-copy {
          padding: 18px 18px 20px;
        }

        .gallery-card-meta {
          margin: 0 0 8px;
          font-size: 0.76rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(212, 175, 55, 0.72);
        }

        .gallery-card-copy h2 {
          margin: 0 0 8px;
          font-size: 1.2rem;
          color: #f7f2e8;
        }

        .gallery-card-copy p {
          margin: 0;
          line-height: 1.7;
          color: rgba(247, 242, 233, 0.68);
        }

        .gallery-card-price {
          margin-top: 14px;
          font-size: 1rem;
          letter-spacing: 0.06em;
          color: #d4af37;
        }

        .gallery-footer-note {
          padding: 18px 24px 28px;
          text-align: center;
          font-size: 0.78rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: rgba(247, 242, 233, 0.44);
          background: #040404;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }

        .artwurk-inquire-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 24px 50px rgba(0, 0, 0, 0.32), 0 0 26px rgba(212, 175, 55, 0.14);
          border-color: rgba(212, 175, 55, 0.82);
          background: linear-gradient(180deg, rgba(212, 175, 55, 0.22), rgba(212, 175, 55, 0.08));
        }

        @media (max-width: 980px) {
          .gallery-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 960px) {
          .artwurk-modal-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 640px) {
          .gallery-hero {
            padding: 68px 18px 42px;
          }

          .gallery-topbar {
            flex-direction: column;
            align-items: flex-start;
            margin-bottom: 28px;
          }

          .gallery-grid-section {
            padding: 28px 16px 56px;
          }

          .gallery-grid {
            grid-template-columns: 1fr;
            gap: 18px;
          }

          .gallery-description {
            font-size: 1rem;
            line-height: 1.8;
          }
        }
      `}</style>
    </div>
  );
}
