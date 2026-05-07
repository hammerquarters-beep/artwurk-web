import React, { useEffect, useRef, useState } from "react";

import {
  CloseIcon,
  MailIcon,
  MenuIcon,
  TagIcon,
  UserIcon,
} from "./ArtwurkIcons";

type CollectorMenuProps = {
  align?: "left" | "right";
  accountLabel?: string | null;
  onSignOut?: () => void | Promise<void>;
};

export default function CollectorMenu({ align = "left", accountLabel, onSignOut }: CollectorMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    window.addEventListener("mousedown", handlePointerDown);
    return () => window.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  const navItems = [
    {
      href: "/appraisal",
      label: "Art Appraisal",
      icon: <TagIcon className="collector-menu-icon" />,
    },
    {
      href: "/contact",
      label: "Contact Us",
      icon: <MailIcon className="collector-menu-icon" />,
    },
    accountLabel
      ? {
          href: "/profile",
          label: accountLabel,
          icon: <UserIcon className="collector-menu-icon" />,
        }
      : {
          href: "/profile",
          label: "Create / Sign In",
          icon: <UserIcon className="collector-menu-icon" />,
        },
    ...(accountLabel
      ? [
          {
            href: "/cart",
            label: "My Cart",
            icon: <TagIcon className="collector-menu-icon" />,
          },
        ]
      : []),
  ];

  return (
    <div ref={rootRef} className="collector-menu-root">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="collector-menu-trigger"
        aria-label="Open collector menu"
      >
        {open ? <CloseIcon className="collector-menu-toggle-icon" /> : <MenuIcon className="collector-menu-toggle-icon" />}
      </button>

      <div className={`collector-menu-panel align-${align}${open ? " is-open" : ""}`}>
        <div className="collector-menu-header">
          <div className="collector-menu-kicker">Collector Access</div>
          <div className="collector-menu-title">ARTWURK Menu</div>
        </div>

        <nav className="collector-menu-links">
          {navItems.map((item, index) => (
            <a
              key={item.href}
              href={item.href}
              className={`collector-menu-link${index < navItems.length - 1 ? " has-divider" : ""}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </a>
          ))}
          {accountLabel && onSignOut ? (
            <button type="button" className="collector-menu-link collector-menu-button" onClick={onSignOut}>
              <UserIcon className="collector-menu-icon" />
              <span>Sign Out</span>
            </button>
          ) : null}
        </nav>
      </div>

      <style jsx>{`
        .collector-menu-root {
          position: relative;
        }

        .collector-menu-trigger {
          width: 48px;
          height: 48px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          border: 1px solid rgba(23, 19, 15, 0.12);
          background: rgba(239, 226, 201, 0.42);
          color: #17130f;
          cursor: pointer;
          backdrop-filter: blur(14px);
          transition: border-color 180ms ease, color 180ms ease, transform 180ms ease;
        }

        .collector-menu-trigger:hover {
          border-color: rgba(23, 19, 15, 0.22);
          background: rgba(255, 248, 235, 0.56);
          color: #17130f;
          transform: translateY(-1px);
        }

        .collector-menu-toggle-icon {
          width: 20px;
          height: 20px;
        }

        .collector-menu-panel {
          position: absolute;
          top: 56px;
          left: 0;
          z-index: 60;
          width: 288px;
          overflow: hidden;
          border-radius: 24px;
          border: 1px solid rgba(23, 19, 15, 0.12);
          background: rgba(236, 224, 201, 0.98);
          box-shadow: 0 28px 70px rgba(63, 42, 20, 0.2);
          backdrop-filter: blur(18px);
          opacity: 0;
          transform: translateY(-6px) scale(0.98);
          pointer-events: none;
          transform-origin: top left;
          transition: opacity 180ms ease, transform 240ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        .collector-menu-panel.align-right {
          left: auto;
          right: 0;
          transform-origin: top right;
        }

        .collector-menu-panel.is-open {
          opacity: 1;
          transform: translateY(0) scale(1);
          pointer-events: auto;
        }

        .collector-menu-header {
          padding: 22px 22px 18px;
          border-bottom: 1px solid rgba(23, 19, 15, 0.08);
        }

        .collector-menu-kicker {
          font-size: 11px;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: #8f6d32;
        }

        .collector-menu-title {
          margin-top: 12px;
          font-size: 18px;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #17130f;
        }

        .collector-menu-links {
          display: grid;
        }

        .collector-menu-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 22px;
          color: #17130f;
          text-decoration: none;
          transition: background 180ms ease, color 180ms ease, padding-left 180ms ease;
        }

        .collector-menu-button {
          width: 100%;
          border: 0;
          border-top: 1px solid rgba(23, 19, 15, 0.08);
          background: transparent;
          font-family: inherit;
          font-size: 15px;
          cursor: pointer;
        }

        .collector-menu-link:hover {
          background: rgba(255, 248, 235, 0.56);
          color: #17130f;
          padding-left: 25px;
        }

        .collector-menu-link.has-divider {
          border-bottom: 1px solid rgba(23, 19, 15, 0.08);
        }

        :global(.collector-menu-icon) {
          width: 16px;
          height: 16px;
          color: #8f6d32;
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
}
