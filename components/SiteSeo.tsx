import Head from "next/head";
import React from "react";

import { brandLogoAlt, brandLogoSrc } from "./BrandLogo";

const defaultDescription =
  "Luxury original artwork, private collectors, and premium art appraisal services by Hammer HQ LLC.";

type SiteSeoProps = {
  title?: string;
  description?: string;
};

export default function SiteSeo({
  title = "ARTWURK™",
  description = defaultDescription,
}: SiteSeoProps) {
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="application-name" content="ARTWURK™" />
      <meta name="apple-mobile-web-app-title" content="ARTWURK" />
      <meta name="theme-color" content="#040404" />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={brandLogoSrc} />
      <meta property="og:image:alt" content={brandLogoAlt} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={brandLogoSrc} />
      <link rel="shortcut icon" href="/favicon.ico" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
      <link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/site.webmanifest" />
    </Head>
  );
}
