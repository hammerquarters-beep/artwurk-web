import Image from "next/image";
import Link from "next/link";
import React from "react";

export const brandLogoSrc = "/brand/artwurk-logo-transparent.png";
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
        height={1254}
        priority={priority}
        sizes={
          size === "hero"
            ? "(max-width: 640px) 86vw, 520px"
            : "(max-width: 640px) 150px, 220px"
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
          border: 1px solid rgba(212, 175, 55, 0.2);
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.98),
            rgba(246, 242, 232, 0.96)
          );
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.36), 0 0 54px rgba(212, 175, 55, 0.08);
        }

        .brand-logo-header {
          width: 72px;
          padding: 4px;
        }

        .brand-logo-hero {
          width: min(520px, 88vw);
          padding: 18px;
          box-shadow: 0 34px 90px rgba(0, 0, 0, 0.48), 0 0 90px rgba(212, 175, 55, 0.1);
        }

        .brand-logo-footer {
          width: 116px;
          padding: 6px;
        }

        .brand-logo-crm {
          width: 112px;
          padding: 6px;
        }

        .brand-logo-profile {
          width: 150px;
          padding: 8px;
        }

        @media (max-width: 640px) {
          .brand-logo-header {
            width: 60px;
          }

          .brand-logo-hero {
            padding: 14px;
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
