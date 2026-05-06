import { upsertCollector, upsertEmailSignup } from "../../lib/crm-database";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { email, name, phone, source } = req.body ?? {};

  try {
    const customer = await upsertCollector({
      email,
      name,
      phone,
      source: source ?? "customer_api",
      metadata: {
        firstTimeBuyer: true,
      },
    });

    await upsertEmailSignup({
      email,
      name,
      source: source ?? "customer_api",
      metadata: {
        firstTimeBuyer: true,
      },
    });

    return res.status(200).json({ success: true, customer });
  } catch (issue) {
    return res.status(503).json({
      success: false,
      error: issue instanceof Error ? issue.message : "Unable to persist customer",
    });
  }
}
