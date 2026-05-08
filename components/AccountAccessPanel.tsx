import Link from "next/link";
import React, { FormEvent, useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { CloseIcon, MailIcon, UserIcon } from "./ArtwurkIcons";
import BrandLogo from "./BrandLogo";
import { getSupabaseBrowserClient } from "../lib/supabase-browser";
import { syncCustomerSession } from "../lib/customer-auth-client";

type AccountAccessPanelProps = {
  open: boolean;
  customerName?: string | null;
  onClose: () => void;
  onAuthChanged: () => void | Promise<void>;
};

type AuthMode = "signin" | "create";

const getOAuthRedirectUrl = (provider: "google" | "apple") => {
  if (typeof window === "undefined") {
    return undefined;
  }

  return `${window.location.origin}/profile?auth=${provider}`;
};

export default function AccountAccessPanel({
  open,
  customerName,
  onClose,
  onAuthChanged,
}: AccountAccessPanelProps) {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open || typeof document === "undefined") {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  if (!open || !mounted) {
    return null;
  }

  const supabase = getSupabaseBrowserClient();
  const name = displayName.trim() || [firstName.trim(), lastName.trim()].filter(Boolean).join(" ");

  const handleOAuth = async (provider: "google" | "apple") => {
    setErrorMessage(null);

    if (!supabase) {
      setErrorMessage("Supabase Auth is not configured for this deployment.");
      return;
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: getOAuthRedirectUrl(provider),
      },
    });

    if (error) {
      setErrorMessage(error.message);
    }
  };

  const handleEmailPassword = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);
    setStatusMessage(null);

    if (!supabase) {
      setSubmitting(false);
      setErrorMessage("Supabase Auth is not configured for this deployment.");
      return;
    }

    if (!email || !password) {
      setSubmitting(false);
      setErrorMessage("Email and password are required.");
      return;
    }

    const authResult =
      mode === "create"
        ? await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                name,
                first_name: firstName.trim(),
                last_name: lastName.trim(),
                display_name: name,
                marketing_consent: true,
                sms_consent: false,
                source: "header_account_modal",
              },
            },
          })
        : await supabase.auth.signInWithPassword({ email, password });

    if (authResult.error) {
      setSubmitting(false);
      setErrorMessage(authResult.error.message);
      return;
    }

    const session = authResult.data.session ?? (await supabase.auth.getSession()).data.session;
    await syncCustomerSession({
      session,
      source: mode === "create" ? "header-account-signup" : "header-account-signin",
      notifyOwner: mode === "create",
    });

    setSubmitting(false);
    setStatusMessage(
      mode === "create"
        ? "Collector account created. Complete shipping and contact preferences in Update Profile."
        : "Signed in. Your collector profile is ready for private acquisition support.",
    );
    await onAuthChanged();
  };

  const handleMagicLink = async () => {
    setErrorMessage(null);
    setStatusMessage(null);

    if (!supabase) {
      setErrorMessage("Supabase Auth is not configured for this deployment.");
      return;
    }

    if (!email) {
      setErrorMessage("Enter your email first so we know where to send the one-time link.");
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo:
          typeof window === "undefined" ? undefined : `${window.location.origin}/profile?auth=magic`,
      },
    });

    setStatusMessage(error ? null : "One-time login link sent. Check your email to continue.");
    if (error) {
      setErrorMessage(error.message);
    }
  };

  const handlePasswordReset = async () => {
    setErrorMessage(null);
    setStatusMessage(null);

    if (!supabase) {
      setErrorMessage("Supabase Auth is not configured for this deployment.");
      return;
    }

    if (!email) {
      setErrorMessage("Enter your email first so we can send the reset link.");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: typeof window === "undefined" ? undefined : `${window.location.origin}/profile`,
    });

    setStatusMessage(error ? null : "Password reset link sent.");
    if (error) {
      setErrorMessage(error.message);
    }
  };

  const handleSignOut = async () => {
    await supabase?.auth.signOut();
    await onAuthChanged();
    onClose();
  };

  const panel = (
    <div className="account-overlay" role="dialog" aria-modal="true" aria-labelledby="account-title">
      <button type="button" className="account-scrim" aria-label="Close account panel" onClick={onClose} />
      <aside className="account-panel">
        <div className="account-panel-top">
          <BrandLogo size="header" />
          <button type="button" className="account-close" onClick={onClose} aria-label="Close account panel">
            <CloseIcon className="account-close-icon" />
          </button>
        </div>

        {customerName ? (
          <div className="signed-in-view">
            <p className="account-kicker">Collector Session</p>
            <h2 id="account-title">Welcome, {customerName}</h2>
            <p>
              Your collector profile stays connected for cart, checkout, private inquiry, and
              shipping readiness.
            </p>
            <div className="account-actions">
              <Link href="/profile" onClick={onClose}>My Profile</Link>
              <Link href="/profile" onClick={onClose}>Update Profile</Link>
              <Link href="/cart" onClick={onClose}>Go to Cart</Link>
              <Link href="/orders" onClick={onClose}>Order History</Link>
              <button type="button" onClick={() => void handleSignOut()}>Sign Out</button>
            </div>
          </div>
        ) : (
          <>
            <p className="account-kicker">Identification</p>
            <h2 id="account-title">{mode === "signin" ? "I already have an account." : "Create collector access."}</h2>

            <div className="oauth-stack">
              <button type="button" onClick={() => void handleOAuth("google")}>
                <span className="google-mark">G</span>
                Sign In With Google
              </button>
              <button type="button" onClick={() => void handleOAuth("apple")}>
                <span className="apple-mark">A</span>
                Sign In with Apple
              </button>
            </div>

            <div className="account-divider">OR</div>

            <form className="account-form" onSubmit={(event) => void handleEmailPassword(event)}>
              {mode === "create" ? (
                <div className="name-grid">
                  <label>
                    First name
                    <input value={firstName} onChange={(event) => setFirstName(event.target.value)} />
                  </label>
                  <label>
                    Last name
                    <input value={lastName} onChange={(event) => setLastName(event.target.value)} />
                  </label>
                  <label className="wide">
                    Display name
                    <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
                  </label>
                </div>
              ) : null}

              <label>
                Login*
                <span className="field-wrap">
                  <MailIcon className="field-icon" />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                  />
                </span>
              </label>
              <label>
                Password*
                <span className="field-wrap">
                  <UserIcon className="field-icon" />
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete={mode === "create" ? "new-password" : "current-password"}
                  />
                </span>
              </label>

              <div className="account-inline-links">
                <button type="button" onClick={() => void handlePasswordReset()}>Forgot your password?</button>
                <button type="button" onClick={() => void handleMagicLink()}>Email me the one-time link.</button>
              </div>

              {errorMessage ? <div className="account-error">{errorMessage}</div> : null}
              {statusMessage ? <div className="account-status">{statusMessage}</div> : null}

              <button type="submit" className="primary-auth-button" disabled={submitting}>
                {submitting ? "Working" : mode === "create" ? "Create Account" : "Sign In"}
              </button>
            </form>

            <div className="create-switch">
              <h3>{mode === "signin" ? "I do not have an account." : "I already have an account."}</h3>
              <p>
                {mode === "signin"
                  ? "Create an ARTWURK collector profile for cart, private releases, and acquisition support."
                  : "Return to sign in with your existing collector account."}
              </p>
              <button type="button" onClick={() => setMode(mode === "signin" ? "create" : "signin")}>
                {mode === "signin" ? "Create an ARTWURK Account" : "Sign In Instead"}
              </button>
            </div>
          </>
        )}
      </aside>

      <style jsx>{`
        .account-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          justify-content: flex-end;
          isolation: isolate;
        }

        .account-scrim {
          position: absolute;
          inset: 0;
          border: 0;
          background: rgba(17, 16, 14, 0.52);
          cursor: pointer;
        }

        .account-panel {
          position: relative;
          width: min(100%, 650px);
          min-height: 100%;
          overflow-y: auto;
          background: #f7f1e8;
          color: #11100e;
          box-shadow: -40px 0 90px rgba(17, 16, 14, 0.25);
          animation: panel-in 260ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        .account-panel-top {
          min-height: 86px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 22px clamp(22px, 6vw, 58px) 0;
        }

        .account-close {
          width: 44px;
          height: 44px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(17, 16, 14, 0.12);
          border-radius: 999px;
          background: transparent;
          color: #11100e;
          cursor: pointer;
        }

        .account-close-icon,
        .field-icon {
          width: 18px;
          height: 18px;
        }

        .account-kicker,
        .account-divider {
          color: #7b5c2d;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }

        h2,
        h3,
        p {
          margin: 0;
        }

        h2 {
          margin-top: 24px;
          font-size: clamp(1.55rem, 4vw, 2.15rem);
          font-weight: 500;
          letter-spacing: 0.01em;
        }

        .oauth-stack,
        .account-form,
        .signed-in-view,
        .create-switch {
          padding: 26px clamp(22px, 6vw, 58px);
        }

        .oauth-stack {
          display: grid;
          gap: 10px;
          padding-bottom: 18px;
        }

        .oauth-stack button,
        .create-switch button,
        .account-actions a,
        .account-actions button {
          min-height: 54px;
          border: 1px solid #11100e;
          border-radius: 999px;
          background: transparent;
          color: #11100e;
          font-family: inherit;
          font-size: 14px;
          cursor: pointer;
          text-decoration: none;
          transition: transform 180ms ease, background 180ms ease, color 180ms ease;
        }

        .oauth-stack button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }

        .oauth-stack button:hover,
        .create-switch button:hover,
        .account-actions a:hover,
        .account-actions button:hover {
          transform: translateY(-1px);
          background: #11100e;
          color: #f7f1e8;
        }

        .google-mark {
          color: #d94b37;
          font-weight: 900;
        }

        .apple-mark {
          width: 22px;
          height: 22px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          background: #11100e;
          color: #f7f1e8;
          font-size: 13px;
          font-weight: 900;
          line-height: 1;
        }

        .account-divider {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 18px;
          padding: 8px clamp(22px, 6vw, 58px);
        }

        .account-divider::before,
        .account-divider::after {
          content: "";
          height: 1px;
          flex: 1;
          background: rgba(17, 16, 14, 0.14);
        }

        .account-form {
          display: grid;
          gap: 18px;
          border-bottom: 1px solid rgba(17, 16, 14, 0.12);
        }

        .name-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        .wide {
          grid-column: 1 / -1;
        }

        label {
          display: grid;
          gap: 9px;
          font-size: 13px;
          font-weight: 700;
        }

        .field-wrap {
          min-height: 52px;
          display: flex;
          align-items: center;
          gap: 12px;
          border: 1px solid rgba(17, 16, 14, 0.28);
          border-radius: 4px;
          background: #fffaf2;
          padding: 0 14px;
        }

        input {
          width: 100%;
          min-height: 52px;
          border: 1px solid rgba(17, 16, 14, 0.28);
          border-radius: 4px;
          background: #fffaf2;
          padding: 0 14px;
          color: #11100e;
          font: inherit;
          outline: none;
        }

        .field-wrap input {
          min-height: auto;
          border: 0;
          background: transparent;
          padding: 0;
        }

        .account-inline-links {
          display: flex;
          flex-wrap: wrap;
          gap: 12px 18px;
          font-size: 13px;
        }

        .account-inline-links button {
          border: 0;
          background: transparent;
          padding: 0;
          color: #11100e;
          cursor: pointer;
          font: inherit;
          text-decoration: none;
        }

        .account-inline-links button:hover {
          color: #7b5c2d;
        }

        .primary-auth-button {
          min-height: 58px;
          border: 1px solid #11100e;
          border-radius: 999px;
          background: #11100e;
          color: #f7f1e8;
          font: inherit;
          font-weight: 800;
          cursor: pointer;
          transition: transform 180ms ease, opacity 180ms ease;
        }

        .primary-auth-button:hover {
          transform: translateY(-1px);
        }

        .primary-auth-button:disabled {
          opacity: 0.62;
          cursor: wait;
        }

        .account-error,
        .account-status {
          border-radius: 18px;
          padding: 13px 15px;
          font-size: 13px;
          line-height: 1.6;
        }

        .account-error {
          border: 1px solid rgba(154, 52, 52, 0.26);
          background: rgba(154, 52, 52, 0.08);
        }

        .account-status {
          border: 1px solid rgba(123, 92, 45, 0.22);
          background: rgba(123, 92, 45, 0.08);
        }

        .create-switch {
          display: grid;
          gap: 16px;
          background: rgba(17, 16, 14, 0.025);
        }

        .create-switch p,
        .signed-in-view p {
          color: rgba(17, 16, 14, 0.64);
          line-height: 1.8;
        }

        .account-actions {
          display: grid;
          gap: 12px;
          margin-top: 26px;
        }

        .account-actions a,
        .account-actions button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        @keyframes panel-in {
          from {
            opacity: 0;
            transform: translateX(28px);
          }

          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @media (max-width: 640px) {
          .account-overlay {
            align-items: flex-end;
          }

          .account-panel {
            width: 100%;
            min-height: min(92vh, 760px);
            max-height: 92vh;
            border-radius: 30px 30px 0 0;
            box-shadow: 0 -28px 70px rgba(17, 16, 14, 0.28);
            animation-name: sheet-in;
          }

          .name-grid {
            grid-template-columns: 1fr;
          }
        }

        @keyframes sheet-in {
          from {
            opacity: 0;
            transform: translateY(38px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );

  return createPortal(panel, document.body);
}
