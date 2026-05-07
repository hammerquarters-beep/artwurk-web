import React from "react";

import {
  MailIcon,
  MessageSquareIcon,
  PhoneIcon,
} from "../components/ArtwurkIcons";
import PublicHeader from "../components/PublicHeader";
import SiteFooter from "../components/SiteFooter";
import SiteSeo from "../components/SiteSeo";

const whatsappHref =
  "https://wa.me/12096842964?text=Hello%20Hammer%20HQ%2C%20I%20have%20a%20question%20about%20ARTWURK.";

export default function ContactPage() {
  return (
    <div className="contact-page">
      <SiteSeo title="Contact | ARTWURK™" />
      <PublicHeader />
      <div className="contact-shell">
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

      </div>
      <SiteFooter />

      <style jsx>{`
        .contact-page {
          min-height: 100vh;
          background: #040404;
          color: #f7f2e8;
          font-family: "Times New Roman", Georgia, serif;
        }

        .contact-shell {
          width: min(1180px, 100%);
          margin: 0 auto;
          padding: 32px 16px 40px;
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

        .contact-page {
          background:
            radial-gradient(circle at top, rgba(255, 248, 235, 0.68), transparent 28%),
            linear-gradient(180deg, #e7d8bd, #d5bd93 54%, #c7ad82);
          color: #17130f;
        }

        .contact-hero,
        .contact-card {
          border-color: rgba(23, 19, 15, 0.1);
          background: rgba(235, 222, 198, 0.72);
          box-shadow: 0 18px 48px rgba(72, 48, 22, 0.08);
        }

        .contact-kicker,
        .contact-card-kicker,
        .contact-icon {
          color: #75552b;
        }

        .contact-hero p,
        .contact-card p {
          color: rgba(23, 19, 15, 0.68);
        }

        .contact-card:hover {
          border-color: rgba(23, 19, 15, 0.18);
          box-shadow: 0 30px 70px rgba(72, 48, 22, 0.16);
        }

        @media (max-width: 960px) {
          .contact-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .contact-shell {
            padding: 22px 14px 32px;
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
