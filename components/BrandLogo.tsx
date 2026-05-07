import Image from "next/image";
import Link from "next/link";
import React from "react";

export const brandLogoSrc = "/brand/artwurk-logo-mark-wordmark.png";
export const brandLogoAlt = "ARTWURK™ luxury art brand logo";

type BrandLogoProps = {
  href?: string;
  size?: "header" | "hero" | "footer" | "crm" | "profile";
  priority?: boolean;
  className?: string;
};

const sizeClassName: Record<NonNullable<BrandLogoProps["size"]>, string> = {
  header: "brand-logo-header",
  hero: "brand-logo-hero",
  footer: "brand-logo-footer",
  crm: "brand-logo-crm",
  profile: "brand-logo-profile",
};

export default function BrandLogo({
  href = "/",
  size = "header",
  priority = false,
  className = "",
}: BrandLogoProps) {
  const logo = (
    <span className={`brand-logo-frame ${sizeClassName[size]} ${className}`}>
      <Image
        src={brandLogoSrc}
        alt={brandLogoAlt}
        width={1254}
        height={770}
        priority={priority}
        sizes={
          size === "hero"
            ? "(max-width: 640px) 86vw, 540px"
            : "(max-width: 640px) 120px, 180px"
        }
        style={{
          width: "100%",
          height: "auto",
          display: "block",
        }}
      />

      <style jsx>{`
        .brand-logo-frame {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border: 1px solid rgba(45, 32, 18, 0.1);
          border-radius: 22px;
          background: rgba(238, 225, 203, 0.72);
          box-shadow: 0 18px 48px rgba(58, 42, 24, 0.14);
        }

        .brand-logo-header {
          width: 138px;
          padding: 6px 10px;
        }

        .brand-logo-hero {
          width: min(540px, 86vw);
          padding: 18px 22px;
          border-radius: 34px;
          box-shadow: 0 34px 90px rgba(58, 42, 24, 0.2);
        }

        .brand-logo-footer {
          width: 180px;
          padding: 8px 12px;
        }

        .brand-logo-crm {
          width: 112px;
          padding: 6px;
          background: rgba(255, 255, 255, 0.96);
        }

        .brand-logo-profile {
          width: 180px;
          padding: 8px 12px;
        }

        @media (max-width: 640px) {
          .brand-logo-header {
            width: 112px;
            padding: 5px 8px;
          }

          .brand-logo-hero {
            padding: 14px 16px;
          }
        }
      `}</style>
    </span>
  );

  return (
    <Link href={href} aria-label="Return to ARTWURK homepage" style={{ display: "inline-flex" }}>
      {logo}
    </Link>
  );
}
