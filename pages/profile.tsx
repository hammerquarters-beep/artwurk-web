import React, { useState } from "react";

import BrandLogo from "../components/BrandLogo";
import { MailIcon, UserIcon } from "../components/ArtwurkIcons";
import PublicHeader from "../components/PublicHeader";
import SiteFooter from "../components/SiteFooter";
import SiteSeo from "../components/SiteSeo";
import { getSupabaseBrowserClient, isBrowserSupabaseConfigured } from "../lib/supabase-browser";
import { trackLead } from "../lib/tracking";

export default function ProfilePage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!email || !password) {
      setErrorMessage("Email and password are required to create an account.");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setSubmitting(false);
      setErrorMessage(
        "Supabase Auth is not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      );
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          source: "artwurk_profile",
        },
      },
    });

    if (error) {
      setSubmitting(false);
      setErrorMessage(error.message);
      return;
    }

    trackLead({
      route: "/profile",
      page: "profile",
      source: "collector-account-signup",
      status: "new",
      intent: "general",
      customer: {
        name,
        email,
        preferredContact: "email",
      },
      metadata: {
        accessType: "collector-profile-waitlist",
      },
    });

    setSubmitted(true);
    setSubmitting(false);
  };

  return (
    <div className="profile-page">
      <SiteSeo title="Create / Sign In | ARTWURK\u2122" />
      <PublicHeader />
      <div className="profile-shell">
        <section className="profile-hero">
          <div className="profile-logo"><BrandLogo size="profile" /></div>
          <div className="profile-kicker">Collector Access</div>
          <h1>Create / Sign In Profile</h1>
          <p>
            Create private ARTWURK collector access for saved preferences, release priority,
            special pricing, and a more personal acquisition experience.
          </p>
        </section>

        <div className="profile-panel">
          <div className="profile-panel-kicker">Priority Access</div>
          <div className="profile-panel-title">Create Collector Account</div>
          <p className="profile-panel-copy">
            Create your collector profile. Supabase Auth securely manages passwords and account
            confirmation for the production flow.
          </p>
          {!isBrowserSupabaseConfigured() ? (
            <div className="profile-config-warning">
              Supabase Auth environment variables are not configured in this deployment yet.
            </div>
          ) : null}

          {!submitted ? (
            <div className="profile-form">
              <div className="profile-input-row">
                <UserIcon className="profile-icon" />
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your name"
                  className="profile-input"
                />
              </div>
              <div className="profile-input-row">
                <MailIcon className="profile-icon" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Enter your email"
                  className="profile-input"
                />
              </div>
              <div className="profile-input-row">
                <UserIcon className="profile-icon" />
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Create a password"
                  className="profile-input"
                />
              </div>
              {errorMessage ? <div className="profile-error">{errorMessage}</div> : null}
              <button
                type="button"
                className="profile-submit"
                onClick={() => void handleSubmit()}
                disabled={submitting}
              >
                {submitting ? "Creating Account" : "Create Account"}
              </button>
            </div>
          ) : (
            <div className="profile-success">
              Your collector account request has been submitted. Check your email if confirmation
              is enabled, and Hammer HQ has been notified through the CRM flow.
            </div>
          )}
        </div>

      </div>
      <SiteFooter />

      <style jsx>{`
        .profile-page {
          min-height: 100vh;
          background: #040404;
          color: #f7f2e8;
          font-family: "Times New Roman", Georgia, serif;
        }

        .profile-shell {
          width: min(980px, 100%);
          margin: 0 auto;
          padding: 32px 16px 40px;
        }

        .profile-hero {
          border-radius: 32px;
          border: 1px solid rgba(212, 175, 55, 0.16);
          background: radial-gradient(circle at top, rgba(212, 175, 55, 0.12), transparent 28%), #070707;
          padding: 42px 30px;
          text-align: center;
        }

        .profile-logo {
          margin-bottom: 24px;
        }

        .profile-kicker,
        .profile-panel-kicker {
          font-size: 11px;
          letter-spacing: 0.26em;
          text-transform: uppercase;
          color: #d4af37;
        }

        .profile-hero h1 {
          margin: 16px 0 0;
          font-size: clamp(2.2rem, 5vw, 4rem);
          line-height: 1;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .profile-hero p {
          max-width: 720px;
          margin: 20px auto 0;
          font-size: 17px;
          line-height: 1.9;
          color: rgba(247, 242, 232, 0.72);
        }

        .profile-panel {
          margin-top: 30px;
          border-radius: 32px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.02);
          padding: 30px 28px;
        }

        .profile-panel-title {
          margin-top: 14px;
          font-size: 30px;
        }

        .profile-panel-copy {
          margin: 14px 0 0;
          font-size: 15px;
          line-height: 1.9;
          color: rgba(247, 242, 232, 0.72);
        }

        .profile-config-warning,
        .profile-error {
          margin-top: 18px;
          border-radius: 18px;
          border: 1px solid rgba(212, 175, 55, 0.22);
          background: rgba(212, 175, 55, 0.07);
          padding: 14px 16px;
          font-size: 14px;
          line-height: 1.7;
          color: rgba(247, 242, 232, 0.78);
        }

        .profile-error {
          border-color: rgba(215, 108, 108, 0.35);
          background: rgba(120, 28, 28, 0.16);
        }

        .profile-form {
          display: grid;
          gap: 14px;
          margin-top: 24px;
        }

        .profile-input-row {
          display: flex;
          align-items: center;
          gap: 12px;
          border-radius: 18px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.03);
          padding: 16px 18px;
          color: #d4af37;
        }

        .profile-icon {
          width: 18px;
          height: 18px;
        }

        .profile-input {
          width: 100%;
          border: none;
          outline: none;
          background: transparent;
          color: #f7f2e8;
          font-size: 15px;
          font-family: "Times New Roman", Georgia, serif;
        }

        .profile-input::placeholder {
          color: rgba(247, 242, 232, 0.3);
        }

        .profile-submit {
          min-height: 58px;
          border: 1px solid rgba(212, 175, 55, 0.4);
          border-radius: 18px;
          background: linear-gradient(to right, #c89d3f, #f0d98c);
          color: #080808;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          cursor: pointer;
        }

        .profile-submit:disabled {
          cursor: wait;
          opacity: 0.72;
        }

        .profile-success {
          margin-top: 22px;
          border-radius: 20px;
          border: 1px solid rgba(212, 175, 55, 0.28);
          background: rgba(212, 175, 55, 0.08);
          padding: 18px 20px;
          font-size: 15px;
          line-height: 1.8;
        }

        @media (max-width: 640px) {
          .profile-shell {
            padding: 22px 14px 32px;
          }

          .profile-hero,
          .profile-panel {
            padding: 24px 20px;
          }
        }
      `}</style>
    </div>
  );
}
