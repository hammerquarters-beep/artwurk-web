import React from "react";

import BrandLogo from "./BrandLogo";

const whatsappHref =
  "https://wa.me/12096842964?text=Hello%20Hammer%20HQ%2C%20I%20have%20a%20question%20about%20ARTWURK.";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-shell">
        <BrandLogo size="footer" />

        <div className="site-footer-copy">
          <div className="site-footer-brand">ARTWURK\u2122</div>
          <div className="site-footer-owner">A Hammer HQ LLC company</div>
        </div>

        <div className="site-footer-contact" aria-label="ARTWURK contact information">
          <a href="mailto:hammerhq@outlook.com">hammerhq@outlook.com</a>
          <a href="tel:+12096842964">+1 (209) 684-2964</a>
          <a href={whatsappHref} target="_blank" rel="noreferrer">
            WhatsApp: Hq
          </a>
        </div>
      </div>

      <style jsx>{`
        .site-footer {
          border-top: 1px solid rgba(212, 175, 55, 0.12);
          background:
            radial-gradient(circle at center top, rgba(212, 175, 55, 0.08), transparent 28%),
            #030303;
          padding: 34px 16px 38px;
        }

        .site-footer-shell {
          width: min(1180px, 100%);
          margin: 0 auto;
          display: grid;
          grid-template-columns: auto minmax(0, 1fr) auto;
          align-items: center;
          gap: 28px;
        }

        .site-footer-brand {
          color: rgba(247, 242, 232, 0.92);
          font-size: 18px;
          letter-spacing: 0.24em;
          text-transform: uppercase;
        }

        .site-footer-owner {
          margin-top: 8px;
          color: rgba(212, 175, 55, 0.72);
          font-size: 11px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
        }

        .site-footer-contact {
          display: grid;
          gap: 8px;
          justify-items: end;
        }

        .site-footer-contact a {
          color: rgba(247, 242, 232, 0.7);
          text-decoration: none;
          font-size: 13px;
          letter-spacing: 0.08em;
          transition: color 180ms ease;
        }

        .site-footer-contact a:hover {
          color: #f7f2e8;
        }

        @media (max-width: 760px) {
          .site-footer-shell {
            grid-template-columns: 1fr;
            justify-items: center;
            text-align: center;
          }

          .site-footer-contact {
            justify-items: center;
          }
        }
      `}</style>
    </footer>
  );
}
