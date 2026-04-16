import React from "react";

type IconProps = {
  className?: string;
};

const baseProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
};

export function MenuIcon({ className }: IconProps) {
  return (
    <svg {...baseProps} className={className}>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  );
}

export function CloseIcon({ className }: IconProps) {
  return (
    <svg {...baseProps} className={className}>
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </svg>
  );
}

export function MailIcon({ className }: IconProps) {
  return (
    <svg {...baseProps} className={className}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M4 8l8 6 8-6" />
    </svg>
  );
}

export function UserIcon({ className }: IconProps) {
  return (
    <svg {...baseProps} className={className}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 19c1.8-3 4.3-4.5 7-4.5s5.2 1.5 7 4.5" />
    </svg>
  );
}

export function UploadIcon({ className }: IconProps) {
  return (
    <svg {...baseProps} className={className}>
      <path d="M12 16V4" />
      <path d="M8 8l4-4 4 4" />
      <path d="M5 20h14" />
    </svg>
  );
}

export function TagIcon({ className }: IconProps) {
  return (
    <svg {...baseProps} className={className}>
      <path d="M20 13l-7 7-9-9V4h7z" />
      <circle cx="8.5" cy="8.5" r="1.2" />
    </svg>
  );
}

export function ArtworkIcon({ className }: IconProps) {
  return (
    <svg {...baseProps} className={className}>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
      <circle cx="9" cy="10" r="1.5" />
      <path d="M7 16l3.4-3.4a1.2 1.2 0 0 1 1.7 0L14 14.5l1.4-1.4a1.2 1.2 0 0 1 1.7 0L19 15" />
    </svg>
  );
}

export function PhoneIcon({ className }: IconProps) {
  return (
    <svg {...baseProps} className={className}>
      <path d="M6.5 4.5h3l1.2 3.2-1.8 1.7a15 15 0 0 0 5.6 5.6l1.7-1.8 3.3 1.2v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4.5 6.7a2 2 0 0 1 2-2.2z" />
    </svg>
  );
}

export function MessageSquareIcon({ className }: IconProps) {
  return (
    <svg {...baseProps} className={className}>
      <path d="M5 6.5h14a2 2 0 0 1 2 2V16a2 2 0 0 1-2 2H9l-5 3v-3H5a2 2 0 0 1-2-2V8.5a2 2 0 0 1 2-2z" />
    </svg>
  );
}

export function PercentIcon({ className }: IconProps) {
  return (
    <svg {...baseProps} className={className}>
      <path d="M5 19L19 5" />
      <circle cx="7.5" cy="7.5" r="2" />
      <circle cx="16.5" cy="16.5" r="2" />
    </svg>
  );
}
