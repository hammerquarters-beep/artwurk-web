import { getSupabaseAdmin, isSupabaseConfigured } from "./supabase-server";

const ownerNotificationEmail =
  process.env.ARTWURK_OWNER_NOTIFICATION_EMAIL ?? "Hammer.quarters@gmail.com";
const resendApiKey = process.env.RESEND_API_KEY;
const resendFromEmail =
  process.env.RESEND_FROM_EMAIL ?? "ARTWURK <onboarding@resend.dev>";

type OwnerNotificationInput = {
  type: "signup" | "inquiry" | "order";
  subject: string;
  html: string;
  payload?: Record<string, unknown>;
};

export const getOwnerNotificationEmail = () => ownerNotificationEmail;

export const sendOwnerNotification = async ({
  type,
  subject,
  html,
  payload,
}: OwnerNotificationInput) => {
  const supabase = isSupabaseConfigured() ? getSupabaseAdmin() : null;
  const notification = {
    type,
    recipient_email: ownerNotificationEmail,
    subject,
    payload: payload ?? {},
    status: resendApiKey ? "queued" : "missing_email_provider",
  };
  let notificationId: string | null = null;

  if (supabase) {
    const { data, error } = await supabase
      .from("artwurk_owner_notifications")
      .insert(notification)
      .select("id")
      .single();

    if (error) {
      throw error;
    }

    notificationId = data?.id ?? null;
  }

  const updateNotification = async (fields: Record<string, unknown>) => {
    if (!supabase || !notificationId) {
      return;
    }

    const { error } = await supabase
      .from("artwurk_owner_notifications")
      .update(fields)
      .eq("id", notificationId);

    if (!error) {
      return;
    }

    // Production may receive the code before the delivery logging migration is applied.
    await supabase
      .from("artwurk_owner_notifications")
      .update({
        status: fields.status,
        delivery_status: fields.delivery_status ?? fields.status,
        payload: {
          ...(payload ?? {}),
          resend_message_id: fields.resend_message_id,
          error_message: fields.error_message,
          delivery_status: fields.status,
        },
      })
      .eq("id", notificationId);
  };

  if (!resendApiKey) {
    await updateNotification({
      status: "missing_email_provider",
      delivery_status: "missing_email_provider",
      error_message: "RESEND_API_KEY is not configured.",
    });

    return {
      sent: false,
      reason: "RESEND_API_KEY is not configured.",
    };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: resendFromEmail,
      to: ownerNotificationEmail,
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    await updateNotification({
      status: "failed",
      delivery_status: "failed",
      error_message: errorText,
    });

    return {
      sent: false,
      reason: errorText,
    };
  }

  const responseBody = (await response.json().catch(() => null)) as { id?: string } | null;
  const resendMessageId = responseBody?.id ?? null;

  await updateNotification({
    status: "sent",
    delivery_status: "sent",
    resend_message_id: resendMessageId,
    error_message: null,
    sent_at: new Date().toISOString(),
  });

  return {
    sent: true,
    resendMessageId,
  };
};
