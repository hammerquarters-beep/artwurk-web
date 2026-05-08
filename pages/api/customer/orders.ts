import type { NextApiRequest, NextApiResponse } from "next";

import { verifyCustomerAccessToken } from "../../../lib/customer-auth";
import { getSupabaseAdmin } from "../../../lib/supabase-server";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
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
    const { data, error } = await getSupabaseAdmin()
      .from("artwurk_orders")
      .select("id,artwork,amount,email,status,payload,sold_at,created_at")
      .eq("email", customer.email)
      .order("sold_at", { ascending: false })
      .limit(100);

    if (error) {
      throw error;
    }

    return res.status(200).json({
      ok: true,
      orders: (data ?? []).map((order) => ({
        id: order.id,
        artwork: order.artwork,
        amount: Number(order.amount ?? 0),
        email: order.email,
        status: order.status,
        soldAt: order.sold_at,
        createdAt: order.created_at,
        provider: order.payload?.provider,
        paypalOrderId: order.payload?.paypalOrderId,
      })),
    });
  } catch (issue) {
    return res.status(503).json({
      ok: false,
      error: issue instanceof Error ? issue.message : "Unable to load order history.",
    });
  }
}
