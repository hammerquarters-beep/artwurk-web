import React, { useEffect, useRef, useState } from "react";

import {
  CloseIcon,
  MailIcon,
  MenuIcon,
  TagIcon,
  UserIcon,
} from "./ArtwurkIcons";

export default function CollectorMenu() {
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
      href: "/profile",
      label: "Create / Sign In Profile",
      icon: <UserIcon className="collector-menu-icon" />,
    },
    {
      href: "/appraisal",
      label: "Artwork Appraisal",
      icon: <TagIcon className="collector-menu-icon" />,
    },
    {
      href: "/contact",
      label: "Contact Us",
      icon: <MailIcon className="collector-menu-icon" />,
    },
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

      <div className={`collector-menu-panel${open ? " is-open" : ""}`}>
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
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(0, 0, 0, 0.3);
          color: #f7f2e8;
          cursor: pointer;
          backdrop-filter: blur(14px);
          transition: border-color 180ms ease, color 180ms ease, transform 180ms ease;
        }

        .collector-menu-trigger:hover {
          border-color: rgba(212, 175, 55, 0.4);
          color: #d4af37;
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
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(9, 9, 9, 0.95);
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
          backdrop-filter: blur(18px);
          opacity: 0;
          transform: translateY(-8px);
          pointer-events: none;
          transition: opacity 220ms ease, transform 220ms ease;
        }

        .collector-menu-panel.is-open {
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
        }

        .collector-menu-header {
          padding: 18px 20px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .collector-menu-kicker {
          font-size: 11px;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: #d4af37;
        }

        .collector-menu-title {
          margin-top: 10px;
          font-size: 20px;
          font-weight: 600;
          color: #f7f2e8;
        }

        .collector-menu-links {
          display: grid;
        }

        .collector-menu-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 18px 20px;
          color: rgba(247, 242, 232, 0.9);
          text-decoration: none;
          transition: background 180ms ease, color 180ms ease;
        }

        .collector-menu-link:hover {
          background: rgba(255, 255, 255, 0.05);
          color: #f7f2e8;
        }

        .collector-menu-link.has-divider {
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        :global(.collector-menu-icon) {
          width: 16px;
          height: 16px;
          color: #d4af37;
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
}
