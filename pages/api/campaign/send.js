export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { senderEmail, subject, message, sms, audience } = req.body ?? {};

  console.log("EMAIL BLAST:", { senderEmail, subject, message, audience });
  console.log("SMS BLAST:", { sms, audience });

  return res.status(200).json({ success: true });
}
