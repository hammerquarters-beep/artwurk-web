import React, { useState } from "react";
import { useRouter } from "next/router";

import BrandLogo from "../components/BrandLogo";
import { MailIcon, UserIcon } from "../components/ArtwurkIcons";
import PublicHeader from "../components/PublicHeader";
import SiteFooter from "../components/SiteFooter";
import SiteSeo from "../components/SiteSeo";
import { getSupabaseBrowserClient, isBrowserSupabaseConfigured } from "../lib/supabase-browser";
import { trackLead } from "../lib/tracking";

export default function ProfilePage() {
  const router = useRouter();
  const [mode, setMode] = useState<"create" | "signin">("create");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [marketingConsent, setMarketingConsent] = useState(true);
  const [smsConsent, setSmsConsent] = useState(false);
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const getOwnerRedirectPath = () => {
    const next = router.query.next;
    return typeof next === "string" && next.startsWith("/") ? next : "/crm";
  };

  const isOwnerRedirect = router.query.owner === "required";

  const switchMode = (nextMode: "create" | "signin") => {
    setMode(nextMode);
    setSubmitted(false);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const establishOwnerSession = async (accessToken?: string) => {
    if (!accessToken) {
      return false;
    }

    const response = await fetch("/api/auth/owner-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        accessToken,
      }),
    });

    if (!response.ok) {
      return false;
    }

    await router.push(getOwnerRedirectPath());
    return true;
  };

  const buildProfileName = () =>
    displayName.trim() || [firstName.trim(), lastName.trim()].filter(Boolean).join(" ");

  const syncCustomerProfile = async (accessToken?: string, source = "collector-profile") => {
    if (!accessToken) {
      return;
    }

    await fetch("/api/customer/profile", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        displayName: buildProfileName() || undefined,
        phone: phone.trim() || undefined,
        marketingConsent,
        smsConsent,
        source,
      }),
    });
  };

  const sendWelcomeEmail = async (accessToken?: string) => {
    if (!accessToken) {
      return;
    }

    await fetch("/api/customer/welcome", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        displayName: buildProfileName() || undefined,
      }),
    });
  };

  const handleCreateAccount = async () => {
    if (!email || !password) {
      setErrorMessage("Email and password are required to create an account.");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

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
          name: buildProfileName(),
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          display_name: buildProfileName(),
          phone: phone.trim(),
          marketing_consent: marketingConsent,
          sms_consent: smsConsent,
          source: "artwurk_profile",
        },
      },
    });

    if (error) {
      setSubmitting(false);
      setErrorMessage(error.message);
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (await establishOwnerSession(session?.access_token)) {
      return;
    }

    await syncCustomerProfile(session?.access_token, "collector-account-signup");
    await sendWelcomeEmail(session?.access_token);

    trackLead({
      route: "/profile",
      page: "profile",
      source: "collector-account-signup",
      status: "new",
      intent: "general",
      customer: {
        name: buildProfileName(),
        email,
        preferredContact: "email",
      },
      metadata: {
        accessType: "collector-profile-waitlist",
      },
    });

    setSubmitted(true);
    setSuccessMessage(
      "Your collector account request has been submitted. Check your email if confirmation is enabled, and Hammer HQ has been notified through the CRM flow.",
    );
    setSubmitting(false);
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      setErrorMessage("Email and password are required to sign in.");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setSubmitting(false);
      setErrorMessage(
        "Supabase Auth is not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      );
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setSubmitting(false);
      setErrorMessage(error.message);
      return;
    }

    if (await establishOwnerSession(data.session?.access_token)) {
      return;
    }

    await syncCustomerProfile(data.session?.access_token, "collector-signin");

    setSubmitted(true);
    setSuccessMessage(
      "You are signed in as a collector. Owner-only CRM access is limited to the authorized Hammer HQ account.",
    );
    setSubmitting(false);
  };

  return (
    <div className="profile-page">
      <SiteSeo title="Create / Sign In | ARTWURK™" />
      <PublicHeader />
      <div className="profile-shell">
        <section className="profile-hero">
          <div className="profile-logo"><BrandLogo size="profile" /></div>
          <div className="profile-kicker">Collector Access</div>
          <h1>Private Profile</h1>
          <p>
            Create collector access for release priority and personal acquisition support,
            or sign in with an approved Hammer HQ admin account to enter the protected CRM.
          </p>
        </section>

        <div className="profile-panel">
          <div className="profile-panel-kicker">
            {mode === "create" ? "Priority Access" : "Owner Access"}
          </div>
          <div className="profile-panel-title">
            {mode === "create" ? "Create Collector Account" : "Sign In"}
          </div>
          <p className="profile-panel-copy">
            {mode === "create"
              ? "Create your collector profile. Supabase Auth securely manages passwords and account confirmation for the production flow."
              : "Use an approved Hammer HQ admin account to open CRM dashboards, client data, campaigns, and protected analytics."}
          </p>
          {isOwnerRedirect ? (
            <div className="profile-owner-notice">
              Approved admin verification is required before opening the ARTWURK CRM.
            </div>
          ) : null}
          {!isBrowserSupabaseConfigured() ? (
            <div className="profile-config-warning">
              Supabase Auth environment variables are not configured in this deployment yet.
            </div>
          ) : null}

          <div className="profile-mode-switch" aria-label="Profile access type">
            <button
              type="button"
              className={mode === "create" ? "profile-mode-active" : ""}
              onClick={() => switchMode("create")}
            >
              Collector Profile
            </button>
            <button
              type="button"
              className={mode === "signin" ? "profile-mode-active" : ""}
              onClick={() => switchMode("signin")}
            >
              Owner Sign In
            </button>
          </div>

          {!submitted ? (
            <div className="profile-form">
              {mode === "create" ? (
                <div className="profile-name-grid">
                  <div className="profile-input-row">
                    <UserIcon className="profile-icon" />
                    <input
                      value={firstName}
                      onChange={(event) => setFirstName(event.target.value)}
                      placeholder="First name"
                      className="profile-input"
                    />
                  </div>
                  <div className="profile-input-row">
                    <UserIcon className="profile-icon" />
                    <input
                      value={lastName}
                      onChange={(event) => setLastName(event.target.value)}
                      placeholder="Last name"
                      className="profile-input"
                    />
                  </div>
                  <div className="profile-input-row profile-wide-input">
                    <UserIcon className="profile-icon" />
                    <input
                      value={displayName}
                      onChange={(event) => setDisplayName(event.target.value)}
                      placeholder="Display name (optional)"
                      className="profile-input"
                    />
                  </div>
                  <div className="profile-input-row profile-wide-input">
                    <UserIcon className="profile-icon" />
                    <input
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      placeholder="Phone number (optional)"
                      className="profile-input"
                    />
                  </div>
                  <label className="profile-consent profile-wide-input">
                    <input
                      type="checkbox"
                      checked={marketingConsent}
                      onChange={(event) => setMarketingConsent(event.target.checked)}
                    />
                    <span>Email me private releases, collector follow-ups, and ARTWURK updates.</span>
                  </label>
                  <label className="profile-consent profile-wide-input">
                    <input
                      type="checkbox"
                      checked={smsConsent}
                      onChange={(event) => setSmsConsent(event.target.checked)}
                    />
                    <span>
                      I consent to future SMS follow-up. ARTWURK will not text without this consent.
                    </span>
                  </label>
                </div>
              ) : null}
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
                onClick={() => void (mode === "create" ? handleCreateAccount() : handleSignIn())}
                disabled={submitting}
              >
                {submitting
                  ? mode === "create"
                    ? "Creating Account"
                    : "Signing In"
                  : mode === "create"
                    ? "Create Account"
                    : "Sign In"}
              </button>
              <p className="profile-helper">
                {mode === "create"
                  ? "Collector profiles are for private releases, acquisition support, and future saved preferences."
                  : "Only emails approved in CRM_ALLOWED_EMAILS can open CRM routes after sign in."}
              </p>
            </div>
          ) : (
            <div className="profile-success">
              {successMessage}
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
        .profile-error,
        .profile-owner-notice {
          margin-top: 18px;
          border-radius: 18px;
          border: 1px solid rgba(212, 175, 55, 0.22);
          background: rgba(212, 175, 55, 0.07);
          padding: 14px 16px;
          font-size: 14px;
          line-height: 1.7;
          color: rgba(247, 242, 232, 0.78);
        }

        .profile-owner-notice {
          border-color: rgba(212, 175, 55, 0.35);
          background: rgba(212, 175, 55, 0.1);
          color: #f7f2e8;
        }

        .profile-error {
          border-color: rgba(215, 108, 108, 0.35);
          background: rgba(120, 28, 28, 0.16);
        }

        .profile-mode-switch {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
          margin-top: 24px;
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.025);
          padding: 8px;
        }

        .profile-mode-switch button {
          min-height: 48px;
          border: 1px solid transparent;
          border-radius: 14px;
          background: transparent;
          color: rgba(247, 242, 232, 0.62);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          cursor: pointer;
          transition: border-color 0.2s ease, color 0.2s ease, background 0.2s ease;
        }

        .profile-mode-switch button:hover,
        .profile-mode-switch .profile-mode-active {
          border-color: rgba(212, 175, 55, 0.32);
          background: rgba(212, 175, 55, 0.08);
          color: #f7f2e8;
        }

        .profile-form {
          display: grid;
          gap: 14px;
          margin-top: 24px;
        }

        .profile-name-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        .profile-wide-input {
          grid-column: 1 / -1;
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

        .profile-consent {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          border-radius: 18px;
          border: 1px solid rgba(255, 255, 255, 0.09);
          background: rgba(255, 255, 255, 0.025);
          padding: 14px 16px;
          color: rgba(247, 242, 232, 0.72);
          font-size: 13px;
          line-height: 1.6;
        }

        .profile-consent input {
          margin-top: 3px;
          accent-color: #d4af37;
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

        .profile-submit-secondary {
          background: transparent;
          color: #f7f2e8;
        }

        .profile-helper {
          margin: 0;
          font-size: 13px;
          line-height: 1.7;
          color: rgba(247, 242, 232, 0.56);
          text-align: center;
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

          .profile-mode-switch {
            grid-template-columns: 1fr;
          }

          .profile-name-grid {
            grid-template-columns: 1fr;
          }
        }

        .profile-page {
          background:
            radial-gradient(circle at top, rgba(255, 248, 235, 0.68), transparent 28%),
            linear-gradient(180deg, #e7d8bd, #d5bd93 54%, #c7ad82);
          color: #17130f;
        }

        .profile-hero,
        .profile-panel,
        .profile-input-row,
        .profile-consent {
          border-color: rgba(23, 19, 15, 0.1);
          background: rgba(235, 222, 198, 0.72);
          box-shadow: 0 18px 48px rgba(72, 48, 22, 0.08);
        }

        .profile-kicker,
        .profile-panel-kicker {
          color: #75552b;
        }

        .profile-hero p,
        .profile-panel-copy,
        .profile-helper,
        .profile-consent {
          color: rgba(23, 19, 15, 0.68);
        }

        .profile-input {
          color: #17130f;
        }

        .profile-input::placeholder {
          color: rgba(23, 19, 15, 0.38);
        }

        .profile-submit {
          background: #17130f;
          border-color: #17130f;
          color: #eadbc0;
        }
      `}</style>
    </div>
  );
}
