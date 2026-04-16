import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";

import type { ArtwurkCrmSnapshot, LeadStatus } from "../lib/crm-types";

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

const statusOptions: LeadStatus[] = [
  "new",
  "contacted",
  "qualified",
  "offer_sent",
  "sold",
  "archived",
];

const emptySnapshot: ArtwurkCrmSnapshot = {
  events: [],
  inquiries: [],
  leads: [],
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

const formatStatusLabel = (status: string) => status.replaceAll("_", " ");

const fetchSnapshot = async (): Promise<ArtwurkCrmSnapshot> => {
  const response = await fetch("/api/crm");

  if (!response.ok) {
    throw new Error("Unable to load CRM snapshot.");
  }

  const data = (await response.json()) as { snapshot?: ArtwurkCrmSnapshot };
  return data.snapshot ?? emptySnapshot;
};

const updateRecordStatus = async (
  route: "/api/inquiries" | "/api/leads",
  id: string,
  status: LeadStatus,
) => {
  const response = await fetch(route, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id,
      status,
    }),
  });

  if (!response.ok) {
    throw new Error("Unable to update record status.");
  }
};

export default function CrmPage() {
  const [snapshot, setSnapshot] = useState<ArtwurkCrmSnapshot>(emptySnapshot);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshSnapshot = async () => {
    setRefreshing(true);
    setError(null);

    try {
      setSnapshot(await fetchSnapshot());
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : "Unable to refresh CRM.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void refreshSnapshot();

    const interval = window.setInterval(() => {
      void refreshSnapshot();
    }, 30000);

    return () => {
      window.clearInterval(interval);
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
        label: "Hot Leads",
        value: snapshot.leads.filter((item) => item.intent === "buy_now").length,
      },
    ],
    [snapshot],
  );

  const pipelineMetrics = useMemo(
    () =>
      statusOptions.map((status) => ({
        label: formatStatusLabel(status),
        value: snapshot.leads.filter((lead) => lead.status === status).length,
      })),
    [snapshot],
  );

  const topArtworks = useMemo(() => {
    const artworkCounts = new Map<
      string,
      {
        label: string;
        views: number;
        inquiries: number;
        leads: number;
      }
    >();

    const ensureArtwork = (id: string, label: string) => {
      if (!artworkCounts.has(id)) {
        artworkCounts.set(id, {
          label,
          views: 0,
          inquiries: 0,
          leads: 0,
        });
      }

      return artworkCounts.get(id)!;
    };

    snapshot.events.forEach((item) => {
      if (!item.artwork?.id) {
        return;
      }

      const entry = ensureArtwork(
        item.artwork.id,
        `${item.artwork.displayId ?? item.artwork.id} - ${item.artwork.name}`,
      );

      if (item.event === "artwork_click" || item.event === "modal_open") {
        entry.views += 1;
      }
    });

    snapshot.inquiries.forEach((item) => {
      const entry = ensureArtwork(
        item.artwork.id,
        `${item.artwork.displayId ?? item.artwork.id} - ${item.artwork.name}`,
      );
      entry.inquiries += 1;
    });

    snapshot.leads.forEach((item) => {
      if (!item.artwork?.id) {
        return;
      }

      const entry = ensureArtwork(
        item.artwork.id,
        `${item.artwork.displayId ?? item.artwork.id} - ${item.artwork.name}`,
      );
      entry.leads += 1;
    });

    return Array.from(artworkCounts.values())
      .sort(
        (left, right) =>
          right.inquiries + right.leads + right.views - (left.inquiries + left.leads + left.views),
      )
      .slice(0, 6);
  }, [snapshot]);

  const sourceMix = useMemo(() => {
    const counts = new Map<string, number>();

    [...snapshot.events, ...snapshot.inquiries, ...snapshot.leads].forEach((item) => {
      const source = item.source || "unknown";
      counts.set(source, (counts.get(source) ?? 0) + 1);
    });

    return Array.from(counts.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((left, right) => right.value - left.value)
      .slice(0, 6);
  }, [snapshot]);

  const purchaseSignals = useMemo(
    () => [
      {
        label: "Buy Now",
        value: snapshot.leads.filter((item) => item.intent === "buy_now").length,
      },
      {
        label: "Pay In 4",
        value: snapshot.leads.filter((item) => item.intent === "pay_in_4").length,
      },
      {
        label: "General Inquiries",
        value: snapshot.inquiries.filter((item) => item.intent === "inquire").length,
      },
    ],
    [snapshot],
  );

  const handleClear = async () => {
    setRefreshing(true);
    setError(null);

    try {
      const response = await fetch("/api/crm", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Unable to clear CRM data.");
      }

      setSnapshot(emptySnapshot);
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : "Unable to clear CRM.");
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (
    route: "/api/inquiries" | "/api/leads",
    id: string,
    status: LeadStatus,
  ) => {
    setRefreshing(true);
    setError(null);

    try {
      await updateRecordStatus(route, id, status);
      await refreshSnapshot();
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : "Unable to update CRM status.");
      setRefreshing(false);
    }
  };

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
                  maxWidth: "720px",
                  fontSize: "17px",
                  lineHeight: 1.8,
                  color: "rgba(247, 242, 233, 0.72)",
                }}
              >
                A collector pipeline dashboard for tracking storefront activity,
                inquiries, high-intent purchase signals, and financing interest as
                ARTWURK scales.
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
                onClick={() => void refreshSnapshot()}
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
                {refreshing ? "Refreshing" : "Refresh"}
              </button>
              <button
                type="button"
                onClick={() => void handleClear()}
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
                Clear Pipeline
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
          {error ? (
            <div
              style={{
                marginTop: "18px",
                padding: "12px 14px",
                border: "1px solid rgba(215, 108, 108, 0.35)",
                background: "rgba(120, 28, 28, 0.16)",
                color: "#f7f2e9",
              }}
            >
              {error}
            </div>
          ) : null}
          {loading ? (
            <div style={{ marginTop: "18px", color: "rgba(247, 242, 233, 0.62)" }}>
              Loading CRM snapshot...
            </div>
          ) : null}
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
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "16px",
          }}
        >
          {pipelineMetrics.map((metric) => (
            <article
              key={metric.label}
              style={{
                ...panelStyle,
                padding: "18px",
              }}
            >
              <div style={labelStyle}>{metric.label}</div>
              <div
                style={{
                  marginTop: "10px",
                  fontSize: "28px",
                  lineHeight: 1,
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
            <div style={labelStyle}>Purchase Signals</div>
            <div style={{ marginTop: "18px", display: "grid", gap: "14px" }}>
              {purchaseSignals.map((signal) => (
                <div
                  key={signal.label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "12px",
                    paddingBottom: "14px",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.07)",
                  }}
                >
                  <div>{signal.label}</div>
                  <div style={{ color: "#D4AF37" }}>{signal.value}</div>
                </div>
              ))}
            </div>
          </article>

          <article style={{ ...panelStyle, padding: "22px" }}>
            <div style={labelStyle}>Top Artwork Signals</div>
            <div style={{ marginTop: "18px", display: "grid", gap: "14px" }}>
              {topArtworks.length ? (
                topArtworks.map((item) => (
                  <div
                    key={item.label}
                    style={{
                      paddingBottom: "14px",
                      borderBottom: "1px solid rgba(255, 255, 255, 0.07)",
                    }}
                  >
                    <div style={{ fontSize: "18px", lineHeight: 1.4 }}>{item.label}</div>
                    <div
                      style={{
                        marginTop: "8px",
                        color: "rgba(247, 242, 233, 0.72)",
                        fontSize: "14px",
                        lineHeight: 1.7,
                      }}
                    >
                      Views {item.views} | Inquiries {item.inquiries} | Leads {item.leads}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ color: "rgba(247, 242, 233, 0.62)", lineHeight: 1.8 }}>
                  No artwork activity captured yet.
                </div>
              )}
            </div>
          </article>

          <article style={{ ...panelStyle, padding: "22px" }}>
            <div style={labelStyle}>Source Mix</div>
            <div style={{ marginTop: "18px", display: "grid", gap: "14px" }}>
              {sourceMix.length ? (
                sourceMix.map((item) => (
                  <div
                    key={item.label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "12px",
                      paddingBottom: "14px",
                      borderBottom: "1px solid rgba(255, 255, 255, 0.07)",
                    }}
                  >
                    <div>{item.label}</div>
                    <div style={{ color: "#D4AF37" }}>{item.value}</div>
                  </div>
                ))
              ) : (
                <div style={{ color: "rgba(247, 242, 233, 0.62)", lineHeight: 1.8 }}>
                  No source attribution captured yet.
                </div>
              )}
            </div>
          </article>
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
                    key={item.id}
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
                      {item.customer?.name || "Unknown collector"} | {item.intent.replaceAll("_", " ")}
                    </div>
                    <select
                      value={item.status}
                      onChange={(event) =>
                        void handleStatusUpdate(
                          "/api/inquiries",
                          item.id,
                          event.target.value as LeadStatus,
                        )
                      }
                      style={{
                        marginTop: "12px",
                        width: "100%",
                        padding: "12px 14px",
                        border: "1px solid rgba(255, 255, 255, 0.12)",
                        background: "rgba(255, 255, 255, 0.03)",
                        color: "#f7f2e9",
                      }}
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {formatStatusLabel(status)}
                        </option>
                      ))}
                    </select>
                  </div>
                ))
              ) : (
                <div style={{ color: "rgba(247, 242, 233, 0.62)", lineHeight: 1.8 }}>
                  No inquiries captured yet.
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
                    key={item.id}
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
                      {item.intent.replaceAll("_", " ")} | {item.customer?.email ?? "No email"}
                    </div>
                    <select
                      value={item.status}
                      onChange={(event) =>
                        void handleStatusUpdate(
                          "/api/leads",
                          item.id,
                          event.target.value as LeadStatus,
                        )
                      }
                      style={{
                        marginTop: "12px",
                        width: "100%",
                        padding: "12px 14px",
                        border: "1px solid rgba(255, 255, 255, 0.12)",
                        background: "rgba(255, 255, 255, 0.03)",
                        color: "#f7f2e9",
                      }}
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {formatStatusLabel(status)}
                        </option>
                      ))}
                    </select>
                  </div>
                ))
              ) : (
                <div style={{ color: "rgba(247, 242, 233, 0.62)", lineHeight: 1.8 }}>
                  No leads captured yet.
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
                    key={item.id}
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
                          ? `${item.artwork.name} | ${item.source}`
                          : `${item.page} | ${item.source}`}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ color: "rgba(247, 242, 233, 0.62)", lineHeight: 1.8 }}>
                  No event data captured yet.
                </div>
              )}
            </div>
          </article>
        </section>
      </div>
    </div>
  );
}
