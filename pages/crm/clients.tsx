import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";

import CollectorMenu from "../../components/CollectorMenu";

type ClientRecord = {
  name: string;
  email: string;
  phone?: string;
  status: string;
  source: string;
};

type CampaignState = {
  senderEmail: string;
  subject: string;
  message: string;
  sms: string;
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

const inputStyle: React.CSSProperties = {
  minHeight: "56px",
  width: "100%",
  borderRadius: "20px",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  background: "#0a0a0a",
  padding: "0 16px",
  color: "#f7f2e8",
  outline: "none",
  fontSize: "15px",
  fontFamily: '"Times New Roman", Georgia, serif',
};

const textAreaStyle: React.CSSProperties = {
  ...inputStyle,
  minHeight: "160px",
  paddingTop: "16px",
  paddingBottom: "16px",
  resize: "vertical",
};

const initialCampaign: CampaignState = {
  senderEmail: "hammerhq@outlook.com",
  subject: "Private ARTWURK Release",
  message:
    "Collectors, a new ARTWURK release is now available. Reply for priority access, private pricing, and first-look placement.",
  sms: "ARTWURK update: a new release is live. Reply for priority access.",
};

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: "grid", gap: "10px" }}>
      <span style={{ ...labelStyle, color: "#d4af37" }}>{label}</span>
      {children}
    </label>
  );
}

