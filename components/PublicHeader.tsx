import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";

import { CartIcon, UserIcon } from "./ArtwurkIcons";
import BrandLogo from "./BrandLogo";
import { useCart } from "./CartProvider";
import CollectorMenu from "./CollectorMenu";
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

        <div className="public-header-right">
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
          border-bottom: 1px solid rgba(34, 25, 16, 0.08);
          background: rgba(230, 216, 190, 0.86);
          backdrop-filter: blur(20px);
        }

        .public-header-shell {
          width: min(1320px, calc(100vw - 28px));
          min-height: 82px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 22px;
        }

        .public-header-right,
        .public-nav {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .public-nav-link,
        .cart-link {
          min-height: 44px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid transparent;
          border-radius: 999px;
          padding: 0 16px;
          color: #17130f;
          text-decoration: none;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          transition:
            transform 180ms ease,
            border-color 180ms ease,
            background 180ms ease,
            box-shadow 180ms ease;
        }

        .public-nav-link:hover,
        .cart-link:hover {
          transform: translateY(-1px);
          border-color: rgba(23, 19, 15, 0.12);
          background: rgba(255, 248, 235, 0.52);
          box-shadow: 0 14px 30px rgba(78, 54, 28, 0.1);
        }

        .cart-link {
          position: relative;
          min-width: 48px;
          padding: 0 13px;
          border-color: rgba(23, 19, 15, 0.1);
          background: rgba(239, 226, 201, 0.42);
        }

        .cart-icon,
        .account-icon {
          width: 18px;
          height: 18px;
        }

        .account-icon {
          margin-right: 8px;
          color: #8f6d32;
        }

        .cart-count {
          position: absolute;
          top: -6px;
          right: -6px;
          min-width: 20px;
          height: 20px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          background: #17130f;
          color: #eadbc0;
          font-size: 10px;
          font-weight: 900;
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
          top: 54px;
          right: 0;
          width: 220px;
          overflow: hidden;
          border-radius: 24px;
          border: 1px solid rgba(23, 19, 15, 0.12);
          background: rgba(236, 224, 201, 0.98);
          box-shadow: 0 28px 70px rgba(63, 42, 20, 0.2);
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
          min-height: 50px;
          display: flex;
          align-items: center;
          border: 0;
          border-bottom: 1px solid rgba(23, 19, 15, 0.08);
          background: transparent;
          padding: 0 18px;
          color: #17130f;
          text-decoration: none;
          font-family: inherit;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: background 180ms ease, padding-left 180ms ease;
        }

        .account-link:hover {
          background: rgba(255, 248, 235, 0.56);
          padding-left: 22px;
        }

        .account-button {
          text-align: left;
        }

        .public-mobile-menu {
          display: none;
        }

        @media (max-width: 840px) {
          .public-header-shell {
            min-height: 74px;
            width: min(100%, calc(100vw - 22px));
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
