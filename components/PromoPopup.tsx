import React, { FormEvent, useEffect, useState } from "react";

import { CloseIcon, MailIcon, PercentIcon } from "./ArtwurkIcons";
import { trackLead } from "../lib/tracking";

const DISCOUNT_CODE = {
  code: "FIRST20",
  amountOffPercent: 20,
  audience: "first_time_email_signup",
};

const DISMISSED_KEY = "artwurk.promo.dismissed";
const CLAIMED_KEY = "artwurk.promo.claimed";

type PromoPopupProps = {
  enabled: boolean;
};

export default function PromoPopup({ enabled }: PromoPopupProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !enabled) {
      return;
    }

    const dismissed = window.localStorage.getItem(DISMISSED_KEY);
    const claimed = window.localStorage.getItem(CLAIMED_KEY);

    if (!dismissed && !claimed) {
      const timeout = window.setTimeout(() => {
        setOpen(true);
      }, 450);

      return () => window.clearTimeout(timeout);
    }

    if (claimed) {
      setSubmitted(true);
    }
  }, [enabled]);

  const closePopup = () => {
    setOpen(false);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(DISMISSED_KEY, "true");
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email) {
      return;
    }

    trackLead({
      route: "/",
      page: "gallery",
      source: "promo-popup",
      status: "new",
      intent: "general",
      customer: {
        email,
        preferredContact: "email",
      },
      metadata: {
        discountCode: DISCOUNT_CODE.code,
        audience: DISCOUNT_CODE.audience,
        amountOffPercent: DISCOUNT_CODE.amountOffPercent,
      },
    });

    setSubmitted(true);
    setOpen(true);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(CLAIMED_KEY, DISCOUNT_CODE.code);
      window.localStorage.removeItem(DISMISSED_KEY);
    }
  };

  if (!enabled || !open) {
    return null;
  }

  return (
    <div className="promo-popup-overlay">
      <div className="promo-popup-card">
        <button type="button" onClick={closePopup} className="promo-popup-close" aria-label="Close offer">
          <CloseIcon className="promo-popup-close-icon" />
        </button>

        <div className="promo-popup-kicker">Private Offer</div>
        <h2 className="promo-popup-title">20% Off Your First Purchase</h2>
        <p className="promo-popup-copy">
          Join the ARTWURK collector list with a new email and unlock your first-purchase
          offer. This also gives Hammer HQ a clean way to invite you to future private
          drops, event pricing, and collector-only releases.
        </p>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="promo-popup-form">
            <div className="promo-popup-input-row">
              <MailIcon className="promo-popup-input-icon" />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your email"
                className="promo-popup-input"
              />
            </div>
            <button type="submit" className="promo-popup-submit">
              Unlock Offer
            </button>
          </form>
        ) : (
          <div className="promo-popup-success">
            <div className="promo-popup-success-label">
              <PercentIcon className="promo-popup-success-icon" />
              <span>Discount Unlocked</span>
            </div>
            <div className="promo-popup-code">{DISCOUNT_CODE.code}</div>
            <p className="promo-popup-success-copy">
              Use this code before checkout. Later, this same system can support custom
              codes for return customers, family members, and anyone on your email or text
              list.
            </p>
          </div>
        )}

        <style jsx>{`
          .promo-popup-overlay {
            position: fixed;
            inset: 0;
            z-index: 95;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 16px;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(8px);
          }

          .promo-popup-card {
            position: relative;
            width: min(100%, 640px);
            border-radius: 28px;
            border: 1px solid rgba(212, 175, 55, 0.2);
            background: #080808;
            padding: 32px;
            box-shadow: 0 30px 80px rgba(0, 0, 0, 0.55);
          }

          .promo-popup-close {
            position: absolute;
            top: 16px;
            right: 16px;
            width: 40px;
            height: 40px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 999px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            background: transparent;
            color: rgba(247, 242, 232, 0.75);
            cursor: pointer;
            transition: border-color 180ms ease, color 180ms ease;
          }

          .promo-popup-close:hover {
            border-color: rgba(212, 175, 55, 0.4);
            color: #f7f2e8;
          }

          .promo-popup-close-icon,
          .promo-popup-input-icon,
          .promo-popup-success-icon {
            width: 18px;
            height: 18px;
          }

          .promo-popup-kicker {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.28em;
            color: #d4af37;
          }

          .promo-popup-title {
            margin: 14px 0 0;
            font-size: clamp(2rem, 5vw, 3rem);
            font-weight: 900;
            letter-spacing: 0.06em;
            text-transform: uppercase;
            color: #f7f2e8;
            text-shadow: 0 0 18px rgba(212, 175, 55, 0.18);
          }

          .promo-popup-copy {
            margin: 16px 0 0;
            max-width: 560px;
            font-size: 16px;
            line-height: 1.9;
            color: rgba(247, 242, 232, 0.72);
          }

          .promo-popup-form {
            display: grid;
            gap: 16px;
            margin-top: 28px;
          }

          .promo-popup-input-row {
            display: flex;
            align-items: center;
            gap: 12px;
            border-radius: 18px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            background: rgba(255, 255, 255, 0.03);
            padding: 16px 18px;
            color: #d4af37;
          }

          .promo-popup-input {
            width: 100%;
            border: none;
            outline: none;
            background: transparent;
            color: #f7f2e8;
            font-size: 15px;
            font-family: "Times New Roman", Georgia, serif;
          }

          .promo-popup-input::placeholder {
            color: rgba(247, 242, 232, 0.3);
          }

          .promo-popup-submit {
            min-height: 58px;
            border: 1px solid rgba(212, 175, 55, 0.4);
            border-radius: 18px;
            background: linear-gradient(to right, #c89d3f, #f0d98c);
            color: #080808;
            font-size: 13px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.22em;
            cursor: pointer;
            transition: transform 180ms ease;
          }

          .promo-popup-submit:hover {
            transform: scale(1.01);
          }

          .promo-popup-success {
            margin-top: 28px;
            border-radius: 18px;
            border: 1px solid rgba(212, 175, 55, 0.25);
            background: rgba(212, 175, 55, 0.08);
            padding: 24px;
          }

          .promo-popup-success-label {
            display: flex;
            align-items: center;
            gap: 10px;
            color: #d4af37;
            font-size: 12px;
            letter-spacing: 0.24em;
            text-transform: uppercase;
          }

          .promo-popup-code {
            margin-top: 16px;
            font-size: 44px;
            font-weight: 900;
            letter-spacing: 0.08em;
            color: #f7f2e8;
          }

          .promo-popup-success-copy {
            margin: 12px 0 0;
            font-size: 14px;
            line-height: 1.9;
            color: rgba(247, 242, 232, 0.72);
          }

          @media (max-width: 640px) {
            .promo-popup-card {
              padding: 26px 22px;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
