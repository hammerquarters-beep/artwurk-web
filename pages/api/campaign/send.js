import { getSupabaseAdmin } from "../../../lib/supabase-server";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { senderEmail, subject, message, sms, audience, channel } = req.body ?? {};

  try {
    const { data, error } = await getSupabaseAdmin()
      .from("artwurk_campaigns")
      .insert({
        sender_email: senderEmail,
        subject,
        message,
        sms,
        audience: audience ?? "all_clients",
        channel,
        status: "queued",
        payload: req.body ?? {},
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return res.status(200).json({ success: true, campaign: data });
  } catch (issue) {
    return res.status(503).json({
      success: false,
      error: issue instanceof Error ? issue.message : "Unable to persist campaign",
    });
  }
}
