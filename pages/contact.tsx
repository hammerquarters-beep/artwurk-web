import React from "react";

import CollectorMenu from "../components/CollectorMenu";
import {
  MailIcon,
  MessageSquareIcon,
  PhoneIcon,
} from "../components/ArtwurkIcons";

const whatsappHref =
  "https://wa.me/12096842964?text=Hello%20Hammer%20HQ%2C%20I%20have%20a%20question%20about%20ARTWURK.";

export default function ContactPage() {
  return (
    <div className="contact-page">
      <div className="contact-shell">
        <div className="contact-topbar">
          <CollectorMenu />
          <a href="/" className="contact-back-link">
            Back to Gallery
          </a>
        </div>

        <section className="contact-hero">
          <div className="contact-kicker">Hammer HQ</div>
          <h1>Collector Contact</h1>
          <p>
            Reach out for artwork availability, private acquisition questions, collector support,
            or business inquiries. ARTWURK is built to make direct communication easy.
          </p>
        </section>

        <div className="contact-grid">
          <a href="mailto:hammerhq@outlook.com" className="contact-card">
            <MailIcon className="contact-icon" />
            <div className="contact-card-kicker">Email</div>
            <div className="contact-card-title">hammerhq@outlook.com</div>
            <p>Best for collector questions, invoices, and written inquiry details.</p>
          </a>

          <a href="tel:+12096842964" className="contact-card">
            <PhoneIcon className="contact-icon" />
            <div className="contact-card-kicker">Phone</div>
            <div className="contact-card-title">+1 (209) 684-2964</div>
            <p>Best for direct conversation and fast acquisition follow-up.</p>
          </a>

          <a href={whatsappHref} target="_blank" rel="noreferrer" className="contact-card">
            <MessageSquareIcon className="contact-icon" />
            <div className="contact-card-kicker">WhatsApp HQ</div>
            <div className="contact-card-title">Open WhatsApp</div>
            <p>Best for quick collector messages, availability, and visual follow-up.</p>
          </a>
        </div>

        <footer className="contact-footer">A Hammer HQ LLC company</footer>
      </div>

      <style jsx>{`
        .contact-page {
          min-height: 100vh;
          background: #040404;
          color: #f7f2e8;
          padding: 32px 16px;
          font-family: "Times New Roman", Georgia, serif;
        }

        .contact-shell {
          width: min(1180px, 100%);
          margin: 0 auto;
        }

        .contact-topbar {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 32px;
        }

        .contact-back-link {
          min-height: 48px;
          display: inline-flex;
          align-items: center;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 0 20px;
          text-decoration: none;
          font-size: 11px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(247, 242, 232, 0.85);
        }

        .contact-hero {
          border-radius: 32px;
          border: 1px solid rgba(212, 175, 55, 0.16);
          background: radial-gradient(circle at top, rgba(212, 175, 55, 0.12), transparent 28%), #070707;
          padding: 42px 30px;
          text-align: center;
        }

        .contact-kicker,
        .contact-card-kicker {
          font-size: 11px;
          letter-spacing: 0.26em;
          text-transform: uppercase;
          color: #d4af37;
        }

        .contact-hero h1 {
          margin: 16px 0 0;
          font-size: clamp(2.2rem, 5vw, 4.4rem);
          line-height: 1;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .contact-hero p {
          max-width: 760px;
          margin: 20px auto 0;
          font-size: 17px;
          line-height: 1.9;
          color: rgba(247, 242, 232, 0.72);
        }

        .contact-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 24px;
          margin-top: 30px;
        }

        .contact-card {
          display: block;
          border-radius: 28px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.015));
          padding: 26px 24px;
          text-decoration: none;
          color: inherit;
          transition: transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease;
        }

        .contact-card:hover {
          transform: translateY(-2px);
          border-color: rgba(212, 175, 55, 0.28);
          box-shadow: 0 18px 42px rgba(0, 0, 0, 0.35);
        }

        .contact-icon {
          width: 20px;
          height: 20px;
          color: #d4af37;
        }

        .contact-card-title {
          margin-top: 14px;
          font-size: 24px;
          line-height: 1.2;
        }

        .contact-card p {
          margin: 12px 0 0;
          font-size: 14px;
          line-height: 1.9;
          color: rgba(247, 242, 232, 0.7);
        }

        .contact-footer {
          margin-top: 40px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          padding: 26px 8px 0;
          text-align: center;
          font-size: 11px;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: rgba(247, 242, 232, 0.42);
        }

        @media (max-width: 960px) {
          .contact-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .contact-page {
            padding: 22px 14px;
          }

          .contact-topbar {
            flex-direction: column;
            align-items: flex-start;
          }

          .contact-hero,
          .contact-card {
            padding: 24px 20px;
          }
        }
      `}</style>
    </div>
  );
}
