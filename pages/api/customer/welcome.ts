import type { NextApiRequest, NextApiResponse } from "next";

import { verifyCustomerAccessToken } from "../../../lib/customer-auth";
import { sendWelcomeEmailOnce } from "../../../lib/customer-emails";

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
    const displayName =
      typeof req.body?.displayName === "string" ? req.body.displayName : undefined;

    const result = await sendWelcomeEmailOnce({
      userId: customer.id,
      email: customer.email ?? "",
      displayName,
    });

    return res.status(200).json({ ok: true, result });
  } catch (issue) {
    return res.status(503).json({
      ok: false,
      error: issue instanceof Error ? issue.message : "Unable to send welcome email.",
    });
  }
}
