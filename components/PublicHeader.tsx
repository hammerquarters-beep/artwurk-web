import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";

import { CartIcon, UserIcon } from "./ArtwurkIcons";
import AccountAccessPanel from "./AccountAccessPanel";
import BrandLogo from "./BrandLogo";
import { useCart } from "./CartProvider";
import CollectorMenu from "./CollectorMenu";
import { getCustomerDisplayName, syncCustomerSession } from "../lib/customer-auth-client";
import { getSupabaseBrowserClient } from "../lib/supabase-browser";

const publicNavItems = [
  { href: "/appraisal", label: "Art Appraisal" },
  { href: "/contact", label: "Contact Us" },
];

export default function PublicHeader() {
  const { count } = useCart();
  const [customerName, setCustomerName] = useState<string | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const oauthSyncRef = useRef<string | null>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      return;
    }

    const applyUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const displayName = getCustomerDisplayName(session);

      setCustomerName(displayName || null);

      if (session?.user.id && oauthSyncRef.current !== session.user.id) {
        const provider =
          typeof session.user.app_metadata?.provider === "string"
            ? session.user.app_metadata.provider
            : "email";
        oauthSyncRef.current = session.user.id;
        void syncCustomerSession({
          session,
          source: `collector-${provider}-session`,
          notifyOwner: provider === "google" || provider === "apple",
        });
      }
    };

    void applyUser();

    const { data } = supabase.auth.onAuthStateChange(() => {
      void applyUser();
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

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
          </nav>

          <Link href="/cart" className="cart-link" aria-label={`Open cart with ${count} items`}>
            <CartIcon className="cart-icon" />
            {count ? <span className="cart-count">{count}</span> : null}
          </Link>

          <button
            type="button"
            className="account-icon-link"
            onClick={() => setAccountOpen(true)}
            aria-label={customerName ? `Open account for ${customerName}` : "Open account sign in"}
          >
            <UserIcon className="account-icon" />
            {customerName ? <span className="account-name">{customerName}</span> : null}
          </button>

          <div className="public-menu">
            <CollectorMenu align="right" accountLabel={customerName} onSignOut={handleSignOut} />
          </div>
        </div>
      </div>

      <AccountAccessPanel
        open={accountOpen}
        customerName={customerName}
        onClose={() => setAccountOpen(false)}
        onAuthChanged={async () => {
          const supabase = getSupabaseBrowserClient();
          const {
            data: { session },
          } = supabase ? await supabase.auth.getSession() : { data: { session: null } };

          setCustomerName(getCustomerDisplayName(session) || null);
        }}
      />

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
        .account-icon-link,
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
        .account-icon-link:hover,
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

        .account-icon-link {
          min-width: 48px;
          padding: 0 13px;
          border-color: rgba(23, 19, 15, 0.1);
          background: rgba(239, 226, 201, 0.42);
          cursor: pointer;
          font-family: inherit;
        }

        .cart-icon,
        .account-icon {
          width: 18px;
          height: 18px;
        }

        .account-icon {
          color: #8f6d32;
        }

        .account-name {
          max-width: 112px;
          overflow: hidden;
          margin-left: 8px;
          text-overflow: ellipsis;
          white-space: nowrap;
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

        .public-menu {
          display: block;
        }

        @media (max-width: 840px) {
          .public-header-shell {
            min-height: 74px;
            width: min(100%, calc(100vw - 22px));
          }

          .public-nav {
            display: none;
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
