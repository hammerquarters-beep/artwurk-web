import React, { useState } from "react";

import BrandLogo from "../components/BrandLogo";
import { MailIcon, UserIcon } from "../components/ArtwurkIcons";
import PublicHeader from "../components/PublicHeader";
import SiteFooter from "../components/SiteFooter";
import SiteSeo from "../components/SiteSeo";
import { trackLead } from "../lib/tracking";

export default function ProfilePage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!email) {
      return;
    }

    trackLead({
      route: "/profile",
      page: "profile",
      source: "collector-profile-interest",
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
            ARTWURK collector accounts are being prepared for saved preferences, private release
            access, special pricing, and a more personal acquisition experience.
          </p>
        </section>

        <div className="profile-panel">
          <div className="profile-panel-kicker">Priority Access</div>
          <div className="profile-panel-title">Join the Collector Waitlist</div>
          <p className="profile-panel-copy">
            Leave your details and Hammer HQ can notify you when collector profile access is ready.
          </p>

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
              <button type="button" className="profile-submit" onClick={handleSubmit}>
                Request Access
              </button>
            </div>
          ) : (
            <div className="profile-success">
              Your collector access request has been recorded. Hammer HQ can now follow up from the CRM.
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
