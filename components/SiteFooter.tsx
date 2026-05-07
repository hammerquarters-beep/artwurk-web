import Link from "next/link";
import React from "react";

import BrandLogo from "./BrandLogo";

const whatsappHref =
  "https://wa.me/12096842964?text=Hello%20Hammer%20HQ%2C%20I%20have%20a%20question%20about%20ARTWURK.";

const reserveHref =
  "mailto:hammerhq@outlook.com?subject=Private%20ARTWURK%20collector%20inquiry";

const footerColumns = [
  {
    title: "Collector Services",
    links: [
      { label: "View Collection", href: "/" },
      { label: "Art Appraisal", href: "/appraisal" },
      { label: "Private Collector Inquiry", href: reserveHref },
      { label: "Reserve a Piece", href: reserveHref },
      {
        label: "Commission / Custom Inquiry",
        href: "mailto:hammerhq@outlook.com?subject=ARTWURK%20commission%20inquiry",
      },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Contact Us", href: "/contact" },
      { label: "General Questions / FAQ", href: "/faq" },
      { label: "Shipping & Handling", href: "/shipping" },
      { label: "Payment Options", href: "/payment-options" },
      { label: "Returns / Purchase Terms", href: "/purchase-terms" },
    ],
  },
  {
    title: "About",
    links: [
      { label: "About ARTWURK", href: "/about" },
      { label: "Original Artwork", href: "/original-artwork" },
      { label: "Collector Trust", href: "/collector-trust" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
];

const isInternalHref = (href: string) => href.startsWith("/");

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-shell">
        <section className="site-footer-brand-panel" aria-label="ARTWURK brand and contact">
          <BrandLogo size="footer" />

          <div>
            <div className="site-footer-brand">ARTWURK™</div>
            <p className="site-footer-description">
              Luxury original artwork, private collector acquisition, and premium appraisal
              services from Hammer HQ LLC.
            </p>
          </div>

          <div className="site-footer-contact">
            <div>Hammer HQ LLC</div>
            <a href="mailto:hammerhq@outlook.com">hammerhq@outlook.com</a>
            <a href="tel:+12096842964">+1 (209) 684-2964</a>
            <a href={whatsappHref} target="_blank" rel="noreferrer">
              WhatsApp: Hq
            </a>
          </div>
        </section>

        <nav className="site-footer-links" aria-label="ARTWURK footer navigation">
          {footerColumns.map((column) => (
            <div key={column.title} className="site-footer-column">
              <h2>{column.title}</h2>
              <ul>
                {column.links.map((link) => (
                  <li key={`${column.title}-${link.label}`}>
                    {isInternalHref(link.href) ? (
                      <Link href={link.href}>{link.label}</Link>
                    ) : (
                      <a href={link.href}>{link.label}</a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="site-footer-bottom">
          <span>© {new Date().getFullYear()} Hammer HQ LLC. All rights reserved.</span>
          <span>Original works. Private collector availability. Secure acquisition support.</span>
        </div>
      </div>

      <style jsx>{`
        .site-footer {
          border-top: 1px solid rgba(212, 175, 55, 0.14);
          background:
            radial-gradient(circle at center top, rgba(212, 175, 55, 0.1), transparent 30%),
            linear-gradient(180deg, #050505, #020202);
          padding: 42px 14px 28px;
          color: #f7f2e8;
        }

        .site-footer-shell {
          width: min(1240px, 100%);
          margin: 0 auto;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 34px;
          background:
            linear-gradient(180deg, rgba(255, 255, 255, 0.035), rgba(255, 255, 255, 0.012)),
            rgba(5, 5, 5, 0.94);
          box-shadow: 0 30px 90px rgba(0, 0, 0, 0.42);
          overflow: hidden;
        }

        .site-footer-brand-panel {
          display: grid;
          gap: 22px;
          padding: 28px 22px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .site-footer-brand {
          font-size: 22px;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: rgba(247, 242, 232, 0.95);
        }

        .site-footer-description {
          max-width: 560px;
          margin: 14px 0 0;
          color: rgba(247, 242, 232, 0.68);
          font-size: 15px;
          line-height: 1.8;
        }

        .site-footer-contact {
          display: grid;
          gap: 9px;
          color: rgba(212, 175, 55, 0.74);
          font-size: 13px;
          letter-spacing: 0.08em;
        }

        .site-footer-contact a,
        .site-footer-column a {
          color: rgba(247, 242, 232, 0.7);
          text-decoration: none;
          transition: color 180ms ease, padding-left 180ms ease;
        }

        .site-footer-contact a:hover,
        .site-footer-column a:hover {
          color: #f7f2e8;
        }

        .site-footer-links {
          display: grid;
          gap: 0;
        }

        .site-footer-column {
          padding: 24px 22px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.07);
        }

        .site-footer-column h2 {
          margin: 0 0 16px;
          color: #d4af37;
          font-size: 11px;
          letter-spacing: 0.24em;
          text-transform: uppercase;
        }

        .site-footer-column ul {
          list-style: none;
          display: grid;
          gap: 12px;
          margin: 0;
          padding: 0;
        }

        .site-footer-column a {
          display: inline-flex;
          min-height: 30px;
          align-items: center;
          font-size: 14px;
          line-height: 1.45;
        }

        .site-footer-column a:hover {
          padding-left: 4px;
        }

        .site-footer-bottom {
          display: grid;
          gap: 10px;
          padding: 22px;
          color: rgba(247, 242, 232, 0.46);
          font-size: 11px;
          letter-spacing: 0.12em;
          line-height: 1.7;
          text-transform: uppercase;
        }

        @media (min-width: 760px) {
          .site-footer-brand-panel {
            grid-template-columns: auto minmax(0, 1fr) auto;
            align-items: center;
            padding: 32px 30px;
          }

          .site-footer-links {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .site-footer-column {
            border-right: 1px solid rgba(255, 255, 255, 0.07);
            border-bottom: none;
            padding: 30px;
          }

          .site-footer-column:last-child {
            border-right: none;
          }

          .site-footer-bottom {
            grid-template-columns: 1fr auto;
            align-items: center;
            padding: 24px 30px;
            border-top: 1px solid rgba(255, 255, 255, 0.07);
          }
        }
      `}</style>
    </footer>
  );
}
