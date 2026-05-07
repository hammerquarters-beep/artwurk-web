import type {
  ArtwurkCrmSnapshot,
  ArtwurkEventPayload,
  ArtwurkInquiryPayload,
  ArtwurkLeadPayload,
  LeadStatus,
} from "./crm-types";
import { getCartCrmData } from "./cart-database";
import { sendOwnerNotification } from "./owner-notifications";
import { getSupabaseAdmin } from "./supabase-server";

type PayloadRow<T> = {
  payload: T;
};

type CollectorInput = {
  email?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  phone?: string;
  preferredContact?: string;
  source: string;
  status?: string;
  marketingConsent?: boolean;
  smsConsent?: boolean;
  metadata?: Record<string, unknown>;
};

type EmailSignupInput = {
  email?: string;
  name?: string;
  source: string;
  discountCode?: string;
  audience?: string;
  amountOffPercent?: number;
  metadata?: Record<string, unknown>;
};

const normalizeEmail = (email?: string) => email?.trim().toLowerCase();

const requirePayload = <T>(row: PayloadRow<T>) => row.payload;

export const getCrmSnapshot = async (): Promise<ArtwurkCrmSnapshot> => {
  const supabase = getSupabaseAdmin();

  const [eventsResult, inquiriesResult, leadsResult, cartData] = await Promise.all([
    supabase
      .from("artwurk_events")
      .select("payload")
      .order("occurred_at", { ascending: false })
      .limit(5000),
    supabase
      .from("artwurk_inquiries")
      .select("payload")
      .order("occurred_at", { ascending: false })
      .limit(5000),
    supabase
      .from("artwurk_leads")
      .select("payload")
      .order("occurred_at", { ascending: false })
      .limit(5000),
    getCartCrmData(),
  ]);

  if (eventsResult.error) {
    throw eventsResult.error;
  }

  if (inquiriesResult.error) {
    throw inquiriesResult.error;
  }

  if (leadsResult.error) {
    throw leadsResult.error;
  }

  return {
    events: ((eventsResult.data ?? []) as PayloadRow<ArtwurkEventPayload>[]).map(requirePayload),
    inquiries: ((inquiriesResult.data ?? []) as PayloadRow<ArtwurkInquiryPayload>[]).map(
      requirePayload,
    ),
    leads: ((leadsResult.data ?? []) as PayloadRow<ArtwurkLeadPayload>[]).map(requirePayload),
    ...cartData,
  };
};

export const clearCrmSnapshot = async () => {
  const supabase = getSupabaseAdmin();

  const [eventsResult, inquiriesResult, leadsResult] = await Promise.all([
    supabase.from("artwurk_events").delete().neq("id", ""),
    supabase.from("artwurk_inquiries").delete().neq("id", ""),
    supabase.from("artwurk_leads").delete().neq("id", ""),
  ]);

  if (eventsResult.error) {
    throw eventsResult.error;
  }

  if (inquiriesResult.error) {
    throw inquiriesResult.error;
  }

  if (leadsResult.error) {
    throw leadsResult.error;
  }
};

export const upsertCollector = async ({
  email,
  name,
  firstName,
  lastName,
  displayName,
  phone,
  preferredContact,
  source,
  status = "new",
  marketingConsent,
  smsConsent,
  metadata = {},
}: CollectorInput) => {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    return null;
  }

  const { data, error } = await getSupabaseAdmin()
    .from("artwurk_collectors")
    .upsert(
      {
        email: normalizedEmail,
        name,
        first_name: firstName,
        last_name: lastName,
        display_name: displayName,
        phone,
        preferred_contact: preferredContact,
        source,
        status,
        marketing_consent: marketingConsent,
        sms_consent: smsConsent,
        metadata,
      },
      { onConflict: "email" },
    )
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const upsertEmailSignup = async ({
  email,
  name,
  source,
  discountCode,
  audience,
  amountOffPercent,
  metadata = {},
}: EmailSignupInput) => {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    return null;
  }

  const { data, error } = await getSupabaseAdmin()
    .from("artwurk_email_signups")
    .upsert(
      {
        email: normalizedEmail,
        name,
        source,
        discount_code: discountCode,
        audience,
        amount_off_percent: amountOffPercent,
        status: "active",
        metadata,
      },
      { onConflict: "email" },
    )
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const getCollectors = async () => {
  const { data, error } = await getSupabaseAdmin()
    .from("artwurk_collectors")
    .select("name,email,first_name,last_name,display_name,phone,marketing_consent,sms_consent,status,source,created_at")
    .order("created_at", { ascending: false })
    .limit(1000);

  if (error) {
    throw error;
  }

  return (data ?? []).map((collector) => ({
    name: collector.name ?? "Collector",
    email: collector.email,
    firstName: collector.first_name,
    lastName: collector.last_name,
    displayName: collector.display_name,
    phone: collector.phone,
    marketingConsent: Boolean(collector.marketing_consent),
    smsConsent: Boolean(collector.sms_consent),
    status: collector.status ?? "new",
    source: collector.source ?? "unknown",
  }));
};

export const appendServerEvent = async (payload: ArtwurkEventPayload) => {
  const { error } = await getSupabaseAdmin().from("artwurk_events").insert({
    id: payload.id,
    event_name: payload.event,
    route: payload.route,
    page: payload.page,
    source: payload.source,
    occurred_at: payload.occurredAt,
    artwork: payload.artwork ?? null,
    context: payload.context,
    metadata: payload.metadata ?? {},
    payload,
  });

  if (error) {
    throw error;
  }

  return payload;
};

