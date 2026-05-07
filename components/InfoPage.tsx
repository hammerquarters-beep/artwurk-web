import React from "react";

import PublicHeader from "./PublicHeader";
import SiteFooter from "./SiteFooter";
import SiteSeo from "./SiteSeo";

type InfoPageProps = {
  title: string;
  kicker: string;
  description: string;
  sections: Array<{
    title: string;
    body: string;
  }>;
};

export default function InfoPage({ title, kicker, description, sections }: InfoPageProps) {
  return (
    <div className="info-page">
      <SiteSeo title={`${title} | ARTWURK™`} description={description} />
      <PublicHeader />
      <main className="info-shell">
        <section className="info-hero">
          <div className="info-kicker">{kicker}</div>
          <h1>{title}</h1>
          <p>{description}</p>
        </section>

        <section className="info-grid" aria-label={`${title} information`}>
          {sections.map((section) => (
            <article key={section.title} className="info-card">
              <h2>{section.title}</h2>
              <p>{section.body}</p>
            </article>
          ))}
        </section>
      </main>
      <SiteFooter />

      <style jsx>{`
        .info-page {
          min-height: 100vh;
          background: #ffffff;
          color: #17130f;
          font-family: "Times New Roman", Georgia, serif;
        }

        .info-shell {
          width: min(1180px, 100%);
          margin: 0 auto;
          padding: 30px 14px 54px;
        }

        .info-hero,
        .info-card {
          border: 1px solid rgba(23, 19, 15, 0.1);
          background: rgba(235, 222, 198, 0.72);
          box-shadow: 0 18px 48px rgba(72, 48, 22, 0.08);
        }

        .info-hero {
          border-radius: 34px;
          padding: 40px 24px;
          text-align: center;
        }

        .info-kicker {
          color: #75552b;
          font-size: 11px;
          letter-spacing: 0.28em;
          text-transform: uppercase;
        }

        .info-hero h1 {
          margin: 16px auto 0;
          max-width: 820px;
          color: #17130f;
          font-size: clamp(2.4rem, 9vw, 5.4rem);
          line-height: 0.95;
          letter-spacing: -0.04em;
        }

        .info-hero p {
          max-width: 760px;
          margin: 22px auto 0;
          color: rgba(23, 19, 15, 0.68);
          font-size: 16px;
          line-height: 1.9;
        }

        .info-grid {
          display: grid;
          gap: 16px;
          margin-top: 22px;
        }

        .info-card {
          border-radius: 28px;
          padding: 24px;
        }

        .info-card h2 {
          margin: 0;
          color: #75552b;
          font-size: 12px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
        }

        .info-card p {
          margin: 14px 0 0;
          color: rgba(23, 19, 15, 0.68);
          font-size: 15px;
          line-height: 1.85;
        }

        @media (min-width: 820px) {
          .info-shell {
            padding: 38px 16px 70px;
          }

          .info-hero {
            padding: 54px 38px;
          }

          .info-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 20px;
            margin-top: 26px;
          }
        }
      `}</style>
    </div>
  );
}
