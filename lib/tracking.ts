import {
  appendStoredEvent,
  appendStoredInquiry,
  appendStoredLead,
} from "./crm-store";

export type ArtwurkEventName =
  | "landing_page_view"
  | "view_collection_click"
  | "artwork_click"
  | "modal_open"
  | "inquire_click";

export type ArtworkTrackingRecord = {
  id: string;
  displayId?: string;
  name: string;
  price: string;
  dimensions: string;
  category?: string;
  status?: string;
};

export type ArtwurkEventPayload = {
  event: ArtwurkEventName;
  occurredAt: string;
  route: string;
  page: string;
  source: string;
  artwork?: ArtworkTrackingRecord;
  metadata?: Record<string, unknown>;
};

export type ArtwurkInquiryPayload = {
  type: "artwork_inquiry";
  occurredAt: string;
  route: string;
  page: string;
  source: string;
  artwork: ArtworkTrackingRecord;
  inquiry: {
    channel: "email";
    destination: string;
    whatsappLabel?: string;
    whatsappNumber?: string;
  };
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
    message?: string;
  };
  metadata?: Record<string, unknown>;
};

export type ArtwurkLeadPayload = {
  type: "lead_capture";
  occurredAt: string;
  route: string;
  page: string;
  source: string;
  status: "new";
  artwork?: ArtworkTrackingRecord;
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  metadata?: Record<string, unknown>;
};

const postJson = async <T>(url: string, payload: T) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch {
    // Intentionally swallow network errors for non-blocking analytics.
  }
};

const postWithBeacon = <T>(url: string, payload: T) => {
  if (
    typeof window === "undefined" ||
    typeof navigator === "undefined" ||
    typeof navigator.sendBeacon !== "function"
  ) {
    return false;
  }

  try {
    const blob = new Blob([JSON.stringify(payload)], {
      type: "application/json",
    });

    return navigator.sendBeacon(url, blob);
  } catch {
    return false;
  }
};

const dispatchPayload = <T>(url: string, payload: T) => {
  const sentWithBeacon = postWithBeacon(url, payload);

  if (!sentWithBeacon) {
    void postJson(url, payload);
  }
};

export const trackEvent = (payload: Omit<ArtwurkEventPayload, "occurredAt">) => {
  const nextPayload: ArtwurkEventPayload = {
    ...payload,
    occurredAt: new Date().toISOString(),
  };

  appendStoredEvent(nextPayload);
  dispatchPayload("/api/events", nextPayload);
};

export const trackInquiry = (
  payload: Omit<ArtwurkInquiryPayload, "occurredAt" | "type">,
) => {
  const nextPayload: ArtwurkInquiryPayload = {
    ...payload,
    type: "artwork_inquiry",
    occurredAt: new Date().toISOString(),
  };

  appendStoredInquiry(nextPayload);
  dispatchPayload("/api/inquiries", nextPayload);
};

export const trackLead = (
  payload: Omit<ArtwurkLeadPayload, "occurredAt" | "type" | "status">,
) => {
  const nextPayload: ArtwurkLeadPayload = {
    ...payload,
    type: "lead_capture",
    status: "new",
    occurredAt: new Date().toISOString(),
  };

  appendStoredLead(nextPayload);
  dispatchPayload("/api/leads", nextPayload);
};
