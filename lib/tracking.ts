import {
  appendStoredEvent,
  appendStoredInquiry,
  appendStoredLead,
} from "./crm-store";
import type {
  ArtwurkEventPayload,
  ArtwurkInquiryPayload,
  ArtwurkLeadPayload,
  TrackingContext,
} from "./crm-types";

const VISITOR_ID_KEY = "artwurk.tracking.visitorId";
const SESSION_ID_KEY = "artwurk.tracking.sessionId";
const SESSION_TS_KEY = "artwurk.tracking.sessionTouchedAt";
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

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

const isBrowser = () =>
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const generateId = (prefix: string) =>
  `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;

const readStorage = (key: string) => {
  if (!isBrowser()) {
    return null;
  }

  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const writeStorage = (key: string, value: string) => {
  if (!isBrowser()) {
    return;
  }

  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore storage errors so storefront interactions remain uninterrupted.
  }
};

const getDeviceType = (): TrackingContext["deviceType"] => {
  if (typeof window === "undefined") {
    return "desktop";
  }

  const width = window.innerWidth;

  if (width <= 767) {
    return "mobile";
  }

  if (width <= 1024) {
    return "tablet";
  }

  return "desktop";
};

const getUtmParameters = () => {
  if (typeof window === "undefined") {
    return {};
  }

  const params = new URLSearchParams(window.location.search);

  return {
    source: params.get("utm_source") ?? undefined,
    medium: params.get("utm_medium") ?? undefined,
    campaign: params.get("utm_campaign") ?? undefined,
    term: params.get("utm_term") ?? undefined,
    content: params.get("utm_content") ?? undefined,
  };
};

export const getTrackingSessionState = () => {
  const now = Date.now();
  const visitorId = readStorage(VISITOR_ID_KEY) ?? generateId("visitor");
  const existingSessionId = readStorage(SESSION_ID_KEY);
  const touchedAt = Number(readStorage(SESSION_TS_KEY) ?? "0");
  const isSessionExpired = !existingSessionId || now - touchedAt > SESSION_TIMEOUT_MS;
  const sessionId = isSessionExpired ? generateId("session") : existingSessionId;
  const isReturningVisitor = Boolean(readStorage(VISITOR_ID_KEY));

  writeStorage(VISITOR_ID_KEY, visitorId);
  writeStorage(SESSION_ID_KEY, sessionId);
  writeStorage(SESSION_TS_KEY, String(now));

  return {
    visitorId,
    sessionId,
    isNewSession: isSessionExpired,
    isReturningVisitor,
  };
};

const buildTrackingContext = (): TrackingContext => {
  const { visitorId, sessionId } = getTrackingSessionState();

  return {
    visitorId,
    sessionId,
    deviceType: getDeviceType(),
    pathname: typeof window === "undefined" ? "/" : window.location.pathname,
    referrer: typeof document === "undefined" ? undefined : document.referrer || undefined,
    locale: typeof navigator === "undefined" ? undefined : navigator.language,
    userAgent: typeof navigator === "undefined" ? undefined : navigator.userAgent,
    utm: getUtmParameters(),
  };
};

export const trackEvent = (
  payload: Omit<ArtwurkEventPayload, "id" | "type" | "occurredAt" | "context">,
) => {
  const nextPayload: ArtwurkEventPayload = {
    ...payload,
    id: generateId("evt"),
    type: "event",
    occurredAt: new Date().toISOString(),
    context: buildTrackingContext(),
  };

  appendStoredEvent(nextPayload);
  dispatchPayload("/api/events", nextPayload);
  return nextPayload;
};

export const trackInquiry = (
  payload: Omit<ArtwurkInquiryPayload, "id" | "type" | "occurredAt" | "context">,
) => {
  const nextPayload: ArtwurkInquiryPayload = {
    ...payload,
    id: generateId("inq"),
    type: "artwork_inquiry",
    occurredAt: new Date().toISOString(),
    context: buildTrackingContext(),
  };

  appendStoredInquiry(nextPayload);
  dispatchPayload("/api/inquiries", nextPayload);
  return nextPayload;
};

export const trackLead = (
  payload: Omit<ArtwurkLeadPayload, "id" | "type" | "occurredAt" | "context">,
) => {
  const nextPayload: ArtwurkLeadPayload = {
    ...payload,
    id: generateId("lead"),
    type: "lead_capture",
    occurredAt: new Date().toISOString(),
    context: buildTrackingContext(),
  };

  appendStoredLead(nextPayload);
  dispatchPayload("/api/leads", nextPayload);
  return nextPayload;
};
