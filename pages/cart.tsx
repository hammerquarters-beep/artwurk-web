import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";

import PublicHeader from "../components/PublicHeader";
import SiteFooter from "../components/SiteFooter";
import SiteSeo from "../components/SiteSeo";
import { useCart } from "../components/CartProvider";
import { getSupabaseBrowserClient } from "../lib/supabase-browser";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);

export default function CartPage() {
  const { items, subtotal, removeItem, startCheckout, ready } = useCart();
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null);
  const [collectorProfile, setCollectorProfile] = useState<Record<string, any> | null>(null);

  const hasDirectCheckout = useMemo(
    () => items.some((item) => item.artworkId === "ART-003"),
    [items],
  );

  const handleCheckout = async () => {
    await startCheckout();
    setCheckoutMessage(
      hasDirectCheckout
        ? "Checkout intent saved. Open The Watcher from the collection to complete secure PayPal checkout or request invoice support."
        : "Checkout intent saved. Hammer HQ can follow up with availability, invoice, and reservation details.",
    );
  };

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      return;
    }

    const loadCollectorProfile = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        return;
      }

      const response = await fetch("/api/customer/profile", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const body = await response.json();
        setCollectorProfile(body.collector ?? null);
      }
    };

    void loadCollectorProfile();
  }, []);

  const hasShippingProfile = Boolean(
    collectorProfile?.shippingAddress &&
      collectorProfile?.shippingCity &&
      collectorProfile?.shippingState &&
      collectorProfile?.shippingZip,
  );

  return (
    <div className="cart-page">
      <SiteSeo
        title="Collector Cart | ARTWURK™"
        description="Review selected ARTWURK original artwork, reserve pieces, and request private collector checkout support."
      />
      <PublicHeader />

      <main className="cart-shell" aria-labelledby="cart-title">
        <section className="cart-hero">
          <p className="cart-kicker">Private Collector Cart</p>
          <h1 id="cart-title">Review Your Selected Works</h1>
          <p>
            One-of-one artwork deserves a quieter checkout experience. Save original pieces,
            request reservation support, and continue acquisition directly with Hammer HQ.
          </p>
        </section>

        <section className="cart-layout" aria-label="ARTWURK cart">
          <div className="cart-items-panel">
            {!ready ? (
              <div className="empty-cart">Preparing your collector cart.</div>
            ) : items.length ? (
              items.map((item) => (
                <article key={item.artworkId} className="cart-item">
                  <div className="cart-image">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={`${item.title} original artwork`}
                        fill
                        sizes="(max-width: 680px) 96px, 140px"
                        style={{ objectFit: "cover" }}
                      />
                    ) : null}
                  </div>
                  <div className="cart-copy">
                    <div className="cart-id">{item.displayId ?? item.artworkId}</div>
                    <h2>{item.title}</h2>
                    <p>{item.dimensions ?? "Dimensions available on request"}</p>
                    <div className="cart-availability">Original • One of One • Quantity 1</div>
                  </div>
                  <div className="cart-price-block">
                    <div className="cart-price">{item.priceLabel}</div>
                    <button type="button" onClick={() => void removeItem(item.artworkId)}>
                      Remove
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <div className="empty-cart">
                <h2>Your cart is ready for its first piece.</h2>
                <p>
                  Return to the collection and save artwork for reservation, checkout, or private
                  acquisition support.
                </p>
                <Link href="/" className="cart-link-button">
                  View Collection
                </Link>
              </div>
            )}
          </div>

          <aside className="cart-summary">
            <p className="cart-kicker">Acquisition Summary</p>
            <div className="summary-row">
              <span>Selected originals</span>
              <strong>{items.length}</strong>
            </div>
            <div className="summary-row">
              <span>Subtotal</span>
              <strong>{formatCurrency(subtotal)}</strong>
            </div>
            <p className="summary-copy">
              Pricing reflects listed artwork values. Framing, delivery, and private invoice terms
              can be finalized directly with Hammer HQ before acquisition.
            </p>
            {collectorProfile ? (
              <div className="profile-readiness">
                <span>Collector profile</span>
                <strong>{hasShippingProfile ? "Shipping ready" : "Shipping details recommended"}</strong>
                <p>
                  {hasShippingProfile
                    ? `${collectorProfile.shippingCity}, ${collectorProfile.shippingState} is saved for future processing.`
                    : "Add shipping details in My Profile before checkout to move acquisition support faster."}
                </p>
                {!hasShippingProfile ? (
                  <Link href="/profile" className="profile-readiness-link">
                    Update Profile
                  </Link>
                ) : null}
              </div>
            ) : null}
            <button
              type="button"
              className="checkout-button"
              onClick={() => void handleCheckout()}
              disabled={!items.length}
            >
              Start Checkout
            </button>
            <Link href="/contact" className="reserve-button">
              Request Collector Inquiry
            </Link>
            <Link href="/appraisal" className="appraisal-link">
              Request Private Appraisal
            </Link>
            {checkoutMessage ? <div className="checkout-message">{checkoutMessage}</div> : null}
          </aside>
        </section>
      </main>

      <SiteFooter />

      <style jsx>{`
        .cart-page {
          min-height: 100vh;
          background: #ffffff;
          color: #17130f;
          font-family: "Times New Roman", Georgia, serif;
        }

        .cart-shell {
          width: min(1180px, calc(100vw - 28px));
          margin: 0 auto;
          padding: 42px 0 72px;
        }

        .cart-hero {
          border-radius: 34px;
          border: 1px solid rgba(212, 175, 55, 0.16);
          background: linear-gradient(180deg, rgba(255,255,255,0.035), rgba(255,255,255,0.012));
          padding: clamp(28px, 6vw, 58px);
          text-align: center;
        }

        .cart-kicker,
        .cart-id {
          margin: 0;
          font-size: 11px;
          letter-spacing: 0.26em;
          text-transform: uppercase;
          color: #d4af37;
        }

        .cart-hero h1 {
          margin: 16px 0 0;
          font-size: clamp(2.4rem, 7vw, 5.6rem);
          line-height: 0.96;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .cart-hero p,
        .summary-copy {
          max-width: 720px;
          margin: 22px auto 0;
          font-size: 16px;
          line-height: 1.9;
          color: rgba(247, 242, 232, 0.72);
        }

        .cart-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 380px;
          gap: 24px;
          margin-top: 26px;
        }

        .cart-items-panel,
        .cart-summary,
        .empty-cart {
          border-radius: 30px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.02);
        }

        .cart-items-panel {
          display: grid;
          gap: 14px;
          padding: 16px;
        }

        .cart-item {
          display: grid;
          grid-template-columns: 140px minmax(0, 1fr) minmax(140px, auto);
          gap: 20px;
          align-items: center;
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01));
          padding: 14px;
          transition: border-color 180ms ease, transform 180ms ease, box-shadow 180ms ease;
        }

        .cart-item:hover {
          transform: translateY(-2px);
          border-color: rgba(212, 175, 55, 0.24);
          box-shadow: 0 24px 55px rgba(0, 0, 0, 0.28);
        }

        .cart-image {
          position: relative;
          aspect-ratio: 1 / 1;
          overflow: hidden;
          border-radius: 18px;
          background: #0d0d0d;
        }

        .cart-copy h2 {
          margin: 9px 0 0;
          font-size: 28px;
          line-height: 1;
        }

        .cart-copy p {
          margin: 12px 0 0;
          color: rgba(247, 242, 232, 0.7);
        }

        .cart-availability {
          margin-top: 14px;
          color: rgba(247, 242, 232, 0.5);
          font-size: 12px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        .cart-price-block {
          display: grid;
          justify-items: end;
          gap: 14px;
        }

        .cart-price {
          color: #d4af37;
          font-size: 22px;
        }

        .cart-price-block button {
          min-height: 42px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 999px;
          background: transparent;
          padding: 0 18px;
          color: rgba(247, 242, 232, 0.74);
          cursor: pointer;
          font-family: inherit;
          transition: border-color 180ms ease, color 180ms ease;
        }

        .cart-price-block button:hover {
          border-color: rgba(212, 175, 55, 0.35);
          color: #f7f2e8;
        }

        .cart-summary {
          align-self: start;
          padding: 28px;
          position: sticky;
          top: 110px;
        }

        .summary-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding: 18px 0;
          color: rgba(247, 242, 232, 0.7);
        }

        .summary-row strong {
          color: #f7f2e8;
          font-size: 22px;
          font-weight: 500;
        }

        .profile-readiness {
          margin-top: 18px;
          border-radius: 22px;
          border: 1px solid rgba(212, 175, 55, 0.18);
          background: rgba(255, 255, 255, 0.025);
          padding: 16px;
        }

        .profile-readiness span {
          display: block;
          color: #d4af37;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }

        .profile-readiness strong {
          display: block;
          margin-top: 8px;
          color: #f7f2e8;
          font-size: 18px;
          font-weight: 500;
        }

        .profile-readiness p {
          margin: 10px 0 0;
          color: rgba(247, 242, 232, 0.68);
          font-size: 14px;
          line-height: 1.7;
        }

        .profile-readiness-link {
          display: inline-flex;
          margin-top: 12px;
          border-radius: 999px;
          background: rgba(212, 175, 55, 0.1);
          padding: 9px 12px;
          color: #f7f2e8;
          text-decoration: none;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          transition: transform 180ms ease, background 180ms ease;
        }

        .profile-readiness-link:hover {
          transform: translateY(-1px);
          background: rgba(212, 175, 55, 0.18);
        }

        .checkout-button,
        .reserve-button,
        .cart-link-button {
          width: 100%;
          min-height: 58px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-top: 20px;
          border-radius: 999px;
          border: 1px solid rgba(212, 175, 55, 0.42);
          background: linear-gradient(135deg, #d4af37, #f0d98c);
          color: #080808;
          text-decoration: none;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          cursor: pointer;
          transition: transform 180ms ease, box-shadow 180ms ease;
        }

        .checkout-button:hover,
        .reserve-button:hover,
        .cart-link-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 20px 42px rgba(212, 175, 55, 0.14);
        }

        .checkout-button:disabled {
          cursor: not-allowed;
          opacity: 0.48;
          transform: none;
          box-shadow: none;
        }

        .reserve-button,
        .cart-link-button {
          background: rgba(255, 255, 255, 0.02);
          color: #f7f2e8;
        }

        .appraisal-link {
          display: block;
          margin-top: 18px;
          text-align: center;
          color: rgba(247, 242, 232, 0.64);
          text-decoration: none;
          font-size: 13px;
        }

        .appraisal-link:hover {
          color: #d4af37;
        }

        .checkout-message,
        .empty-cart {
          margin-top: 18px;
          padding: 20px;
          color: rgba(247, 242, 232, 0.76);
          font-size: 15px;
          line-height: 1.8;
        }

        .cart-page {
          background: #ffffff;
          color: #17130f;
        }

        .cart-hero,
        .cart-items-panel,
        .cart-summary,
        .empty-cart,
        .cart-item {
          border-color: rgba(23, 19, 15, 0.1);
          background: rgba(235, 222, 198, 0.72);
          box-shadow: 0 18px 48px rgba(72, 48, 22, 0.08);
        }

        .cart-kicker,
        .cart-id,
        .cart-price,
        .summary-row strong {
          color: #75552b;
        }

        .cart-hero p,
        .cart-copy p,
        .summary-copy,
        .profile-readiness p,
        .empty-cart p,
        .checkout-message {
          color: rgba(23, 19, 15, 0.68);
        }

        .profile-readiness {
          border-color: rgba(23, 19, 15, 0.1);
          background: rgba(255, 248, 235, 0.32);
        }

        .profile-readiness span,
        .profile-readiness strong {
          color: #75552b;
        }

        .profile-readiness-link {
          background: rgba(23, 19, 15, 0.08);
          color: #17130f;
        }

        .cart-availability,
        .appraisal-link {
          color: rgba(23, 19, 15, 0.56);
        }

        .checkout-button {
          background: #17130f;
          border-color: #17130f;
          color: #eadbc0;
        }

        .reserve-button,
        .cart-link-button {
          background: rgba(255, 248, 235, 0.36);
          border-color: rgba(23, 19, 15, 0.12);
          color: #17130f;
        }

        .cart-price-block button {
          border-color: rgba(23, 19, 15, 0.12);
          color: #17130f;
        }

        .empty-cart {
          padding: 44px 28px;
          text-align: center;
        }

        .empty-cart h2 {
          margin: 0;
          font-size: 32px;
        }

        .empty-cart p {
          max-width: 520px;
          margin: 16px auto 0;
          color: rgba(247, 242, 232, 0.68);
          line-height: 1.8;
        }

        @media (max-width: 880px) {
          .cart-layout {
            grid-template-columns: 1fr;
          }

          .cart-summary {
            position: static;
          }
        }

        @media (max-width: 640px) {
          .cart-shell {
            width: min(100%, calc(100vw - 22px));
            padding-top: 24px;
          }

          .cart-item {
            grid-template-columns: 96px minmax(0, 1fr);
          }

          .cart-price-block {
            grid-column: 1 / -1;
            grid-template-columns: 1fr auto;
            align-items: center;
            justify-items: start;
          }

          .cart-copy h2 {
            font-size: 23px;
          }
        }
      `}</style>
    </div>
  );
}
