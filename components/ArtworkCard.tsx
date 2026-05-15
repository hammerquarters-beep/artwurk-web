import Image from "next/image";
import React from "react";

import { CartIcon } from "./ArtwurkIcons";
import type { ArtworkRecord } from "../data/artworks";

type ArtworkCardProps = {
  artwork: ArtworkRecord;
  description: string;
  displayId: string;
  featured?: boolean;
  imageMissing?: boolean;
  isAdded?: boolean;
  onAcquireNow: (artwork: ArtworkRecord) => void;
  onAddToCart: (artwork: ArtworkRecord) => void;
  onHover: (artwork: ArtworkRecord) => void;
  onImageError: (artwork: ArtworkRecord) => void;
  onLeave: (artwork: ArtworkRecord) => void;
  onOpen: (artwork: ArtworkRecord) => void;
};

const formatStatusLabel = (status: ArtworkRecord["status"]) =>
  status
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

export default function ArtworkCard({
  artwork,
  description,
  displayId,
  featured = false,
  imageMissing = false,
  isAdded = false,
  onAcquireNow,
  onAddToCart,
  onHover,
  onImageError,
  onLeave,
  onOpen,
}: ArtworkCardProps) {
  const sold = artwork.status === "sold";
  const checkoutReady = Boolean(artwork.paypalCheckoutUrl);

  return (
    <article
      className={`artwork-card${featured ? " featured" : ""}`}
      onMouseEnter={() => onHover(artwork)}
      onMouseLeave={() => onLeave(artwork)}
    >
      <button
        type="button"
        className="artwork-card-main"
        onClick={() => onOpen(artwork)}
        aria-label={`Open ${artwork.name} artwork details`}
      >
        <div className="artwork-image-wrap">
          {!imageMissing ? (
            <Image
              src={artwork.image}
              alt={`${artwork.name} artwork`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 980px) 50vw, 33vw"
              style={{ objectFit: "contain" }}
              onError={() => onImageError(artwork)}
            />
          ) : (
            <div className="artwork-image-fallback">
              <span>Image Missing</span>
              <strong>{artwork.name}</strong>
            </div>
          )}
        </div>

        <div className="artwork-card-copy">
          <div className="artwork-topline">
            <span>{displayId}</span>
            <span>{formatStatusLabel(artwork.status)}</span>
          </div>
          <h2>{artwork.name}</h2>
          <p>{description}</p>
          <div className="artwork-details">
            <span>{artwork.dimensions}</span>
            <strong>{artwork.price}</strong>
          </div>
        </div>
      </button>

      <div className="artwork-actions" aria-label={`${artwork.name} acquisition actions`}>
        <button
          type="button"
          className="acquire-button"
          onClick={() => onAcquireNow(artwork)}
          disabled={sold}
        >
          {sold ? "Sold" : checkoutReady ? "Acquire Now" : "Inquire"}
        </button>
        <button
          type="button"
          className={`add-cart-button${isAdded ? " is-added" : ""}`}
          onClick={() => onAddToCart(artwork)}
          disabled={sold}
          aria-label={`Add ${artwork.name} to cart`}
        >
          <CartIcon className="cart-icon" />
          {isAdded ? "Added" : "Add to Cart"}
        </button>
      </div>

      <style jsx>{`
        .artwork-card {
          position: relative;
          display: grid;
          border: 1px solid rgba(23, 19, 15, 0.09);
          border-radius: 30px;
          background: rgba(255, 255, 255, 0.78);
          box-shadow: 0 18px 48px rgba(72, 48, 22, 0.08);
          overflow: hidden;
          transition:
            transform 240ms ease,
            box-shadow 240ms ease,
            border-color 240ms ease;
        }

        .artwork-card:hover {
          transform: translateY(-4px);
          border-color: rgba(184, 145, 67, 0.32);
          box-shadow: 0 28px 68px rgba(72, 48, 22, 0.13);
        }

        .artwork-card.featured {
          border-color: rgba(184, 145, 67, 0.2);
        }

        .artwork-card-main {
          display: grid;
          gap: 0;
          width: 100%;
          border: 0;
          background: transparent;
          color: inherit;
          cursor: pointer;
          font: inherit;
          padding: 0;
          text-align: left;
        }

        .artwork-image-wrap {
          position: relative;
          aspect-ratio: 1 / 1.08;
          background:
            radial-gradient(circle at center, rgba(231, 216, 189, 0.5), transparent 60%),
            #ffffff;
          overflow: hidden;
        }

        .artwork-card:hover .artwork-image-wrap :global(img) {
          transform: scale(1.024);
        }

        .artwork-image-wrap :global(img) {
          transition: transform 420ms ease;
        }

        .artwork-image-fallback {
          min-height: 100%;
          display: grid;
          place-content: center;
          gap: 10px;
          padding: 24px;
          text-align: center;
        }

        .artwork-image-fallback span,
        .artwork-topline {
          color: rgba(23, 19, 15, 0.48);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }

        .artwork-image-fallback strong {
          font-size: 24px;
          line-height: 1;
        }

        .artwork-card-copy {
          display: grid;
          gap: 12px;
          padding: 18px 18px 16px;
        }

        .artwork-topline,
        .artwork-details {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
        }

        h2 {
          margin: 0;
          color: #17130f;
          font-size: clamp(1.35rem, 3vw, 2rem);
          line-height: 0.98;
          letter-spacing: -0.035em;
        }

        p {
          min-height: 4.5em;
          margin: 0;
          color: rgba(23, 19, 15, 0.64);
          font-size: 14px;
          line-height: 1.5;
        }

        .artwork-details {
          color: rgba(23, 19, 15, 0.58);
          font-size: 12px;
          line-height: 1.4;
        }

        .artwork-details strong {
          color: #75552b;
          font-size: 14px;
          font-weight: 800;
          text-align: right;
        }

        .artwork-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          padding: 0 18px 18px;
        }

        .acquire-button,
        .add-cart-button {
          min-height: 48px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border-radius: 999px;
          cursor: pointer;
          font-family: inherit;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          transition:
            transform 180ms ease,
            background 180ms ease,
            box-shadow 180ms ease,
            opacity 180ms ease;
        }

        .acquire-button {
          border: 1px solid #17130f;
          background: #17130f;
          color: #eadbc0;
        }

        .add-cart-button {
          border: 1px solid rgba(23, 19, 15, 0.12);
          background: rgba(235, 222, 198, 0.36);
          color: #17130f;
        }

        .acquire-button:hover,
        .add-cart-button:hover,
        .add-cart-button.is-added {
          transform: translateY(-1px);
          box-shadow: 0 16px 34px rgba(72, 48, 22, 0.12);
        }

        .add-cart-button.is-added {
          background: rgba(184, 145, 67, 0.18);
        }

        .acquire-button:disabled,
        .add-cart-button:disabled {
          cursor: not-allowed;
          opacity: 0.42;
          transform: none;
          box-shadow: none;
        }

        .cart-icon {
          width: 15px;
          height: 15px;
        }

        @media (max-width: 640px) {
          .artwork-actions {
            grid-template-columns: 1fr;
          }

          p {
            min-height: auto;
          }
        }
      `}</style>
    </article>
  );
}
