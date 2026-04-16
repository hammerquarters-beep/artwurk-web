import type {
  ArtwurkEventPayload,
  ArtwurkInquiryPayload,
  ArtwurkLeadPayload,
} from "./tracking";

const CRM_STORAGE_KEYS = {
  events: "artwurk.crm.events",
  inquiries: "artwurk.crm.inquiries",
  leads: "artwurk.crm.leads",
} as const;

const CRM_STORAGE_LIMIT = 250;

const isBrowser = () =>
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const readCollection = <T>(key: string): T[] => {
  if (!isBrowser()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(key);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as T[];

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeCollection = <T>(key: string, items: T[]) => {
  if (!isBrowser()) {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(items.slice(0, CRM_STORAGE_LIMIT)));
  } catch {
    // Ignore storage failures so CRM tracking never breaks the storefront.
  }
};

const appendCollectionItem = <T>(key: string, item: T) => {
  const nextItems = [item, ...readCollection<T>(key)].slice(0, CRM_STORAGE_LIMIT);
  writeCollection(key, nextItems);
};

export const appendStoredEvent = (payload: ArtwurkEventPayload) => {
  appendCollectionItem(CRM_STORAGE_KEYS.events, payload);
};

export const appendStoredInquiry = (payload: ArtwurkInquiryPayload) => {
  appendCollectionItem(CRM_STORAGE_KEYS.inquiries, payload);
};

export const appendStoredLead = (payload: ArtwurkLeadPayload) => {
  appendCollectionItem(CRM_STORAGE_KEYS.leads, payload);
};

export const getStoredEvents = () => readCollection<ArtwurkEventPayload>(CRM_STORAGE_KEYS.events);

export const getStoredInquiries = () =>
  readCollection<ArtwurkInquiryPayload>(CRM_STORAGE_KEYS.inquiries);

export const getStoredLeads = () => readCollection<ArtwurkLeadPayload>(CRM_STORAGE_KEYS.leads);

export const getCrmSnapshot = () => ({
  events: getStoredEvents(),
  inquiries: getStoredInquiries(),
  leads: getStoredLeads(),
});

export const clearCrmSnapshot = () => {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(CRM_STORAGE_KEYS.events);
  window.localStorage.removeItem(CRM_STORAGE_KEYS.inquiries);
  window.localStorage.removeItem(CRM_STORAGE_KEYS.leads);
};
