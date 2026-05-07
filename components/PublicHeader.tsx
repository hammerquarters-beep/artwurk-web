import Link from "next/link";
import React from "react";

import BrandLogo from "./BrandLogo";
import CollectorMenu from "./CollectorMenu";

const publicNavItems = [
  { href: "/appraisal", label: "Art Appraisal" },
  { href: "/contact", label: "Contact Us" },
  { href: "/profile", label: "Create / Sign In" },
];

export default function PublicHeader() {
  return (
    <header className="public-header">
      <div className="public-header-shell">
        <BrandLogo size="header" priority />

        <nav className="public-nav" aria-label="Public ARTWURK navigation">
          {publicNavItems.map((item) => (
            <Link key={item.href} href={item.href} className="public-nav-link">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="public-mobile-menu">
          <CollectorMenu align="right" />
        </div>
      </div>

      <style jsx>{`
        .public-header {
          position: sticky;
          top: 0;
          z-index: 80;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          background: linear-gradient(180deg, rgba(2, 2, 2, 0.96), rgba(2, 2, 2, 0.78));
          backdrop-filter: blur(18px);
        }

        .public-header-shell {
          width: min(1280px, calc(100vw - 32px));
          min-height: 86px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }

        .public-nav {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .public-nav-link {
          min-height: 42px;
          display: inline-flex;
          align-items: center;
          border: 1px solid transparent;
          padding: 0 14px;
          text-decoration: none;
          color: rgba(247, 242, 232, 0.76);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          transition:
            transform 180ms ease,
            border-color 180ms ease,
            color 180ms ease,
            background 180ms ease;
        }

        .public-nav-link:hover {
          transform: translateY(-1px);
          border-color: rgba(212, 175, 55, 0.22);
          background: rgba(255, 255, 255, 0.025);
          color: #f7f2e8;
        }

        .public-mobile-menu {
          display: none;
        }

        @media (max-width: 780px) {
          .public-header-shell {
            min-height: 76px;
            width: min(100%, calc(100vw - 24px));
          }

          .public-nav {
            display: none;
          }

          .public-mobile-menu {
            display: block;
          }
        }
      `}</style>
    </header>
  );
}
