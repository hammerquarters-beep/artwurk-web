import os from "os";
import path from "path";
import { promises as fs } from "fs";

import type {
  ArtwurkCrmSnapshot,
  ArtwurkEventPayload,
  ArtwurkInquiryPayload,
  ArtwurkLeadPayload,
  LeadStatus,
} from "./crm-types";

const STORE_PATH = path.join(os.tmpdir(), "artwurk-crm-store.json");
const STORE_LIMIT = 500;

const emptySnapshot = (): ArtwurkCrmSnapshot => ({
  events: [],
  inquiries: [],
  leads: [],
});

const normalizeSnapshot = (input?: Partial<ArtwurkCrmSnapshot>): ArtwurkCrmSnapshot => ({
  events: Array.isArray(input?.events) ? input.events : [],
  inquiries: Array.isArray(input?.inquiries) ? input.inquiries : [],
  leads: Array.isArray(input?.leads) ? input.leads : [],
});

const readStore = async () => {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    return normalizeSnapshot(JSON.parse(raw) as Partial<ArtwurkCrmSnapshot>);
  } catch {
    return emptySnapshot();
  }
};

const writeStore = async (snapshot: ArtwurkCrmSnapshot) => {
  await fs.writeFile(
    STORE_PATH,
    JSON.stringify(
      {
        events: snapshot.events.slice(0, STORE_LIMIT),
        inquiries: snapshot.inquiries.slice(0, STORE_LIMIT),
        leads: snapshot.leads.slice(0, STORE_LIMIT),
      },
      null,
      2,
    ),
    "utf8",
  );
};

export const getCrmSnapshot = async () => readStore();

export const clearCrmSnapshot = async () => {
  await writeStore(emptySnapshot());
};

export const appendServerEvent = async (payload: ArtwurkEventPayload) => {
  const snapshot = await readStore();
  snapshot.events = [payload, ...snapshot.events].slice(0, STORE_LIMIT);
  await writeStore(snapshot);
  return payload;
};

export const appendServerInquiry = async (payload: ArtwurkInquiryPayload) => {
  const snapshot = await readStore();
  snapshot.inquiries = [payload, ...snapshot.inquiries].slice(0, STORE_LIMIT);
  await writeStore(snapshot);
  return payload;
};

export const appendServerLead = async (payload: ArtwurkLeadPayload) => {
  const snapshot = await readStore();
  snapshot.leads = [payload, ...snapshot.leads].slice(0, STORE_LIMIT);
  await writeStore(snapshot);
  return payload;
};

export const updateInquiryStatus = async (id: string, status: LeadStatus) => {
  const snapshot = await readStore();
  snapshot.inquiries = snapshot.inquiries.map((item) =>
    item.id === id ? { ...item, status } : item,
  );
  await writeStore(snapshot);
  return snapshot.inquiries.find((item) => item.id === id) ?? null;
};

export const updateLeadStatus = async (id: string, status: LeadStatus) => {
  const snapshot = await readStore();
  snapshot.leads = snapshot.leads.map((item) => (item.id === id ? { ...item, status } : item));
  await writeStore(snapshot);
  return snapshot.leads.find((item) => item.id === id) ?? null;
};
