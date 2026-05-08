import type { NextApiRequest, NextApiResponse } from "next";

import { getPayPalClientId, getPayPalSdkUrl, isPayPalConfigured } from "../../../lib/paypal";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method not allowed." });
  }

  return res.status(200).json({
    ok: true,
    configured: isPayPalConfigured(),
    clientId: getPayPalClientId(),
    sdkUrl: getPayPalSdkUrl(),
    environment: process.env.PAYPAL_ENV === "live" ? "live" : "sandbox",
  });
}
