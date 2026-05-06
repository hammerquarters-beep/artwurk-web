import type { NextApiRequest, NextApiResponse } from "next";

import { clearCrmSnapshot, getCrmSnapshot } from "../../../lib/crm-database";
import type { ArtwurkCrmSnapshot } from "../../../lib/crm-types";
import { requireOwnerApi } from "../../../lib/owner-auth";

type CrmApiResponse = {
  ok: boolean;
  route: "/api/crm";
  receivedAt: string;
  snapshot?: ArtwurkCrmSnapshot;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CrmApiResponse>,
) {
  const owner = await requireOwnerApi(req, res);

  if (!owner) {
    return;
  }

  if (req.method === "DELETE") {
    try {
      await clearCrmSnapshot();
    } catch (issue) {
      return res.status(503).json({
        ok: false,
        route: "/api/crm",
        receivedAt: new Date().toISOString(),
        error: issue instanceof Error ? issue.message : "Unable to clear CRM data",
      });
    }

    return res.status(200).json({
      ok: true,
      route: "/api/crm",
      receivedAt: new Date().toISOString(),
      snapshot: {
        events: [],
        inquiries: [],
        leads: [],
      },
    });
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET, DELETE");

    return res.status(405).json({
      ok: false,
      route: "/api/crm",
      receivedAt: new Date().toISOString(),
      error: "Method not allowed",
    });
  }

  try {
    return res.status(200).json({
      ok: true,
      route: "/api/crm",
      receivedAt: new Date().toISOString(),
      snapshot: await getCrmSnapshot(),
    });
  } catch (issue) {
    return res.status(503).json({
      ok: false,
      route: "/api/crm",
      receivedAt: new Date().toISOString(),
      error: issue instanceof Error ? issue.message : "Unable to load CRM data",
    });
  }
}
