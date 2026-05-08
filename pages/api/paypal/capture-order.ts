import type { NextApiRequest, NextApiResponse } from "next";

import { markCustomerCartPurchased } from "../../../lib/cart-database";
import { getAccessTokenFromRequest, verifyCustomerAccessToken } from "../../../lib/customer-auth";
import { appendOrder } from "../../../lib/crm-database";
import { capturePayPalOrder } from "../../../lib/paypal";

const getCaptureAmount = (captureBody: Record<string, any>) => {
  const captures = captureBody?.purchase_units?.flatMap(
    (unit: Record<string, any>) => unit?.payments?.captures ?? [],
  );
  const firstCapture = captures?.[0];
  const value = firstCapture?.amount?.value;
  return typeof value === "string" ? Number(value) : 0;
};

const getPayerEmail = (captureBody: Record<string, any>) => {
  const email = captureBody?.payer?.email_address;
  return typeof email === "string" ? email.trim().toLowerCase() : undefined;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed." });
  }

  const orderId = typeof req.body?.orderId === "string" ? req.body.orderId : "";
  const items = Array.isArray(req.body?.items) ? req.body.items : [];

  if (!orderId) {
    return res.status(400).json({ ok: false, error: "PayPal order ID is required." });
  }

  let customer: Awaited<ReturnType<typeof verifyCustomerAccessToken>> | null = null;

  try {
    if (getAccessTokenFromRequest(req)) {
      customer = await verifyCustomerAccessToken(req);
    }
  } catch {
    return res.status(401).json({ ok: false, error: "Customer session is invalid." });
  }

  try {
    const captureBody = (await capturePayPalOrder(orderId)) as Record<string, any>;
    const status = typeof captureBody.status === "string" ? captureBody.status : "UNKNOWN";
    const amount = getCaptureAmount(captureBody);
    const payerEmail = getPayerEmail(captureBody) ?? customer?.email;
    const artworkTitles = items
      .map((item: Record<string, unknown>) => item.title)
      .filter((title: unknown): title is string => typeof title === "string" && title.length > 0);
    const artworkLabel = artworkTitles.length ? artworkTitles.join(", ") : "ARTWURK artwork";

    if (status !== "COMPLETED") {
      return res.status(409).json({
        ok: false,
        status,
        error: "PayPal payment was not completed.",
      });
    }

    const order = await appendOrder({
      artwork: artworkLabel,
      amount,
      email: payerEmail,
      status: "paid",
      soldAt: new Date().toISOString(),
      raw: {
        provider: "paypal",
        paypalOrderId: orderId,
        status,
        payerEmail,
        items,
        capture: captureBody,
      },
    });

    if (customer) {
      await markCustomerCartPurchased(
        {
          userId: customer.id,
          email: customer.email,
        },
        {
        paypalOrderId: orderId,
        orderId: order?.id,
        amount,
        items,
        },
      );
    }

    return res.status(200).json({
      ok: true,
      status,
      amount,
      payerEmail,
      order,
    });
  } catch (issue) {
    return res.status(503).json({
      ok: false,
      error: issue instanceof Error ? issue.message : "Unable to capture PayPal payment.",
    });
  }
}
