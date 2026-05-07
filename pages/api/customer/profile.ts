import type { NextApiRequest, NextApiResponse } from "next";

import { upsertCollector } from "../../../lib/crm-database";
import { verifyCustomerAccessToken } from "../../../lib/customer-auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed." });
  }

  let customer;

  try {
    customer = await verifyCustomerAccessToken(req);
  } catch (issue) {
    return res.status(401).json({
      ok: false,
      error: issue instanceof Error ? issue.message : "Customer session is required.",
    });
  }

  try {
    const {
      firstName,
      lastName,
      displayName,
      phone,
      marketingConsent,
      smsConsent,
      source,
    } = req.body ?? {};

    const name =
      typeof displayName === "string" && displayName.trim()
        ? displayName.trim()
        : [firstName, lastName].filter(Boolean).join(" ").trim();

    const collector = await upsertCollector({
      email: customer.email,
      name,
      firstName,
      lastName,
      displayName,
      phone,
      source: source ?? "collector-profile",
      status: "active",
      marketingConsent: Boolean(marketingConsent),
      smsConsent: Boolean(smsConsent),
      metadata: {
        userId: customer.id,
        profileUpdatedAt: new Date().toISOString(),
      },
    });

    return res.status(200).json({ ok: true, collector });
  } catch (issue) {
    return res.status(503).json({
      ok: false,
      error: issue instanceof Error ? issue.message : "Unable to save profile.",
    });
  }
}
