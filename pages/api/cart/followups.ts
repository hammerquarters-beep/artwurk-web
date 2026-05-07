import type { NextApiRequest, NextApiResponse } from "next";

import { processDueAbandonedCartFollowups } from "../../../lib/cart-database";
import { requireOwnerApi } from "../../../lib/owner-auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const owner = await requireOwnerApi(req, res);

  if (!owner) {
    return;
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed." });
  }

  try {
    return res.status(200).json({
      ok: true,
      processed: await processDueAbandonedCartFollowups(),
    });
  } catch (issue) {
    return res.status(503).json({
      ok: false,
      error: issue instanceof Error ? issue.message : "Unable to process cart follow-ups.",
    });
  }
}
