import Image from "next/image";
import Script from "next/script";
import React, { FormEvent, useEffect, useState } from "react";

import BrandLogo from "../components/BrandLogo";
import PromoPopup from "../components/PromoPopup";
import PublicHeader from "../components/PublicHeader";
import SiteFooter from "../components/SiteFooter";
import SiteSeo from "../components/SiteSeo";
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
  secondary: "The Watcher exists between shadow and intention - unseen, yet undeniable.",
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
};
const theWatcherFrameOptions = [
  { id: "none", name: "Artwork Only", price: 0 },
  { id: "minimal", name: "Minimal Frame", price: 167 },
  { id: "statement", name: "Statement Frame", price: 300 },
  { id: "premium", name: "Gallery Premium Frame", price: 500 },
] as const;

const galleryCardDescriptions: Partial<Record<ArtworkRecord["id"], string>> = {
  "ART-005": "Bold, refined, and quietly commanding.",
  "ART-007": "Raw force shaped into visual presence.",
  "ART-004": "A statement piece built to stop the room.",
  "ART-035": "Quiet elevation with unmistakable presence.",
  "ART-038": "Dark energy, movement, and luxury in one frame.",
  "ART-003": "Stillness, mystery, and quiet authority.",
};

const collectorTrustPoints = [
  "Original works",
  "Private collector inquiries",
  "Secure checkout",
  "Art appraisal services",
  "Hammer HQ LLC",
];

const landingPreviewArtworkIds = ["ART-003", "ART-005", "ART-038"];

