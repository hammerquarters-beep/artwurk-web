import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";

import { useCart } from "./CartProvider";
import BrandLogo from "./BrandLogo";
import CollectorMenu from "./CollectorMenu";
import { CartIcon, UserIcon } from "./ArtwurkIcons";
import { getSupabaseBrowserClient } from "../lib/supabase-browser";

const publicNavItems = [
  { href: "/appraisal", label: "Art Appraisal" },
  { href: "/contact", label: "Contact Us" },
];

export default function PublicHeader() {
  const { count } = useCart();
  const [customerName, setCustomerName] = useState<string | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      return;
    }

    const applyUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const metadata = session?.user.user_metadata ?? {};
      const firstName = typeof metadata.first_name === "string" ? metadata.first_name : "";
      const lastName = typeof metadata.last_name === "string" ? metadata.last_name : "";
      const displayName =
        typeof metadata.display_name === "string" && metadata.display_name.trim()
          ? metadata.display_name.trim()
          : typeof metadata.name === "string" && metadata.name.trim()
            ? metadata.name.trim()
            : [firstName, lastName].filter(Boolean).join(" ").trim();

      setCustomerName(displayName || session?.user.email?.split("@")[0] || null);
    };

    void applyUser();

    const { data } = supabase.auth.onAuthStateChange(() => {
      void applyUser();
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!accountOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!accountRef.current?.contains(event.target as Node)) {
        setAccountOpen(false);
      }
    };

    window.addEventListener("mousedown", handlePointerDown);
    return () => window.removeEventListener("mousedown", handlePointerDown);
  }, [accountOpen]);

  const handleSignOut = async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase?.auth.signOut();
    setCustomerName(null);
    setAccountOpen(false);
  };

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
          {customerName ? (
            <div ref={accountRef} className="account-menu">
              <button
                type="button"
                className="public-nav-link account-trigger"
                onClick={() => setAccountOpen((current) => !current)}
                aria-expanded={accountOpen}
              >
                <UserIcon className="account-icon" />
                {customerName}
              </button>
              <div className={`account-panel${accountOpen ? " is-open" : ""}`}>
                <Link href="/profile" className="account-link">
                  My Profile
                </Link>
                <Link href="/cart" className="account-link">
                  My Cart
                </Link>
                <button type="button" className="account-link account-button" onClick={handleSignOut}>
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <Link href="/profile" className="public-nav-link">
              Create / Sign In
            </Link>
          )}
        </nav>

        <div className="header-utilities">
          <Link href="/cart" className="cart-link" aria-label={`Open cart with ${count} items`}>
            <CartIcon className="cart-icon" />
            {count ? <span className="cart-count">{count}</span> : null}
          </Link>
          <div className="public-mobile-menu">
            <CollectorMenu align="right" accountLabel={customerName} onSignOut={handleSignOut} />
          </div>
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

        .public-nav-link,
        .cart-link {
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

        .public-nav-link:hover,
        .cart-link:hover {
          transform: translateY(-1px);
          border-color: rgba(212, 175, 55, 0.22);
          background: rgba(255, 255, 255, 0.025);
          color: #f7f2e8;
        }

        .header-utilities {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .cart-link {
          position: relative;
          min-width: 46px;
          justify-content: center;
          padding: 0 12px;
          border-color: rgba(255, 255, 255, 0.08);
          color: #f7f2e8;
        }

        .cart-icon,
        .account-icon {
          width: 18px;
          height: 18px;
        }

        .account-icon {
          margin-right: 8px;
          color: #d4af37;
        }

        .cart-count {
          position: absolute;
          top: -7px;
          right: -7px;
          min-width: 20px;
          height: 20px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          border: 1px solid rgba(0, 0, 0, 0.75);
          background: #d4af37;
          color: #080808;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0;
        }

        .account-menu {
          position: relative;
        }

        .account-trigger {
          cursor: pointer;
          background: transparent;
          font-family: inherit;
        }

        .account-panel {
          position: absolute;
          top: 52px;
          right: 0;
          width: 220px;
          overflow: hidden;
          border-radius: 22px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: linear-gradient(180deg, rgba(12, 12, 12, 0.98), rgba(4, 4, 4, 0.98));
          box-shadow: 0 28px 70px rgba(0, 0, 0, 0.48);
          opacity: 0;
          pointer-events: none;
          transform: translateY(-6px) scale(0.98);
          transition: opacity 180ms ease, transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        .account-panel.is-open {
          opacity: 1;
          pointer-events: auto;
          transform: translateY(0) scale(1);
        }

        .account-link {
          width: 100%;
          min-height: 48px;
          display: flex;
          align-items: center;
          border: 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          background: transparent;
          padding: 0 18px;
          color: rgba(247, 242, 232, 0.84);
          text-decoration: none;
          font-family: inherit;
          font-size: 13px;
          cursor: pointer;
          transition: background 180ms ease, color 180ms ease;
        }

        .account-link:hover {
          background: rgba(255, 255, 255, 0.05);
          color: #f7f2e8;
        }

        .account-button {
          text-align: left;
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

          .cart-link {
            min-height: 48px;
            min-width: 48px;
          }
        }
      `}</style>
    </header>
  );
}
