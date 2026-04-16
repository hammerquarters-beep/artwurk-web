import type { NextApiRequest, NextApiResponse } from "next";

import { appendServerLead, updateLeadStatus } from "../../lib/crm-database";
import type { ArtwurkLeadPayload, LeadStatus } from "../../lib/crm-types";

type LeadsApiResponse = {
  ok: boolean;
  route: "/api/leads";
  receivedAt: string;
  payload?: ArtwurkLeadPayload;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LeadsApiResponse>,
) {
  if (req.method === "PATCH") {
    const recordId = String(req.body?.id ?? "");
    const status = req.body?.status as LeadStatus | undefined;

    if (!recordId || !status) {
      return res.status(400).json({
        ok: false,
        route: "/api/leads",
        receivedAt: new Date().toISOString(),
        error: "Lead id and status are required",
      });
    }

    const payload = await updateLeadStatus(recordId, status);

    if (!payload) {
      return res.status(404).json({
        ok: false,
        route: "/api/leads",
        receivedAt: new Date().toISOString(),
        error: "Lead not found",
      });
    }

    return res.status(200).json({
      ok: true,
      route: "/api/leads",
      receivedAt: new Date().toISOString(),
      payload,
    });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, PATCH");

    return res.status(405).json({
      ok: false,
      route: "/api/leads",
      receivedAt: new Date().toISOString(),
      error: "Method not allowed",
    });
  }

  const payload = req.body as ArtwurkLeadPayload | undefined;

  if (!payload?.source || !payload?.route || !payload?.page) {
    return res.status(400).json({
      ok: false,
      route: "/api/leads",
      receivedAt: new Date().toISOString(),
      error: "Invalid lead payload",
    });
  }

  await appendServerLead(payload);

  return res.status(200).json({
    ok: true,
    route: "/api/leads",
    receivedAt: new Date().toISOString(),
    payload,
  });
}
