import Image from "next/image";
import Link from "next/link";
import React, { useEffect } from "react";

import { useCart } from "./CartProvider";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);

export default function CartDrawer() {
  const { closeCart, drawerOpen, items, removeItem, subtotal } = useCart();

  useEffect(() => {
    if (!drawerOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeCart();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [closeCart, drawerOpen]);

  return (
    <div className={`cart-drawer-root${drawerOpen ? " is-open" : ""}`} aria-hidden={!drawerOpen}>
      <button
        type="button"
        className="cart-drawer-backdrop"
        onClick={closeCart}
        aria-label="Close collector cart"
        tabIndex={drawerOpen ? 0 : -1}
      />

      <aside
        className="cart-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
      >
        <div className="drawer-header">
          <div>
            <p>Private Acquisition</p>
            <h2 id="cart-drawer-title">Collector Cart</h2>
          </div>
          <button type="button" onClick={closeCart} aria-label="Close cart">
            Close
          </button>
        </div>

        <div className="drawer-items">
          {items.length ? (
            items.map((item) => (
              <article key={item.artworkId} className="drawer-item">
                <div className="drawer-thumb">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={`${item.title} artwork thumbnail`}
                      fill
                      sizes="82px"
                      style={{ objectFit: "contain" }}
                    />
                  ) : null}
                </div>
                <div className="drawer-copy">
                  <span>{item.displayId ?? item.artworkId}</span>
                  <h3>{item.title}</h3>
                  <p>{item.dimensions ?? "Dimensions available on request"}</p>
                  <strong>{item.priceLabel}</strong>
                </div>
                <button
                  type="button"
                  className="drawer-remove"
                  onClick={() => void removeItem(item.artworkId)}
                  aria-label={`Remove ${item.title} from cart`}
                >
                  Remove
                </button>
              </article>
            ))
          ) : (
            <div className="drawer-empty">
              <h3>Your cart is waiting for its first original.</h3>
              <p>Add one-of-one works from the collection, then complete checkout or request private acquisition support.</p>
            </div>
          )}
        </div>

        <div className="drawer-footer">
          <div className="drawer-subtotal">
            <span>Subtotal</span>
            <strong>{formatCurrency(subtotal)}</strong>
          </div>
          <Link href="/cart" className="drawer-checkout" onClick={closeCart}>
            Checkout
          </Link>
          <Link href="/contact" className="drawer-inquiry" onClick={closeCart}>
            Request Collector Support
          </Link>
        </div>
      </aside>

      <style jsx>{`
        .cart-drawer-root {
          position: fixed;
          inset: 0;
          z-index: 220;
          pointer-events: none;
        }

        .cart-drawer-root.is-open {
          pointer-events: auto;
        }

        .cart-drawer-backdrop {
          position: absolute;
          inset: 0;
          border: 0;
          background: rgba(17, 16, 14, 0);
          cursor: pointer;
          transition: background 260ms ease;
        }

        .cart-drawer-root.is-open .cart-drawer-backdrop {
          background: rgba(17, 16, 14, 0.42);
        }

        .cart-drawer {
          position: absolute;
          top: 12px;
          right: 12px;
          bottom: 12px;
          width: min(438px, calc(100vw - 24px));
          display: grid;
          grid-template-rows: auto 1fr auto;
          border: 1px solid rgba(23, 19, 15, 0.12);
          border-radius: 34px;
          background:
            radial-gradient(circle at top right, rgba(212, 175, 55, 0.12), transparent 34%),
            #f3eadb;
          box-shadow: 0 28px 90px rgba(23, 19, 15, 0.28);
          color: #17130f;
          font-family: "Times New Roman", Georgia, serif;
          overflow: hidden;
          transform: translateX(calc(100% + 24px));
          transition: transform 320ms cubic-bezier(0.2, 0.8, 0.2, 1);
        }

        .cart-drawer-root.is-open .cart-drawer {
          transform: translateX(0);
        }

        .drawer-header,
        .drawer-footer {
          padding: 22px;
        }

        .drawer-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 18px;
          border-bottom: 1px solid rgba(23, 19, 15, 0.1);
        }

        .drawer-header p {
          margin: 0;
          color: #75552b;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.24em;
          text-transform: uppercase;
        }

        .drawer-header h2 {
          margin: 8px 0 0;
          font-size: 34px;
          line-height: 0.95;
          letter-spacing: -0.04em;
        }

        .drawer-header button,
        .drawer-remove {
          border: 1px solid rgba(23, 19, 15, 0.1);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.34);
          color: #17130f;
          cursor: pointer;
          font-family: inherit;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          transition: transform 180ms ease, background 180ms ease;
        }

        .drawer-header button {
          min-height: 38px;
          padding: 0 13px;
        }

        .drawer-header button:hover,
        .drawer-remove:hover {
          background: rgba(255, 255, 255, 0.72);
          transform: translateY(-1px);
        }

        .drawer-items {
          display: grid;
          align-content: start;
          gap: 12px;
          overflow-y: auto;
          padding: 16px;
        }

        .drawer-item {
          display: grid;
          grid-template-columns: 82px minmax(0, 1fr);
          gap: 14px;
          border: 1px solid rgba(23, 19, 15, 0.09);
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.42);
          padding: 12px;
        }

        .drawer-thumb {
          position: relative;
          aspect-ratio: 1 / 1;
          border-radius: 17px;
          background: rgba(255, 255, 255, 0.54);
          overflow: hidden;
        }

        .drawer-copy span {
          color: #75552b;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }

        .drawer-copy h3 {
          margin: 6px 0 0;
          font-size: 20px;
          line-height: 1;
        }

        .drawer-copy p {
          margin: 8px 0 0;
          color: rgba(23, 19, 15, 0.62);
          font-size: 13px;
          line-height: 1.45;
        }

        .drawer-copy strong {
          display: block;
          margin-top: 8px;
          color: #75552b;
          font-size: 15px;
          font-weight: 700;
        }

        .drawer-remove {
          grid-column: 2;
          width: fit-content;
          min-height: 32px;
          padding: 0 11px;
        }

        .drawer-empty {
          border: 1px solid rgba(23, 19, 15, 0.09);
          border-radius: 26px;
          background: rgba(255, 255, 255, 0.36);
          padding: 24px;
          text-align: center;
        }

        .drawer-empty h3 {
          margin: 0;
          font-size: 24px;
          line-height: 1;
        }

        .drawer-empty p {
          margin: 12px 0 0;
          color: rgba(23, 19, 15, 0.62);
          line-height: 1.7;
        }

        .drawer-footer {
          border-top: 1px solid rgba(23, 19, 15, 0.1);
        }

        .drawer-subtotal {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          color: rgba(23, 19, 15, 0.62);
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }

        .drawer-subtotal strong {
          color: #17130f;
          font-size: 24px;
          letter-spacing: 0;
          text-transform: none;
        }

        .drawer-checkout,
        .drawer-inquiry {
          min-height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 16px;
          border-radius: 999px;
          text-decoration: none;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          transition: transform 180ms ease, box-shadow 180ms ease;
        }

        .drawer-checkout {
          background: #17130f;
          color: #eadbc0;
        }

        .drawer-inquiry {
          border: 1px solid rgba(23, 19, 15, 0.12);
          background: rgba(255, 255, 255, 0.32);
          color: #17130f;
        }

        .drawer-checkout:hover,
        .drawer-inquiry:hover {
          transform: translateY(-1px);
          box-shadow: 0 16px 34px rgba(72, 48, 22, 0.12);
        }

        @media (max-width: 640px) {
          .cart-drawer {
            top: auto;
            right: 8px;
            bottom: 8px;
            left: 8px;
            width: auto;
            height: min(82vh, 720px);
            border-radius: 30px;
            transform: translateY(calc(100% + 20px));
          }

          .cart-drawer-root.is-open .cart-drawer {
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .cart-drawer,
          .cart-drawer-backdrop,
          .drawer-checkout,
          .drawer-inquiry,
          .drawer-header button,
          .drawer-remove {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
}