const getArtworkTeaser = (artwork: ArtworkRecord) =>
  galleryCardDescriptions[artwork.id] ?? artwork.story;

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
  const [selectedWatcherFrameId, setSelectedWatcherFrameId] = useState("none");
  const [watcherInquiryOpen, setWatcherInquiryOpen] = useState(false);
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
    setSelectedWatcherFrameId("none");
    setWatcherInquiryOpen(false);
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

  const handlePrivateAppraisalClick = () => {
    trackEvent({
      event: "request_private_appraisal_click",
      route: "/",
      page: "landing",
      source: "landing-secondary-cta",
    });
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
    const selectedWatcherFrame =
      artwork.id === theWatcherArtworkId
        ? theWatcherFrameOptions.find((option) => option.id === selectedWatcherFrameId)
        : null;
    const watcherTotal =
      artwork.id === theWatcherArtworkId
        ? theWatcherPricing.basePrice + (selectedWatcherFrame?.price ?? 0)
        : null;
    const actionLabel = collectorActionConfig[intent].label;
    const message = [
      `Hello Hammer HQ, I want to ${actionLabel.toLowerCase()} for ${artwork.name}.`,
      `Artwork ID: ${artwork.displayId ?? artwork.id}`,
      `Price: ${artwork.price}`,
      selectedWatcherFrame ? `Frame: ${selectedWatcherFrame.name}` : "",
      watcherTotal ? `Configured total: $${watcherTotal}` : "",
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
          frame: isTheWatcherSelected ? selectedWatcherFrame.name : undefined,
          framePrice: isTheWatcherSelected ? selectedWatcherFrame.price : undefined,
          configuredTotal: isTheWatcherSelected ? selectedWatcherTotal : undefined,
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
          frame: isTheWatcherSelected ? selectedWatcherFrame.name : undefined,
          framePrice: isTheWatcherSelected ? selectedWatcherFrame.price : undefined,
          configuredTotal: isTheWatcherSelected ? selectedWatcherTotal : undefined,
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

  const buildWatcherInvoiceHref = () => {
    if (!selectedArtwork) {
      return `mailto:${inquiryEmail}`;
    }

    const subject = `Invoice request for ${selectedArtwork.name}`;
    const body = [
      "Hello Hammer HQ,",
      "",
      `I would like to request an invoice for ${selectedArtwork.name}.`,
      `Artwork ID: ${selectedArtwork.displayId ?? selectedArtwork.id}`,
      `Frame selection: ${selectedWatcherFrame.name}`,
      `Configured total: $${selectedWatcherTotal}`,
    ].join("\n");

    return `mailto:${inquiryEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
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
  const selectedWatcherFrame =
    theWatcherFrameOptions.find((option) => option.id === selectedWatcherFrameId) ??
    theWatcherFrameOptions[0];
  const selectedWatcherTotal = theWatcherPricing.basePrice + selectedWatcherFrame.price;
  const watcherTotalRangeLabel = `$${theWatcherPricing.basePrice.toLocaleString()} - $${(
    theWatcherPricing.basePrice + theWatcherFrameOptions[theWatcherFrameOptions.length - 1].price
  ).toLocaleString()}`;
  const orderedArtworks = [
    ...galleryPriorityArtworkIds
      .map((id) => artworks.find((artwork) => artwork.id === id))
      .filter((artwork): artwork is ArtworkRecord => Boolean(artwork)),
    ...artworks.filter((artwork) => !galleryPriorityArtworkIds.includes(artwork.id)),
  ];
  const landingPreviewArtworks = landingPreviewArtworkIds
    .map((id) => artworks.find((artwork) => artwork.id === id))
    .filter((artwork): artwork is ArtworkRecord => Boolean(artwork));
  const flagshipArtwork =
    artworks.find((artwork) => artwork.id === theWatcherArtworkId) ?? landingPreviewArtworks[0];

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
      metadata: {
        frame: selectedWatcherFrame.name,
        framePrice: selectedWatcherFrame.price,
        configuredTotal: selectedWatcherTotal,
      },
    });
  };

  return (
    <div style={pageStyle}>
      <SiteSeo
        title="ARTWURK\u2122 | Luxury Original Artwork"
        description="ARTWURK\u2122 presents luxury original artwork, private collector acquisition, secure checkout, and premium art appraisal services by Hammer HQ LLC."
      />
      <PublicHeader />
      <PromoPopup enabled={showGallery && !selectedArtwork} />

      {!showGallery ? (
        <main className="landing-page" aria-labelledby="landing-title">
          <section className="landing-hero">
            <div className="landing-hero-shell">
              <div className="landing-logo-wrap">
                <BrandLogo size="hero" priority />
              </div>

              <div className="landing-copy">
                <p className="landing-kicker">Private original artwork</p>
                <h1 id="landing-title" className="landing-title">
                  ARTWURK<span>{"\u2122"}</span>
                </h1>
                <p className="landing-subtitle">Original works for collectors who want presence.</p>
                <p className="landing-description">
                  A black-room gallery experience for one-of-one paintings, private acquisition
                  conversations, secure checkout, and premium appraisal services through Hammer HQ LLC.
                </p>
              </div>

              <div className="landing-cta-row" aria-label="Primary ARTWURK actions">
                <button type="button" className="luxury-button primary" onClick={enterCollection}>
                  View Collection
                </button>
                <a
                  href="/appraisal"
                  className="luxury-button secondary"
                  onClick={handlePrivateAppraisalClick}
                >
                  Request Private Appraisal
                </a>
              </div>

              <div className="landing-proof-strip" aria-label="ARTWURK collector trust points">
                {collectorTrustPoints.map((point) => (
                  <span key={point}>{point}</span>
                ))}
              </div>
            </div>
          </section>

          {flagshipArtwork ? (
            <section className="flagship-section" aria-labelledby="featured-work-title">
              <div className="premium-section-heading">
                <p className="landing-kicker">Featured Work</p>
                <h2 id="featured-work-title">The flagship collector piece</h2>
                <p>
                  The Watcher leads the collection with quiet authority, private collector
                  availability, and secure checkout options.
                </p>
              </div>

              <button
                type="button"
                className="flagship-card"
                onClick={() => openArtwork(flagshipArtwork)}
                aria-label={`Open ${flagshipArtwork.name} collector details`}
              >
                <div className="flagship-image">
                  <Image
                    src={flagshipArtwork.image}
                    alt={`${flagshipArtwork.name} original artwork by ARTWURK`}
                    fill
                    priority
                    sizes="(max-width: 760px) 100vw, 48vw"
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <div className="flagship-copy">
                  <span className="artwork-badge">One-of-one original</span>
                  <h3>{flagshipArtwork.name}</h3>
                  <p>{flagshipArtwork.story}</p>
                  <div className="flagship-meta">
                    <span>{flagshipArtwork.dimensions}</span>
                    <span>{flagshipArtwork.price}</span>
                  </div>
                  <span className="reserve-link">Reserve this piece</span>
                </div>
              </button>
            </section>
          ) : null}

          <section className="preview-section" aria-labelledby="preview-title">
            <div className="premium-section-heading compact">
              <p className="landing-kicker">Collector Preview</p>
              <h2 id="preview-title">Original work, direct owner follow-up</h2>
            </div>

            <div className="preview-grid">
              {landingPreviewArtworks.map((artwork) => (
                <button
                  key={artwork.id}
                  type="button"
                  className="preview-card"
                  onClick={() => openArtwork(artwork)}
                  aria-label={`Open ${artwork.name} collector details`}
                >
                  <div className="preview-image">
                    <Image
                      src={artwork.image}
                      alt={`${artwork.name} original artwork preview`}
                      fill
                      loading="lazy"
                      sizes="(max-width: 760px) 100vw, 33vw"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  <div className="preview-copy">
                    <span>{artwork.displayId ?? artwork.id}</span>
                    <h3>{artwork.name}</h3>
                    <p>{getArtworkTeaser(artwork)}</p>
                    <div className="preview-meta">
                      <span>{artwork.dimensions}</span>
                      <strong>{artwork.price}</strong>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </main>
      ) : null}

      {!showGallery ? <SiteFooter /> : null}

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
                <p className="gallery-kicker">Curated original works</p>
                <div className="gallery-logo-mark"><BrandLogo size="profile" /></div>
                <h1 className="gallery-brand">
                  ARTWURK
                  <span className="gallery-brand-mark">{"\u2122"}</span>
                </h1>
                <p className="gallery-description">
                  Explore one-of-one paintings built for private collectors, statement
                  interiors, and direct Hammer HQ acquisition support.
                </p>
                <div className="gallery-hero-actions">
                  <a href="/appraisal" onClick={handlePrivateAppraisalClick}>
                    Request Private Appraisal
                  </a>
                  <a href="/contact">Contact ARTWURK</a>
                </div>
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
                      aria-label={`Open ${artwork.name} artwork details`}
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
                          <div className="gallery-card-topline">
                            <span>{displayId}</span>
                            <span>{formatStatusLabel(artwork.status)}</span>
                          </div>
                          <h2>{artwork.name}</h2>
                          <p>{description}</p>
                          <div className="gallery-card-details">
                            <span>{artwork.dimensions}</span>
                            <strong>{artwork.price}</strong>
                          </div>
                          <div className="gallery-card-cta">
                            {artwork.id === theWatcherArtworkId ? "Secure checkout available" : "Reserve this piece"}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            <SiteFooter />
          </main>
        </div>
      ) : null}

      {selectedArtwork ? (
        <div
          onClick={() => closeArtwork("overlay")}
          className="artwurk-modal-overlay"
          style={{
            position: "fixed",
            inset: 0,
            background: modalVisible ? "rgba(0, 0, 0, 0.9)" : "rgba(0, 0, 0, 0)",
            backdropFilter: modalVisible ? "blur(10px)" : "blur(0px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            zIndex: 140,
            opacity: modalVisible ? 1 : 0,
            transition: "opacity 220ms ease, background 220ms ease, backdrop-filter 220ms ease",
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="artwurk-modal-card"
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
                className="artwurk-modal-art"
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
                className="artwurk-modal-panel"
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

                {!shouldShowTheWatcherCheckout ? (
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
                ) : null}

                {shouldShowTheWatcherCheckout ? (
                  <div
                    style={{
                      borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                      paddingTop: "24px",
                    }}
                  >
                    <div style={modalMetaStyle}>Secure Checkout</div>
                    <div style={{ marginTop: "16px", fontSize: "30px", lineHeight: 1.05 }}>
                      The Watcher
                    </div>
                    <div
                      style={{
                        marginTop: "10px",
                        fontSize: "24px",
                        color: "#d4af37",
                        letterSpacing: "0.04em",
                      }}
                    >
                      ${theWatcherPricing.basePrice.toLocaleString()}
                    </div>
                    <p
                      style={{
                        margin: "14px 0 0",
                        color: "rgba(247, 242, 233, 0.7)",
                        fontSize: "15px",
                        lineHeight: 1.8,
                      }}
                    >
                      A faceless observer with stillness, mystery, and quiet authority.
                    </p>
                    <select
                      value={selectedWatcherFrameId}
                      onChange={(event) => setSelectedWatcherFrameId(event.target.value)}
                      style={{
                        width: "100%",
                        marginTop: "18px",
                        padding: "14px",
                        background: "#111",
                        color: "#fff",
                        border: "1px solid rgba(255,255,255,0.1)",
                        fontSize: "15px",
                        fontFamily: '"Times New Roman", Georgia, serif',
                      }}
                    >
                      {theWatcherFrameOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.name}
                          {option.price > 0 ? ` (+$${option.price})` : ""}
                        </option>
                      ))}
                    </select>
                    <div
                      style={{
                        marginTop: "18px",
                        fontSize: "18px",
                        color: "#d4af37",
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "12px",
                        flexWrap: "wrap",
                      }}
                    >
                      <span>Total: ${selectedWatcherTotal.toLocaleString()}</span>
                      <span style={{ color: "rgba(247, 242, 233, 0.54)", fontSize: "13px" }}>
                        Range: {watcherTotalRangeLabel}
                      </span>
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
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "12px",
                        fontSize: "12px",
                        color: "rgba(247, 242, 233, 0.56)",
                        flexWrap: "wrap",
                      }}
                    >
                      <span>PayPal • Card • Venmo</span>
                      <span>Secure Checkout</span>
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
                          marginTop: "12px",
                          fontSize: "12px",
                          lineHeight: 1.7,
                          color: "rgba(247, 242, 233, 0.52)",
                        }}
                      >
                        Hosted PayPal checkout may reflect the base artwork purchase while custom
                        frame upgrades can be finalized through invoice or direct collector follow-up.
                      </div>
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
                          href={buildWatcherInvoiceHref()}
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
                          Request Invoice
                        </a>
                        <button
                          type="button"
                          onClick={() => setWatcherInquiryOpen((current) => !current)}
                          style={{
                            display: "block",
                            padding: "14px 16px",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            background: "rgba(255, 255, 255, 0.02)",
                            color: "#f7f2e9",
                            textAlign: "center",
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                            fontSize: "11px",
                            cursor: "pointer",
                          }}
                        >
                          {watcherInquiryOpen ? "Hide Collector Inquiry" : "Collector Inquiry"}
                        </button>
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

                {!isTheWatcherSelected || watcherInquiryOpen ? (
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
                ) : null}

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

        @keyframes artwurk-rise {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        * {
          box-sizing: border-box;
        }

        a:focus-visible,
        button:focus-visible,
        input:focus-visible,
        select:focus-visible,
        textarea:focus-visible {
          outline: 2px solid rgba(212, 175, 55, 0.9);
          outline-offset: 4px;
        }

        .landing-page {
          overflow: hidden;
          background:
            radial-gradient(circle at 50% 0%, rgba(212, 175, 55, 0.12), transparent 30%),
            linear-gradient(180deg, #020202 0%, #050505 48%, #020202 100%);
        }

        .landing-hero {
          min-height: calc(100svh - 76px);
          display: flex;
          align-items: center;
          padding: 34px 16px 48px;
        }

        .landing-hero-shell,
        .flagship-section,
        .preview-section {
          width: min(1180px, calc(100vw - 32px));
          margin: 0 auto;
        }

        .landing-hero-shell {
          display: grid;
          justify-items: center;
          gap: 28px;
          text-align: center;
          animation: artwurk-rise 520ms ease both;
        }

        .landing-logo-wrap {
          filter: drop-shadow(0 28px 72px rgba(0, 0, 0, 0.52));
        }

        .landing-copy {
          max-width: 780px;
          display: grid;
          gap: 14px;
          justify-items: center;
        }

        .landing-kicker {
          margin: 0;
          font-size: 11px;
          letter-spacing: 0.34em;
          text-transform: uppercase;
          color: rgba(212, 175, 55, 0.82);
        }

        .landing-title {
          margin: 0;
          font-size: clamp(2.75rem, 14vw, 6.8rem);
          line-height: 0.9;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #fbf7ee;
          text-shadow:
            0 0 16px rgba(212, 175, 55, 0.24),
            0 0 44px rgba(212, 175, 55, 0.12);
        }

        .landing-title span {
          margin-left: 6px;
          vertical-align: top;
          font-size: 0.18em;
          color: rgba(212, 175, 55, 0.78);
        }

        .landing-subtitle {
          margin: 0;
          font-size: clamp(1.12rem, 4.8vw, 1.62rem);
          line-height: 1.35;
          color: rgba(247, 242, 233, 0.92);
        }

        .landing-description {
          max-width: 680px;
          margin: 0;
          font-size: clamp(1rem, 3.8vw, 1.12rem);
          line-height: 1.8;
          color: rgba(247, 242, 233, 0.7);
        }

        .landing-cta-row {
          width: min(100%, 680px);
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }

        .luxury-button {
          min-height: 58px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(212, 175, 55, 0.34);
          border-radius: 999px;
          padding: 0 22px;
          text-decoration: none;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          cursor: pointer;
          transition:
            transform 180ms ease,
            box-shadow 180ms ease,
            border-color 180ms ease,
            background 180ms ease;
        }

        .luxury-button.primary {
          background: linear-gradient(135deg, #d4af37, #f4db83);
          color: #080808;
          box-shadow: 0 18px 48px rgba(212, 175, 55, 0.16);
        }

        .luxury-button.secondary {
          background: rgba(255, 255, 255, 0.035);
          color: #f7f2e9;
        }

        .luxury-button:hover,
        .luxury-button:active {
          transform: translateY(-2px);
          border-color: rgba(212, 175, 55, 0.74);
          box-shadow: 0 22px 54px rgba(0, 0, 0, 0.34), 0 0 28px rgba(212, 175, 55, 0.13);
        }

        .luxury-button:active {
          transform: translateY(0) scale(0.99);
        }

        .landing-proof-strip {
          width: 100%;
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
        }

        .landing-proof-strip span {
          min-height: 44px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.025);
          color: rgba(247, 242, 233, 0.72);
          font-size: 11px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }

        .flagship-section,
        .preview-section {
          padding: 62px 0;
        }

        .premium-section-heading {
          max-width: 760px;
          margin: 0 auto 26px;
          text-align: center;
        }

        .premium-section-heading.compact {
          margin-bottom: 22px;
        }

        .premium-section-heading h2 {
          margin: 14px 0 0;
          font-size: clamp(2rem, 9vw, 4.4rem);
          line-height: 0.95;
          letter-spacing: -0.04em;
          color: #f7f2e9;
        }

        .premium-section-heading p:not(.landing-kicker) {
          margin: 18px auto 0;
          max-width: 640px;
          color: rgba(247, 242, 233, 0.68);
          font-size: 16px;
          line-height: 1.85;
        }

        .flagship-card,
        .preview-card {
          width: 100%;
          appearance: none;
          border: 1px solid rgba(212, 175, 55, 0.18);
          background:
            linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.015)),
            #070707;
          color: inherit;
          text-align: left;
          cursor: pointer;
          overflow: hidden;
          transition:
            transform 220ms ease,
            border-color 220ms ease,
            box-shadow 220ms ease;
        }

        .flagship-card {
          display: grid;
          grid-template-columns: 1fr;
        }

        .flagship-card:hover,
        .preview-card:hover {
          transform: translateY(-4px);
          border-color: rgba(212, 175, 55, 0.42);
          box-shadow: 0 28px 70px rgba(0, 0, 0, 0.45), 0 0 36px rgba(212, 175, 55, 0.1);
        }

        .flagship-card:active,
        .preview-card:active,
        .gallery-card:active {
          transform: scale(0.992);
        }

        .flagship-image,
        .preview-image {
          position: relative;
          overflow: hidden;
          background: #0b0b0b;
        }

        .flagship-image {
          min-height: 360px;
          aspect-ratio: 1 / 1.05;
        }

        .preview-image {
          aspect-ratio: 1 / 1;
        }

        .flagship-image :global(img),
        .preview-image :global(img) {
          transition: transform 520ms ease;
        }

        .flagship-card:hover .flagship-image :global(img),
        .preview-card:hover .preview-image :global(img) {
          transform: scale(1.035);
        }

        .flagship-copy,
        .preview-copy {
          padding: 24px;
        }

        .artwork-badge,
        .preview-copy > span,
        .gallery-card-topline {
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(212, 175, 55, 0.78);
        }

        .flagship-copy h3,
        .preview-copy h3 {
          margin: 14px 0 0;
          font-size: clamp(1.8rem, 8vw, 3.4rem);
          line-height: 0.98;
          color: #f8f3ea;
        }

        .preview-copy h3 {
          font-size: 1.45rem;
          line-height: 1.05;
        }

        .flagship-copy p,
        .preview-copy p {
          margin: 16px 0 0;
          color: rgba(247, 242, 233, 0.68);
          font-size: 15px;
          line-height: 1.75;
        }

        .flagship-meta,
        .preview-meta,
        .gallery-card-details {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          gap: 12px;
          margin-top: 22px;
          color: rgba(247, 242, 233, 0.74);
          font-size: 13px;
          line-height: 1.4;
        }

        .flagship-meta span:last-child,
        .preview-meta strong,
        .gallery-card-details strong {
          color: #d4af37;
          font-weight: 700;
          letter-spacing: 0.05em;
        }

        .reserve-link,
        .gallery-card-cta {
          display: inline-flex;
          margin-top: 22px;
          color: #f7f2e9;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }

        .preview-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }

        .gallery-hero {
          padding: 72px 18px 46px;
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

        .gallery-kicker {
          margin: 0 0 14px;
          font-size: 0.78rem;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: rgba(212, 175, 55, 0.78);
        }

        .gallery-logo-mark {
          margin: 0 auto 24px;
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

        .gallery-hero-actions {
          width: min(100%, 620px);
          margin: 28px auto 0;
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }

        .gallery-hero-actions a {
          min-height: 52px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(212, 175, 55, 0.24);
          background: rgba(255, 255, 255, 0.025);
          color: rgba(247, 242, 233, 0.86);
          text-decoration: none;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          transition: transform 180ms ease, border-color 180ms ease, background 180ms ease;
        }

        .gallery-hero-actions a:hover {
          transform: translateY(-2px);
          border-color: rgba(212, 175, 55, 0.52);
          background: rgba(212, 175, 55, 0.06);
        }

        .gallery-grid-section {
          padding: 28px 16px 72px;
          background: #040404;
        }

        .gallery-grid {
          width: min(1280px, 100%);
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr;
          gap: 18px;
        }

        .gallery-card {
          border: 1px solid rgba(255, 255, 255, 0.08);
          background:
            linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.012)),
            #060606;
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
          transform: translateY(-5px);
          border-color: rgba(212, 175, 55, 0.38);
          box-shadow: 0 24px 54px rgba(0, 0, 0, 0.44), 0 0 30px rgba(212, 175, 55, 0.08);
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
          padding: 20px;
        }

        .gallery-card-topline {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          color: rgba(212, 175, 55, 0.74);
        }

        .gallery-card-meta {
          margin: 0 0 8px;
          font-size: 0.76rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(212, 175, 55, 0.72);
        }

        .gallery-card-copy h2 {
          margin: 12px 0 8px;
          font-size: 1.35rem;
          line-height: 1.05;
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

        .gallery-card-cta {
          color: rgba(247, 242, 233, 0.9);
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

        @media (min-width: 700px) {
          .landing-cta-row,
          .gallery-hero-actions {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .landing-proof-strip {
            grid-template-columns: repeat(5, minmax(0, 1fr));
          }

          .flagship-card {
            grid-template-columns: minmax(0, 1.02fr) minmax(320px, 0.98fr);
            align-items: stretch;
          }

          .flagship-image {
            min-height: 560px;
            aspect-ratio: auto;
          }

          .flagship-copy {
            display: flex;
            flex-direction: column;
            justify-content: center;
            padding: 44px;
          }

          .preview-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 20px;
          }

          .gallery-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (min-width: 981px) {
          .gallery-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 960px) {
          .artwurk-modal-grid {
            grid-template-columns: 1fr !important;
          }

          .artwurk-modal-overlay {
            align-items: flex-start !important;
            padding: 14px !important;
            overflow: auto !important;
          }

          .artwurk-modal-card {
            max-height: none !important;
            overflow: visible !important;
          }

          .artwurk-modal-art {
            min-height: 56vh !important;
            border-right: none !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.06) !important;
            padding: 14px !important;
          }

          .artwurk-modal-panel {
            padding: 24px 18px 28px !important;
          }
        }

        @media (max-width: 640px) {
          .landing-hero-shell,
          .flagship-section,
          .preview-section {
            width: min(100%, calc(100vw - 28px));
          }

          .landing-proof-strip span {
            justify-content: flex-start;
            padding: 0 16px;
          }

          .gallery-hero {
            padding: 68px 18px 42px;
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