export const appendServerInquiry = async (payload: ArtwurkInquiryPayload) => {
  const email = normalizeEmail(payload.customer?.email);

  if (email) {
    await upsertCollector({
      email,
      name: payload.customer?.name,
      phone: payload.customer?.phone,
      preferredContact: payload.inquiry.preferredContact,
      source: payload.source,
      status: payload.status,
      metadata: {
        lastInquiryId: payload.id,
        intent: payload.intent,
      },
    });
  }

  const { error } = await getSupabaseAdmin().from("artwurk_inquiries").insert({
    id: payload.id,
    status: payload.status,
    intent: payload.intent,
    route: payload.route,
    page: payload.page,
    source: payload.source,
    occurred_at: payload.occurredAt,
    artwork: payload.artwork,
    inquiry: payload.inquiry,
    customer_email: email,
    customer_name: payload.customer?.name,
    customer_phone: payload.customer?.phone,
    customer_message: payload.customer?.message,
    context: payload.context,
    metadata: payload.metadata ?? {},
    payload,
  });

  if (error) {
    throw error;
  }

  await sendOwnerNotification({
    type: "inquiry",
    subject: `ARTWURK inquiry: ${payload.artwork.name}`,
    html: `<p>New ARTWURK inquiry for <strong>${payload.artwork.name}</strong>.</p><p>Email: ${email ?? "Not provided"}</p>`,
    payload: payload as unknown as Record<string, unknown>,
  });

  return payload;
};

export const appendServerLead = async (payload: ArtwurkLeadPayload) => {
  const email = normalizeEmail(payload.customer?.email);

  if (email) {
    await upsertCollector({
      email,
      name: payload.customer?.name,
      phone: payload.customer?.phone,
      preferredContact: payload.customer?.preferredContact,
      source: payload.source,
      status: payload.status,
      metadata: {
        lastLeadId: payload.id,
        intent: payload.intent,
      },
    });

    if (payload.source === "promo-popup") {
      await upsertEmailSignup({
        email,
        name: payload.customer?.name,
        source: payload.source,
        discountCode:
          typeof payload.metadata?.discountCode === "string"
            ? payload.metadata.discountCode
            : undefined,
        audience:
          typeof payload.metadata?.audience === "string" ? payload.metadata.audience : undefined,
        amountOffPercent:
          typeof payload.metadata?.amountOffPercent === "number"
            ? payload.metadata.amountOffPercent
            : undefined,
        metadata: payload.metadata,
      });
    }
  }

  const { error } = await getSupabaseAdmin().from("artwurk_leads").insert({
    id: payload.id,
    status: payload.status,
    intent: payload.intent,
    route: payload.route,
    page: payload.page,
    source: payload.source,
    occurred_at: payload.occurredAt,
    artwork: payload.artwork ?? null,
    customer_email: email,
    customer_name: payload.customer?.name,
    customer_phone: payload.customer?.phone,
    preferred_contact: payload.customer?.preferredContact,
    context: payload.context,
    metadata: payload.metadata ?? {},
    payload,
  });

  if (error) {
    throw error;
  }

  if (email) {
    await sendOwnerNotification({
      type: "signup",
      subject: `New ARTWURK signup: ${email}`,
      html: `<p>New ARTWURK signup captured.</p><p>Email: <strong>${email}</strong></p><p>Source: ${payload.source}</p>`,
      payload: payload as unknown as Record<string, unknown>,
    });
  }

  return payload;
};

export const updateInquiryStatus = async (id: string, status: LeadStatus) => {
  const snapshot = await getCrmSnapshot();
  const existing = snapshot.inquiries.find((item) => item.id === id);

  if (!existing) {
    return null;
  }

  const payload = { ...existing, status };
  const { error } = await getSupabaseAdmin()
    .from("artwurk_inquiries")
    .update({ status, payload })
    .eq("id", id);

  if (error) {
    throw error;
  }

  return payload;
};

export const updateLeadStatus = async (id: string, status: LeadStatus) => {
  const snapshot = await getCrmSnapshot();
  const existing = snapshot.leads.find((item) => item.id === id);

  if (!existing) {
    return null;
  }

  const payload = { ...existing, status };
  const { error } = await getSupabaseAdmin()
    .from("artwurk_leads")
    .update({ status, payload })
    .eq("id", id);

  if (error) {
    throw error;
  }

  return payload;
};

export const appendOrder = async (payload: {
  artwork: string;
  amount: number;
  email?: string;
  status?: string;
  soldAt?: string;
  raw?: Record<string, unknown>;
}) => {
  const { data, error } = await getSupabaseAdmin()
    .from("artwurk_orders")
    .insert({
      artwork: payload.artwork,
      amount: payload.amount,
      email: normalizeEmail(payload.email),
      status: payload.status ?? "paid",
      sold_at: payload.soldAt ?? new Date().toISOString(),
      payload: payload.raw ?? {},
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  await sendOwnerNotification({
    type: "order",
    subject: `ARTWURK order: ${payload.artwork}`,
    html: `<p>New ARTWURK order recorded.</p><p>${payload.artwork} - $${payload.amount}</p>`,
    payload: payload.raw,
  });

  return data;
};
