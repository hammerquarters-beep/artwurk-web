import { getSupabaseAdmin } from "./supabase-server";

const resendApiKey = process.env.RESEND_API_KEY;
const resendFromEmail = process.env.RESEND_FROM_EMAIL ?? "ARTWURK <onboarding@resend.dev>";

type CustomerEmailInput = {
  userId?: string;
  email: string;
  displayName?: string;
};

const normalizeEmail = (email?: string) => email?.trim().toLowerCase();

export const sendWelcomeEmailOnce = async ({
  userId,
  email,
  displayName,
}: CustomerEmailInput) => {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    throw new Error("Customer email is required.");
  }

  const supabase = getSupabaseAdmin();
  const existing = await supabase
    .from("artwurk_customer_email_deliveries")
    .select("*")
    .eq("email", normalizedEmail)
    .eq("type", "welcome")
    .maybeSingle();

  if (existing.error) {
    throw existing.error;
  }

  if (existing.data?.status === "sent") {
    return {
      skipped: true,
      reason: "Welcome email already sent.",
      delivery: existing.data,
    };
  }

  const delivery = await supabase
    .from("artwurk_customer_email_deliveries")
    .upsert(
      {
        user_id: userId,
        email: normalizedEmail,
        type: "welcome",
        status: resendApiKey ? "queued" : "missing_email_provider",
        payload: { displayName },
      },
      { onConflict: "email,type" },
    )
    .select("*")
    .single();

  if (delivery.error) {
    throw delivery.error;
  }

  if (!resendApiKey) {
    await supabase
      .from("artwurk_customer_email_deliveries")
      .update({
        status: "missing_email_provider",
        error_message: "RESEND_API_KEY is not configured.",
      })
      .eq("id", delivery.data.id);

    return {
      skipped: false,
      sent: false,
      reason: "RESEND_API_KEY is not configured.",
    };
  }

  const greeting = displayName ? `Hello ${displayName},` : "Hello,";
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: resendFromEmail,
      to: normalizedEmail,
      subject: "Welcome to ARTWURK™",
      html: `
        <div style="font-family: Georgia, 'Times New Roman', serif; background:#050505; color:#f7f2e8; padding:32px;">
          <div style="max-width:640px; margin:0 auto; border:1px solid rgba(212,175,55,0.28); padding:28px;">
            <p style="color:#d4af37; letter-spacing:0.22em; text-transform:uppercase; font-size:12px;">Private Collector Access</p>
            <h1 style="font-size:34px; margin:12px 0;">Welcome to ARTWURK™</h1>
            <p style="line-height:1.8;">${greeting}</p>
            <p style="line-height:1.8;">Thank you for joining the ARTWURK™ family. ARTWURK is built as a private collector-focused platform for original artwork, direct acquisition support, and premium appraisal services through Hammer HQ LLC.</p>
            <p style="line-height:1.8;">You can return to the collection anytime to review available works, reserve a piece, or request private follow-up.</p>
            <p style="line-height:1.8; color:rgba(247,242,232,0.68);">You are receiving this because you created an ARTWURK collector profile. Preference and unsubscribe controls are being prepared for future releases.</p>
          </div>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    await supabase
      .from("artwurk_customer_email_deliveries")
      .update({
        status: "failed",
        error_message: errorText,
      })
      .eq("id", delivery.data.id);

    return {
      sent: false,
      reason: errorText,
    };
  }

  const responseBody = (await response.json().catch(() => null)) as { id?: string } | null;
  const resendMessageId = responseBody?.id ?? null;

  await supabase
    .from("artwurk_customer_email_deliveries")
    .update({
      status: "sent",
      resend_message_id: resendMessageId,
      error_message: null,
      sent_at: new Date().toISOString(),
    })
    .eq("id", delivery.data.id);

  await supabase
    .from("artwurk_collectors")
    .update({ welcome_email_sent_at: new Date().toISOString() })
    .eq("email", normalizedEmail);

  return {
    sent: true,
    resendMessageId,
  };
};
