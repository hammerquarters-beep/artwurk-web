import type { GetStaticPaths, GetStaticProps } from "next";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";

import { CartIcon } from "../../components/ArtwurkIcons";
import { useCart } from "../../components/CartProvider";
import PublicHeader from "../../components/PublicHeader";
import SiteFooter from "../../components/SiteFooter";
import SiteSeo from "../../components/SiteSeo";
import artworks, { type ArtworkRecord } from "../../data/artworks";
import { parsePriceToAmount } from "../../lib/cart-types";

type ArtworkPageProps = {
  artwork: ArtworkRecord;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const getArtworkPathId = (artwork: ArtworkRecord) => slugify(`${artwork.id}-${artwork.name}`);

export const getStaticPaths: GetStaticPaths = () => ({
  paths: artworks.map((artwork) => ({
    params: { id: getArtworkPathId(artwork) },
  })),
  fallback: false,
});

export const getStaticProps: GetStaticProps<ArtworkPageProps> = ({ params }) => {
  const id = typeof params?.id === "string" ? params.id : "";
  const artwork = artworks.find((item) => getArtworkPathId(item) === id) ?? null;

  if (!artwork) {
    return { notFound: true };
  }

  return {
    props: { artwork },
  };
};

export default function ArtworkProductPage({ artwork }: ArtworkPageProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const addToCart = async () => {
    await addItem({
      artworkId: artwork.id,
      displayId: artwork.displayId,
      title: artwork.name,
      image: artwork.image,
      dimensions: artwork.dimensions,
      priceLabel: artwork.price,
      unitAmount: parsePriceToAmount(artwork.price),
      quantity: 1,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 900);
  };

  return (
    <div className="artwork-page">
      <SiteSeo
        title={`${artwork.name} | ARTWURK™`}
        description={`${artwork.name}, ${artwork.dimensions}. Luxury original artwork available through ARTWURK and Hammer HQ LLC.`}
      />
      <PublicHeader />

      <main className="artwork-shell">
        <Link href="/" className="back-link">
          Back to collection
        </Link>

        <section className="product-layout" aria-labelledby="artwork-title">
          <div className="product-image-panel">
            <Image
              src={artwork.image}
              alt={`${artwork.name} original artwork by ARTWURK`}
              fill
              priority
              sizes="(max-width: 880px) 100vw, 58vw"
              style={{ objectFit: "contain" }}
            />
          </div>

          <aside className="product-info">
            <p className="product-kicker">{artwork.displayId ?? artwork.id}</p>
            <h1 id="artwork-title">{artwork.name}</h1>
            <div className="product-price">{artwork.price}</div>
            <div className="product-meta">
              <span>{artwork.dimensions}</span>
              <span>{artwork.category}</span>
              <span>Original • One of One</span>
            </div>

            <p className="product-story">{artwork.story}</p>

            <div className="product-actions">
              <button
                type="button"
                className={`add-cart-button${added ? " is-added" : ""}`}
                onClick={() => void addToCart()}
              >
                <CartIcon className="product-cart-icon" />
                {added ? "Added to Cart" : "Add to Cart"}
              </button>
              <a
                href={`mailto:hammerhq@outlook.com?subject=${encodeURIComponent(
                  `Private inquiry for ${artwork.name}`,
                )}`}
                className="reserve-button"
              >
                Reserve / Inquire
              </a>
            </div>

            <div className="product-notes">
              <div>
                <strong>Payment Options</strong>
                <span>Secure checkout where available, PayPal, card invoice, and private owner follow-up.</span>
              </div>
              <div>
                <strong>Shipping & Handling</strong>
                <span>Hammer HQ coordinates secure shipment and acquisition support for each original work.</span>
              </div>
              <div>
                <strong>Collector Trust</strong>
                <span>Signed work with certificate of authenticity included for applicable originals.</span>
              </div>
            </div>
          </aside>
        </section>
      </main>

      <SiteFooter />

      <style jsx>{`
        .artwork-page {
          min-height: 100vh;
          background:
            radial-gradient(circle at top, rgba(255, 248, 235, 0.7), transparent 30%),
            linear-gradient(180deg, #e7d8bd, #d5bd93 54%, #c7ad82);
          color: #17130f;
          font-family: "Times New Roman", Georgia, serif;
        }

        .artwork-shell {
          width: min(1320px, calc(100vw - 28px));
          margin: 0 auto;
          padding: 28px 0 72px;
        }

        .back-link {
          min-height: 44px;
          display: inline-flex;
          align-items: center;
          border-radius: 999px;
          padding: 0 16px;
          color: #17130f;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          transition: background 180ms ease, transform 180ms ease;
        }

        .back-link:hover {
          background: rgba(255, 248, 235, 0.48);
          transform: translateY(-1px);
        }

        .product-layout {
          display: grid;
          gap: 26px;
          margin-top: 22px;
        }

        .product-image-panel,
        .product-info {
          border: 1px solid rgba(23, 19, 15, 0.1);
          border-radius: 34px;
          background: rgba(235, 222, 198, 0.72);
          box-shadow: 0 22px 60px rgba(72, 48, 22, 0.12);
        }

        .product-image-panel {
          position: relative;
          min-height: 62vh;
          overflow: hidden;
          background: #d4bb91;
        }

        .product-info {
          padding: clamp(24px, 4vw, 44px);
        }

        .product-kicker {
          margin: 0;
          color: #75552b;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.24em;
          text-transform: uppercase;
        }

        h1 {
          margin: 18px 0 0;
          font-size: clamp(3rem, 9vw, 7.5rem);
          line-height: 0.88;
          letter-spacing: -0.06em;
        }

        .product-price {
          margin-top: 24px;
          color: #75552b;
          font-size: clamp(1.8rem, 4vw, 3rem);
        }

        .product-meta {
          display: grid;
          gap: 10px;
          margin-top: 24px;
          color: rgba(23, 19, 15, 0.68);
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .product-story {
          margin: 28px 0 0;
          color: rgba(23, 19, 15, 0.72);
          font-size: 18px;
          line-height: 1.9;
        }

        .product-actions {
          display: grid;
          gap: 12px;
          margin-top: 30px;
        }

        .add-cart-button,
        .reserve-button {
          min-height: 60px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          border-radius: 999px;
          border: 1px solid #17130f;
          background: #17130f;
          color: #eadbc0;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          cursor: pointer;
          transition: transform 180ms ease, box-shadow 180ms ease;
        }

        .reserve-button {
          background: rgba(255, 248, 235, 0.36);
          color: #17130f;
          border-color: rgba(23, 19, 15, 0.12);
        }

        .add-cart-button:hover,
        .reserve-button:hover,
        .add-cart-button.is-added {
          transform: translateY(-2px);
          box-shadow: 0 18px 40px rgba(72, 48, 22, 0.14);
        }

        .product-cart-icon {
          width: 18px;
          height: 18px;
        }

        .product-notes {
          display: grid;
          gap: 0;
          margin-top: 30px;
          border-top: 1px solid rgba(23, 19, 15, 0.1);
        }

        .product-notes div {
          display: grid;
          gap: 8px;
          border-bottom: 1px solid rgba(23, 19, 15, 0.1);
          padding: 18px 0;
        }

        .product-notes strong {
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }

        .product-notes span {
          color: rgba(23, 19, 15, 0.64);
          line-height: 1.7;
        }

        @media (min-width: 900px) {
          .product-layout {
            grid-template-columns: minmax(0, 1.2fr) minmax(380px, 0.8fr);
            align-items: start;
          }

          .product-info {
            position: sticky;
            top: 110px;
          }
        }
      `}</style>
    </div>
  );
}