export default function ClientsCampaignsPage() {
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [campaign, setCampaign] = useState<CampaignState>(initialCampaign);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [sending, setSending] = useState<null | "email" | "sms">(null);

  useEffect(() => {
    const loadClients = async () => {
      try {
        const response = await fetch("/api/clients");

        if (!response.ok) {
          throw new Error("Unable to load clients.");
        }

        const data = (await response.json()) as { clients?: ClientRecord[] };
        setClients(data.clients ?? []);
      } catch {
        setClients([]);
      } finally {
        setLoadingClients(false);
      }
    };

    void loadClients();
  }, []);

  const activeCount = useMemo(() => clients.length, [clients]);

  const handleCampaignChange = (field: keyof CampaignState, value: string) => {
    setCampaign((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSend = async (channel: "email" | "sms") => {
    setSending(channel);
    setStatusMessage(null);

    try {
      const response = await fetch("/api/campaign/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          senderEmail: campaign.senderEmail,
          subject: campaign.subject,
          message: campaign.message,
          sms: campaign.sms,
          audience: "all_clients",
          channel,
        }),
      });

      if (!response.ok) {
        throw new Error("Campaign send failed.");
      }

      setStatusMessage(
        "Campaign queued in the UI. Next step is wiring this screen to a real email provider and SMS provider so it can deliver live blasts from the CRM.",
      );
    } catch (issue) {
      setStatusMessage(
        issue instanceof Error ? issue.message : "Campaign send failed.",
      );
    } finally {
      setSending(null);
    }
  };

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <div
          style={{
            marginBottom: "24px",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <CollectorMenu />
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link
              href="/crm"
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
              Back to CRM
            </Link>
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

        <section style={{ ...panelStyle, padding: "30px 24px" }}>
          <div style={labelStyle}>CRM Page Two</div>
          <h1
            style={{
              margin: "14px 0 0",
              fontSize: "clamp(40px, 7vw, 74px)",
              lineHeight: 0.92,
              letterSpacing: "0.08em",
              fontWeight: 700,
              textTransform: "uppercase",
            }}
          >
            Clients & Campaigns
          </h1>
          <p
            style={{
              margin: "16px 0 0",
              maxWidth: "860px",
              fontSize: "17px",
              lineHeight: 1.8,
              color: "rgba(247, 242, 233, 0.72)",
            }}
          >
            Manage ARTWURK client profiles, subscriber emails, and future promotion outreach
            from one place. This is the campaign side of the CRM where you can prepare email
            blasts and text blasts for your collector base.
          </p>
        </section>

        <div
          style={{
            marginTop: "24px",
            display: "grid",
            gridTemplateColumns: "minmax(0, 0.95fr) minmax(0, 1.05fr)",
            gap: "24px",
          }}
          className="crm-clients-layout"
        >
          <section style={{ ...panelStyle, padding: "24px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "14px",
                flexWrap: "wrap",
              }}
            >
              <div>
                <div style={labelStyle}>Client Directory</div>
                <div
                  style={{
                    marginTop: "8px",
                    fontSize: "28px",
                    fontWeight: 600,
                  }}
                >
                  ARTWURK Members
                </div>
              </div>
              <div
                style={{
                  borderRadius: "999px",
                  border: "1px solid rgba(212, 175, 55, 0.2)",
                  background: "rgba(212, 175, 55, 0.08)",
                  padding: "10px 14px",
                  fontSize: "11px",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "#d4af37",
                }}
              >
                {activeCount} active
              </div>
            </div>

            <div style={{ marginTop: "18px", display: "grid", gap: "14px" }}>
              {loadingClients ? (
                <div style={{ color: "rgba(247, 242, 233, 0.62)" }}>Loading clients...</div>
              ) : null}

              {!loadingClients && !clients.length ? (
                <div style={{ color: "rgba(247, 242, 233, 0.62)" }}>
                  No clients available yet.
                </div>
              ) : null}

              {clients.map((client) => (
                <div
                  key={client.email}
                  style={{
                    borderRadius: "24px",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    background: "#0b0b0b",
                    padding: "20px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: "12px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "20px", fontWeight: 600 }}>{client.name}</div>
                      <div style={{ marginTop: "6px", color: "rgba(247, 242, 233, 0.62)" }}>
                        {client.email}
                      </div>
                      <div style={{ marginTop: "4px", color: "rgba(247, 242, 233, 0.62)" }}>
                        {client.phone}
                      </div>
                    </div>
                    <div
                      style={{
                        borderRadius: "999px",
                        border: "1px solid rgba(212, 175, 55, 0.2)",
                        background: "rgba(212, 175, 55, 0.08)",
                        padding: "10px 14px",
                        fontSize: "11px",
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        color: "#d4af37",
                      }}
                    >
                      {client.status}
                    </div>
                  </div>
                  <div
                    style={{
                      marginTop: "16px",
                      fontSize: "11px",
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: "rgba(247, 242, 233, 0.38)",
                    }}
                  >
                    Source: {client.source}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section style={{ ...panelStyle, padding: "24px" }}>
            <div style={labelStyle}>Broadcast Center</div>
            <h2 style={{ margin: "10px 0 0", fontSize: "28px" }}>Email Blast / Text Blast</h2>
            <p
              style={{
                margin: "12px 0 0",
                maxWidth: "720px",
                fontSize: "14px",
                lineHeight: 1.9,
                color: "rgba(247, 242, 233, 0.68)",
              }}
            >
              This page is set up for one-click campaign sending to all signed-up clients in
              the ARTWURK system. Right now the interface is prepared. The real send action
              still needs a connected email and SMS service on the backend.
            </p>

            <div style={{ marginTop: "22px", display: "grid", gap: "18px" }}>
              <Field label="Sender Email">
                <input
                  value={campaign.senderEmail}
                  onChange={(event) =>
                    handleCampaignChange("senderEmail", event.target.value)
                  }
                  style={inputStyle}
                  placeholder="hammerhq@outlook.com"
                />
              </Field>

              <Field label="Email Subject">
                <input
                  value={campaign.subject}
                  onChange={(event) => handleCampaignChange("subject", event.target.value)}
                  style={inputStyle}
                  placeholder="Private ARTWURK Release"
                />
              </Field>

              <Field label="Email Message">
                <textarea
                  value={campaign.message}
                  onChange={(event) => handleCampaignChange("message", event.target.value)}
                  style={textAreaStyle}
                  placeholder="Write your collector email blast here."
                />
              </Field>

              <Field label="Text Blast Message">
                <textarea
                  value={campaign.sms}
                  onChange={(event) => handleCampaignChange("sms", event.target.value)}
                  style={{ ...textAreaStyle, minHeight: "130px" }}
                  placeholder="Write your SMS blast here."
                />
              </Field>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "14px",
                }}
              >
                <button
                  type="button"
                  onClick={() => void handleSend("email")}
                  style={{
                    minHeight: "58px",
                    border: "1px solid rgba(212, 175, 55, 0.35)",
                    borderRadius: "24px",
                    background: "linear-gradient(to right, #c89d3f, #f0d98c)",
                    padding: "0 24px",
                    color: "#080808",
                    fontSize: "13px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.22em",
                    cursor: sending ? "wait" : "pointer",
                    opacity: sending === "sms" ? 0.7 : 1,
                  }}
                  disabled={Boolean(sending)}
                >
                  {sending === "email" ? "Sending" : "Send To All Emails"}
                </button>
                <button
                  type="button"
                  onClick={() => void handleSend("sms")}
                  style={{
                    minHeight: "58px",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "24px",
                    background: "#0b0b0b",
                    padding: "0 24px",
                    color: "#f7f2e8",
                    fontSize: "13px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.22em",
                    cursor: sending ? "wait" : "pointer",
                    opacity: sending === "email" ? 0.7 : 1,
                  }}
                  disabled={Boolean(sending)}
                >
                  {sending === "sms" ? "Sending" : "Send Text Blast"}
                </button>
              </div>

              {statusMessage ? (
                <div
                  style={{
                    borderRadius: "24px",
                    border: "1px solid rgba(212, 175, 55, 0.2)",
                    background: "rgba(212, 175, 55, 0.08)",
                    padding: "18px 20px",
                    fontSize: "14px",
                    lineHeight: 1.9,
                    color: "rgba(247, 242, 233, 0.76)",
                  }}
                >
                  {statusMessage}
                </div>
              ) : null}
            </div>
          </section>
        </div>

        <footer
          style={{
            marginTop: "32px",
            borderTop: "1px solid rgba(255, 255, 255, 0.06)",
            padding: "24px 8px 0",
            textAlign: "center",
            fontSize: "11px",
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            color: "rgba(247, 242, 233, 0.42)",
          }}
        >
          A Hammer HQ LLC company
        </footer>
      </div>

      <style jsx global>{`
        @media (max-width: 980px) {
          .crm-clients-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
