import { appendOrder } from "../../lib/crm-database";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { artwork, amount, email } = req.body ?? {};

  if (!artwork || !amount) {
    return res.status(400).json({
      success: false,
      error: "Artwork and amount are required",
    });
  }

  try {
    const sale = await appendOrder({
      artwork,
      amount: Number(amount),
      email,
      status: "paid",
      soldAt: new Date().toISOString(),
      raw: req.body,
    });

    return res.status(200).json({ success: true, sale });
  } catch (issue) {
    return res.status(503).json({
      success: false,
      error: issue instanceof Error ? issue.message : "Unable to persist sale",
    });
  }
}
