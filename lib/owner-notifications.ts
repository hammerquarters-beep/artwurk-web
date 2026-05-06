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
  const notification = {
    type,
    recipient_email: ownerNotificationEmail,
    subject,
    payload: payload ?? {},
    status: resendApiKey ? "queued" : "missing_email_provider",
  };

  if (isSupabaseConfigured()) {
    await getSupabaseAdmin().from("artwurk_owner_notifications").insert(notification);
  }

  if (!resendApiKey) {
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
    return {
      sent: false,
      reason: errorText,
    };
  }

  return {
    sent: true,
  };
};
