import type { CartArtworkItem, CartEventName, CartSnapshot } from "./cart-types";
import { calculateCartSubtotal } from "./cart-types";
import { getSupabaseAdmin } from "./supabase-server";

type CustomerIdentity = {
  userId: string;
  email: string;
};

const ACTIVE_CART_STATUS = "active";
const ABANDONED_DELAY_HOURS = 3;
const resendApiKey = process.env.RESEND_API_KEY;
const resendFromEmail = process.env.RESEND_FROM_EMAIL ?? "ARTWURK <onboarding@resend.dev>";

const normalizeEmail = (email?: string) => email?.trim().toLowerCase();

const toCartItem = (row: Record<string, any>): CartArtworkItem => ({
  artworkId: row.artwork_id,
  displayId: row.display_id ?? undefined,
  title: row.title,
  image: row.image ?? undefined,
  dimensions: row.dimensions ?? undefined,
  priceLabel: row.price_label ?? "Price on request",
  unitAmount: row.unit_amount === null || row.unit_amount === undefined ? null : Number(row.unit_amount),
  quantity: row.quantity ?? 1,
});

const serializeCart = (session: Record<string, any>, items: Record<string, any>[]): CartSnapshot => ({
  id: session.id,
  status: session.status,
  subtotal: Number(session.subtotal ?? 0),
  currency: "USD",
  items: items.map(toCartItem),
});

export const getOrCreateCustomerCart = async (customer: CustomerIdentity) => {
  const supabase = getSupabaseAdmin();

  const existing = await supabase
    .from("artwurk_cart_sessions")
    .select("*")
    .eq("user_id", customer.userId)
    .eq("status", ACTIVE_CART_STATUS)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing.error) {
    throw existing.error;
  }

  if (existing.data) {
    return existing.data;
  }

  const created = await supabase
    .from("artwurk_cart_sessions")
    .insert({
      user_id: customer.userId,
      email: normalizeEmail(customer.email),
      status: ACTIVE_CART_STATUS,
      abandoned_after: new Date(Date.now() + ABANDONED_DELAY_HOURS * 60 * 60 * 1000).toISOString(),
    })
    .select("*")
    .single();

  if (created.error) {
    throw created.error;
  }

  return created.data;
};

export const recordCartEvent = async ({
  sessionId,
  customer,
  eventName,
  artworkId,
  payload,
}: {
  sessionId?: string;
  customer?: CustomerIdentity;
  eventName: CartEventName;
  artworkId?: string;
  payload?: Record<string, unknown>;
}) => {
  const { error } = await getSupabaseAdmin().from("artwurk_cart_events").insert({
    session_id: sessionId,
    user_id: customer?.userId,
    email: normalizeEmail(customer?.email),
    event_name: eventName,
    artwork_id: artworkId,
    payload: payload ?? {},
  });

  if (error) {
    throw error;
  }
};

const refreshCartTotals = async (sessionId: string) => {
  const supabase = getSupabaseAdmin();
  const itemsResult = await supabase
    .from("artwurk_cart_items")
    .select("*")
    .eq("session_id", sessionId)
    .eq("status", "active")
    .order("created_at", { ascending: true });

  if (itemsResult.error) {
    throw itemsResult.error;
  }

  const items = itemsResult.data ?? [];
  const subtotal = calculateCartSubtotal(items.map(toCartItem));

  const sessionResult = await supabase
    .from("artwurk_cart_sessions")
    .update({
      subtotal,
      last_activity_at: new Date().toISOString(),
      abandoned_after: new Date(Date.now() + ABANDONED_DELAY_HOURS * 60 * 60 * 1000).toISOString(),
    })
    .eq("id", sessionId)
    .select("*")
    .single();

  if (sessionResult.error) {
    throw sessionResult.error;
  }

  return serializeCart(sessionResult.data, items);
};

export const getCustomerCartSnapshot = async (customer: CustomerIdentity) => {
  const session = await getOrCreateCustomerCart(customer);
  return refreshCartTotals(session.id);
};

export const mergeCustomerCart = async (customer: CustomerIdentity, items: CartArtworkItem[]) => {
  const session = await getOrCreateCustomerCart(customer);
  const supabase = getSupabaseAdmin();

  for (const item of items) {
    await supabase.from("artwurk_cart_items").upsert(
      {
        session_id: session.id,
        artwork_id: item.artworkId,
        display_id: item.displayId,
        title: item.title,
        image: item.image,
        dimensions: item.dimensions,
        price_label: item.priceLabel,
        unit_amount: item.unitAmount,
        quantity: Math.max(1, item.quantity || 1),
        status: "active",
      },
      { onConflict: "session_id,artwork_id" },
    );
  }

  await recordCartEvent({
    sessionId: session.id,
    customer,
    eventName: "cart_merge",
    payload: { itemCount: items.length },
  });

  return refreshCartTotals(session.id);
};

