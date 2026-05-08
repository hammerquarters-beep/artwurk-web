import type { NextApiRequest, NextApiResponse } from "next";

import { getAccessTokenFromRequest, verifyCustomerAccessToken } from "../../../lib/customer-auth";
import { createPayPalOrder, type PayPalCheckoutItem } from "../../../lib/paypal";

const isPayPalCheckoutItem = (value: unknown): value is PayPalCheckoutItem => {
  const item = value as Partial<PayPalCheckoutItem>;
  return Boolean(item?.artworkId && typeof item.artworkId === "string");
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed." });
  }

  const items = Array.isArray(req.body?.items)
    ? req.body.items.filter(isPayPalCheckoutItem)
    : [];

  if (!items.length) {
    return res.status(400).json({ ok: false, error: "No artwork items were provided." });
  }

  let customerEmail =
    typeof req.body?.customerEmail === "string" ? req.body.customerEmail.trim().toLowerCase() : "";

  try {
    if (getAccessTokenFromRequest(req)) {
      const customer = await verifyCustomerAccessToken(req);
      customerEmail = customer.email;
    }
  } catch {
    return res.status(401).json({ ok: false, error: "Customer session is invalid." });
  }

  try {
    const { paypalOrder, verifiedItems, total } = await createPayPalOrder({
      items,
      customerEmail: customerEmail || undefined,
    });

    return res.status(200).json({
      ok: true,
      orderId: paypalOrder.id,
      status: paypalOrder.status,
      total,
      items: verifiedItems.map(({ artwork, amount }) => ({
        artworkId: artwork.id,
        title: artwork.name,
        sku: artwork.id,
        price: amount,
      })),
    });
  } catch (issue) {
    return res.status(503).json({
      ok: false,
      error: issue instanceof Error ? issue.message : "Unable to create PayPal order.",
    });
  }
}
