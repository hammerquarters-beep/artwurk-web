import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";

import {
  clearCrmSnapshot,
  getCrmSnapshot,
} from "../lib/crm-store";
import type {
  ArtwurkEventPayload,
  ArtwurkInquiryPayload,
  ArtwurkLeadPayload,
} from "../lib/tracking";

type CrmSnapshot = {
  events: ArtwurkEventPayload[];
  inquiries: ArtwurkInquiryPayload[];
  leads: ArtwurkLeadPayload[];
};

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at top, rgba(196, 154, 89, 0.16), transparent 24%), #030303",
  color: "#f7f2e9",
  fontFamily: '"Times New Roman", Georgia, serif',
  padding: "28px 16px 48px",
};

const containerStyle: React.CSSProperties = {
  width: "min(1280px, 100%)",
  margin: "0 auto",
};

const panelStyle: React.CSSProperties = {
  border: "1px solid rgba(255, 255, 255, 0.08)",
  background: "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.015))",
};

const labelStyle: React.CSSProperties = {
  fontSize: "11px",
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: "rgba(247, 242, 233, 0.52)",
};

const formatTimestamp = (value?: string) => {
  if (!value) {
    return "Unknown";
  }

  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
};

export default function CrmPage() {
  const [snapshot, setSnapshot] = useState<CrmSnapshot>({
    events: [],
    inquiries: [],
    leads: [],
  });

  const refreshSnapshot = () => {
    setSnapshot(getCrmSnapshot());
  };

  useEffect(() => {
    refreshSnapshot();

    const handleStorage = () => {
      refreshSnapshot();
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const metrics = useMemo(
    () => [
      {
        label: "Events",
        value: snapshot.events.length,
      },
      {
        label: "Inquiries",
        value: snapshot.inquiries.length,
      },
      {
        label: "Leads",
        value: snapshot.leads.length,
      },
      {
        label: "Modal Opens",
        value: snapshot.events.filter((item) => item.event === "modal_open").length,
      },
    ],
    [snapshot],
  );

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <section
          style={{
            ...panelStyle,
            padding: "30px 24px",
          }}
        >
          <div style={labelStyle}>Hammer HQ Internal</div>
          <div
            style={{
              marginTop: "14px",
              display: "flex",
              justifyContent: "space-between",
              gap: "18px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: "clamp(40px, 7vw, 78px)",
                  lineHeight: 0.92,
                  letterSpacing: "0.08em",
                  fontWeight: 700,
                  textTransform: "uppercase",
                }}
              >
                ARTWURK CRM
              </h1>
              <p
                style={{
                  margin: "16px 0 0",
                  maxWidth: "620px",
                  fontSize: "17px",
                  lineHeight: 1.8,
                  color: "rgba(247, 242, 233, 0.72)",
                }}
              >
                A desktop-ready collector dashboard for tracking storefront activity,
                inquiries, and lead signals before your custom CRM backend is fully connected.
              </p>
            </div>

            <div
              style={{
                display: "flex",
                gap: "12px",
                alignItems: "start",
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                onClick={refreshSnapshot}
                style={{
                  padding: "12px 16px",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  background: "rgba(255, 255, 255, 0.03)",
                  color: "#f7f2e9",
                  cursor: "pointer",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  fontSize: "11px",
                }}
              >
                Refresh
              </button>
              <button
                type="button"
                onClick={() => {
                  clearCrmSnapshot();
                  refreshSnapshot();
                }}
                style={{
                  padding: "12px 16px",
                  border: "1px solid rgba(212, 175, 55, 0.28)",
                  background: "rgba(212, 175, 55, 0.06)",
                  color: "#f7f2e9",
                  cursor: "pointer",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  fontSize: "11px",
                }}
              >
                Clear Local Data
              </button>
              <Link
                href="/"
                style={{
                  padding: "12px 16px",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  background: "transparent",
                  color: "#f7f2e9",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  fontSize: "11px",
                  textDecoration: "none",
                }}
              >
                Open Site
              </Link>
            </div>
          </div>
        </section>

        <section
          style={{
            marginTop: "24px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
          }}
        >
          {metrics.map((metric) => (
            <article
              key={metric.label}
              style={{
                ...panelStyle,
                padding: "20px",
              }}
            >
              <div style={labelStyle}>{metric.label}</div>
              <div
                style={{
                  marginTop: "12px",
                  fontSize: "40px",
                  lineHeight: 1,
                  color: "#D4AF37",
                }}
              >
                {metric.value}
              </div>
            </article>
          ))}
        </section>

        <section
          style={{
            marginTop: "24px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "18px",
          }}
        >
          <article style={{ ...panelStyle, padding: "22px" }}>
            <div style={labelStyle}>Recent Inquiries</div>
            <div style={{ marginTop: "18px", display: "grid", gap: "14px" }}>
              {snapshot.inquiries.length ? (
                snapshot.inquiries.map((item) => (
                  <div
                    key={`${item.occurredAt}-${item.artwork.id}`}
                    style={{
                      paddingBottom: "14px",
                      borderBottom: "1px solid rgba(255, 255, 255, 0.07)",
                    }}
                  >
                    <div style={labelStyle}>{formatTimestamp(item.occurredAt)}</div>
                    <div style={{ marginTop: "8px", fontSize: "22px" }}>
                      {item.artwork.name}
                    </div>
                    <div style={{ marginTop: "8px", color: "#D4AF37", fontSize: "18px" }}>
                      {item.artwork.price}
                    </div>
                    <div
                      style={{
                        marginTop: "10px",
                        color: "rgba(247, 242, 233, 0.72)",
                        fontSize: "15px",
                        lineHeight: 1.7,
                      }}
                    >
                      {item.inquiry.channel} to {item.inquiry.destination}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ color: "rgba(247, 242, 233, 0.62)", lineHeight: 1.8 }}>
                  No inquiries captured on this device yet.
                </div>
              )}
            </div>
          </article>

          <article style={{ ...panelStyle, padding: "22px" }}>
            <div style={labelStyle}>Recent Leads</div>
            <div style={{ marginTop: "18px", display: "grid", gap: "14px" }}>
              {snapshot.leads.length ? (
                snapshot.leads.map((item) => (
                  <div
                    key={`${item.occurredAt}-${item.artwork?.id ?? "lead"}`}
                    style={{
                      paddingBottom: "14px",
                      borderBottom: "1px solid rgba(255, 255, 255, 0.07)",
                    }}
                  >
                    <div style={labelStyle}>{formatTimestamp(item.occurredAt)}</div>
                    <div style={{ marginTop: "8px", fontSize: "20px" }}>
                      {item.artwork?.name ?? "General Lead"}
                    </div>
                    <div
                      style={{
                        marginTop: "10px",
                        color: "rgba(247, 242, 233, 0.72)",
                        fontSize: "15px",
                        lineHeight: 1.7,
                      }}
                    >
                      Source: {item.source}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ color: "rgba(247, 242, 233, 0.62)", lineHeight: 1.8 }}>
                  No leads captured on this device yet.
                </div>
              )}
            </div>
          </article>
        </section>

        <section style={{ marginTop: "24px" }}>
          <article style={{ ...panelStyle, padding: "22px" }}>
            <div style={labelStyle}>Event Feed</div>
            <div style={{ marginTop: "18px", display: "grid", gap: "14px" }}>
              {snapshot.events.length ? (
                snapshot.events.map((item) => (
                  <div
                    key={`${item.occurredAt}-${item.event}-${item.artwork?.id ?? "page"}`}
                    style={{
                      paddingBottom: "14px",
                      borderBottom: "1px solid rgba(255, 255, 255, 0.07)",
                      display: "grid",
                      gridTemplateColumns: "minmax(140px, 200px) minmax(200px, 1fr)",
                      gap: "12px",
                    }}
                  >
                    <div style={labelStyle}>{formatTimestamp(item.occurredAt)}</div>
                    <div>
                      <div style={{ fontSize: "18px", textTransform: "capitalize" }}>
                        {item.event.replaceAll("_", " ")}
                      </div>
                      <div
                        style={{
                          marginTop: "6px",
                          color: "rgba(247, 242, 233, 0.72)",
                          fontSize: "15px",
                          lineHeight: 1.7,
                        }}
                      >
                        {item.artwork?.name
                          ? `${item.artwork.name} • ${item.artwork.price}`
                          : `${item.page} • ${item.source}`}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ color: "rgba(247, 242, 233, 0.62)", lineHeight: 1.8 }}>
                  No event data captured on this device yet.
                </div>
              )}
            </div>
          </article>
        </section>
      </div>
    </div>
  );
}