export const addCustomerCartItem = async (customer: CustomerIdentity, item: CartArtworkItem) => {
  const session = await getOrCreateCustomerCart(customer);
  const supabase = getSupabaseAdmin();

  const result = await supabase.from("artwurk_cart_items").upsert(
    {
      session_id: session.id,
      artwork_id: item.artworkId,
      display_id: item.displayId,
      title: item.title,
      image: item.image,
      dimensions: item.dimensions,
      price_label: item.priceLabel,
      unit_amount: item.unitAmount,
      quantity: 1,
      status: "active",
      metadata: { oneOfOne: true },
    },
    { onConflict: "session_id,artwork_id" },
  );

  if (result.error) {
    throw result.error;
  }

  await recordCartEvent({
    sessionId: session.id,
    customer,
    eventName: "cart_add",
    artworkId: item.artworkId,
    payload: { item },
  });

  await queueAbandonedCartFollowup(customer, session.id);

  return refreshCartTotals(session.id);
};

export const removeCustomerCartItem = async (customer: CustomerIdentity, artworkId: string) => {
  const session = await getOrCreateCustomerCart(customer);
  const result = await getSupabaseAdmin()
    .from("artwurk_cart_items")
    .delete()
    .eq("session_id", session.id)
    .eq("artwork_id", artworkId);

  if (result.error) {
    throw result.error;
  }

  await recordCartEvent({
    sessionId: session.id,
    customer,
    eventName: "cart_remove",
    artworkId,
  });

  return refreshCartTotals(session.id);
};

export const markCheckoutStarted = async (customer: CustomerIdentity) => {
  const session = await getOrCreateCustomerCart(customer);
  await getSupabaseAdmin()
    .from("artwurk_cart_sessions")
    .update({ status: "checkout_started", last_activity_at: new Date().toISOString() })
    .eq("id", session.id);

  await recordCartEvent({
    sessionId: session.id,
    customer,
    eventName: "checkout_start",
  });

  return refreshCartTotals(session.id);
};

export const queueAbandonedCartFollowup = async (customer: CustomerIdentity, sessionId: string) => {
  const email = normalizeEmail(customer.email);

  if (!email) {
    return;
  }

  await getSupabaseAdmin().from("artwurk_cart_followups").upsert(
    {
      session_id: sessionId,
      user_id: customer.userId,
      email,
      type: "abandoned_cart",
      status: "queued",
      scheduled_for: new Date(Date.now() + ABANDONED_DELAY_HOURS * 60 * 60 * 1000).toISOString(),
      payload: {
        tone: "premium_collector_followup",
        delayHours: ABANDONED_DELAY_HOURS,
      },
    },
    { onConflict: "session_id,type" },
  );

  await recordCartEvent({
    sessionId,
    customer,
    eventName: "abandoned_followup_queued",
    payload: { delayHours: ABANDONED_DELAY_HOURS },
  });
};

export const getCartCrmData = async () => {
  const supabase = getSupabaseAdmin();
  const [sessions, items, events, followups, emails, collectors] = await Promise.all([
    supabase
      .from("artwurk_cart_sessions")
      .select("*")
      .order("last_activity_at", { ascending: false })
      .limit(200),
    supabase.from("artwurk_cart_items").select("*").order("created_at", { ascending: false }).limit(500),
    supabase.from("artwurk_cart_events").select("*").order("created_at", { ascending: false }).limit(500),
    supabase
      .from("artwurk_cart_followups")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200),
    supabase
      .from("artwurk_customer_email_deliveries")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200),
    supabase
      .from("artwurk_collectors")
      .select("id,email,name,first_name,last_name,display_name,phone,marketing_consent,sms_consent,source,status,created_at")
      .order("created_at", { ascending: false })
      .limit(500),
  ]);

  for (const result of [sessions, items, events, followups, emails, collectors]) {
    if (result.error) {
      throw result.error;
    }
  }

  const itemsBySession = new Map<string, Record<string, any>[]>();
  (items.data ?? []).forEach((item) => {
    const list = itemsBySession.get(item.session_id) ?? [];
    list.push(item);
    itemsBySession.set(item.session_id, list);
  });

  return {
    carts: (sessions.data ?? []).map((session) => ({
      id: session.id,
      userId: session.user_id,
      email: session.email,
      status: session.status,
      subtotal: Number(session.subtotal ?? 0),
      currency: session.currency ?? "USD",
      lastActivityAt: session.last_activity_at,
      abandonedAfter: session.abandoned_after,
      createdAt: session.created_at,
      items: (itemsBySession.get(session.id) ?? []).map((item) => ({
        id: item.id,
        artworkId: item.artwork_id,
        displayId: item.display_id,
        title: item.title,
        image: item.image,
        dimensions: item.dimensions,
        priceLabel: item.price_label,
        unitAmount: item.unit_amount === null ? null : Number(item.unit_amount),
        quantity: item.quantity,
        status: item.status,
      })),
    })),
    cartEvents: (events.data ?? []).map((event) => ({
      id: event.id,
      sessionId: event.session_id,
      email: event.email,
      eventName: event.event_name,
      artworkId: event.artwork_id,
      payload: event.payload ?? {},
      createdAt: event.created_at,
    })),
    cartFollowups: (followups.data ?? []).map((followup) => ({
      id: followup.id,
      sessionId: followup.session_id,
      email: followup.email,
      type: followup.type,
      status: followup.status,
      resendMessageId: followup.resend_message_id,
      errorMessage: followup.error_message,
      scheduledFor: followup.scheduled_for,
      sentAt: followup.sent_at,
      createdAt: followup.created_at,
    })),
    customerEmails: (emails.data ?? []).map((email) => ({
      id: email.id,
      email: email.email,
      type: email.type,
      status: email.status,
      resendMessageId: email.resend_message_id,
      errorMessage: email.error_message,
      sentAt: email.sent_at,
      createdAt: email.created_at,
    })),
    collectors: (collectors.data ?? []).map((collector) => ({
      id: collector.id,
      email: collector.email,
      name: collector.name,
      firstName: collector.first_name,
      lastName: collector.last_name,
      displayName: collector.display_name,
      phone: collector.phone,
      marketingConsent: Boolean(collector.marketing_consent),
      smsConsent: Boolean(collector.sms_consent),
      source: collector.source,
      status: collector.status,
      createdAt: collector.created_at,
    })),
  };
};

