import Image from "next/image";
import Link from "next/link";
import React from "react";

export const brandLogoSrc = "/brand/artwurk-logo-mark-wordmark.png";
export const brandMonogramSrc = "/brand/artwurk-monogram.svg";
export const brandLogoAlt = "ARTWURK™ luxury art brand logo";
export const brandHeaderLogoAlt = "ARTWURK™ luxury art brand mark";

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
  const isMonogram = size === "header" || size === "footer" || size === "crm";
  const logo = (
    <span className={`brand-logo-frame ${isMonogram ? "brand-logo-monogram" : "brand-logo-wordmark"} ${sizeClassName[size]} ${className}`}>
      <Image
        src={isMonogram ? brandMonogramSrc : brandLogoSrc}
        alt={isMonogram ? brandHeaderLogoAlt : brandLogoAlt}
        width={isMonogram ? 512 : 1254}
        height={isMonogram ? 512 : 770}
        priority={priority}
        sizes={
          size === "hero"
            ? "(max-width: 640px) 86vw, 540px"
            : isMonogram
              ? "56px"
              : "(max-width: 640px) 120px, 180px"
        }
        style={{
          width: "100%",
          height: isMonogram ? "100%" : "auto",
          display: "block",
          objectFit: isMonogram ? "contain" : undefined,
        }}
      />

      <style jsx>{`
        .brand-logo-frame {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .brand-logo-wordmark {
          border: 1px solid rgba(45, 32, 18, 0.1);
          border-radius: 22px;
          background: rgba(238, 225, 203, 0.72);
          box-shadow: 0 18px 48px rgba(58, 42, 24, 0.14);
        }

        .brand-logo-monogram {
          border: none;
          background: transparent;
          box-shadow: none;
          filter: drop-shadow(0 10px 18px rgba(23, 19, 15, 0.12))
            drop-shadow(0 0 10px rgba(212, 175, 55, 0.1));
        }

        .brand-logo-header {
          width: 62px;
          height: 62px;
          padding: 0;
        }

        .brand-logo-hero {
          width: min(540px, 86vw);
          padding: 18px 22px;
          border-radius: 34px;
          box-shadow: 0 34px 90px rgba(58, 42, 24, 0.2);
        }

        .brand-logo-footer {
          width: 84px;
          height: 84px;
          padding: 0;
        }

        .brand-logo-crm {
          width: 78px;
          height: 78px;
          padding: 0;
        }

        .brand-logo-profile {
          width: 180px;
          padding: 8px 12px;
        }

        @media (max-width: 640px) {
          .brand-logo-header {
            width: 56px;
            height: 56px;
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