export const processDueAbandonedCartFollowups = async () => {
  const supabase = getSupabaseAdmin();
  const dueResult = await supabase
    .from("artwurk_cart_followups")
    .select("*")
    .eq("status", "queued")
    .lte("scheduled_for", new Date().toISOString())
    .limit(25);

  if (dueResult.error) {
    throw dueResult.error;
  }

  const results = [];

  for (const followup of dueResult.data ?? []) {
    const sessionResult = followup.session_id
      ? await supabase
          .from("artwurk_cart_sessions")
          .select("*")
          .eq("id", followup.session_id)
          .maybeSingle()
      : { data: null, error: null };

    if (sessionResult.error) {
      throw sessionResult.error;
    }

    const session = sessionResult.data;
    const itemsResult = session?.id
      ? await supabase
          .from("artwurk_cart_items")
          .select("*")
          .eq("session_id", session.id)
          .eq("status", "active")
      : { data: [], error: null };

    if (itemsResult.error) {
      throw itemsResult.error;
    }

    const items = itemsResult.data ?? [];

    if (!followup.email || !items.length || session?.status !== ACTIVE_CART_STATUS) {
      await supabase
        .from("artwurk_cart_followups")
        .update({
          status: "skipped",
          error_message: "No active cart items or email available.",
        })
        .eq("id", followup.id);
      results.push({ id: followup.id, status: "skipped" });
      continue;
    }

    if (!resendApiKey) {
      await supabase
        .from("artwurk_cart_followups")
        .update({
          status: "missing_email_provider",
          error_message: "RESEND_API_KEY is not configured.",
        })
        .eq("id", followup.id);
      results.push({ id: followup.id, status: "missing_email_provider" });
      continue;
    }

    const firstItem = items[0];
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: resendFromEmail,
        to: followup.email,
        subject: `Private ARTWURK follow-up: ${firstItem.title}`,
        html: `
          <div style="font-family: Georgia, 'Times New Roman', serif; background:#050505; color:#f7f2e8; padding:32px;">
            <div style="max-width:640px; margin:0 auto; border:1px solid rgba(212,175,55,0.28); padding:28px;">
              <p style="color:#d4af37; letter-spacing:0.22em; text-transform:uppercase; font-size:12px;">Collector Follow-Up</p>
              <h1 style="font-size:30px; margin:12px 0;">${firstItem.title} is still in your ARTWURK cart</h1>
              <p style="line-height:1.8;">A private note from ARTWURK: the original work you selected remains in your collector cart. If you would like availability notes, invoice support, or reservation guidance, Hammer HQ can assist directly.</p>
              <p style="line-height:1.8;"><a href="https://artwurk.net/cart" style="color:#d4af37;">Return to your cart</a></p>
              <p style="line-height:1.8; color:rgba(247,242,232,0.68);">You are receiving this because you added artwork to your ARTWURK cart. Preference and unsubscribe controls are being prepared for future releases.</p>
            </div>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      await supabase
        .from("artwurk_cart_followups")
        .update({
          status: "failed",
          error_message: errorText,
        })
        .eq("id", followup.id);
      results.push({ id: followup.id, status: "failed" });
      continue;
    }

    const responseBody = (await response.json().catch(() => null)) as { id?: string } | null;
    await supabase
      .from("artwurk_cart_followups")
      .update({
        status: "sent",
        resend_message_id: responseBody?.id ?? null,
        error_message: null,
        sent_at: new Date().toISOString(),
      })
      .eq("id", followup.id);

    await recordCartEvent({
      sessionId: session.id,
      customer: session.user_id && followup.email ? { userId: session.user_id, email: followup.email } : undefined,
      eventName: "abandoned_followup_sent",
      payload: { followupId: followup.id, resendMessageId: responseBody?.id ?? null },
    });

    results.push({ id: followup.id, status: "sent", resendMessageId: responseBody?.id ?? null });
  }

  return results;
};
