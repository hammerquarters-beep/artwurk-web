import type { NextApiRequest, NextApiResponse } from "next";

import { appendServerInquiry, updateInquiryStatus } from "../../lib/crm-database";
import type { ArtwurkInquiryPayload, LeadStatus } from "../../lib/crm-types";

type InquiriesApiResponse = {
  ok: boolean;
  route: "/api/inquiries";
  receivedAt: string;
  payload?: ArtwurkInquiryPayload;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<InquiriesApiResponse>,
) {
  if (req.method === "PATCH") {
    const recordId = String(req.body?.id ?? "");
    const status = req.body?.status as LeadStatus | undefined;

    if (!recordId || !status) {
      return res.status(400).json({
        ok: false,
        route: "/api/inquiries",
        receivedAt: new Date().toISOString(),
        error: "Inquiry id and status are required",
      });
    }

    const payload = await updateInquiryStatus(recordId, status);

    if (!payload) {
      return res.status(404).json({
        ok: false,
        route: "/api/inquiries",
        receivedAt: new Date().toISOString(),
        error: "Inquiry not found",
      });
    }

    return res.status(200).json({
      ok: true,
      route: "/api/inquiries",
      receivedAt: new Date().toISOString(),
      payload,
    });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, PATCH");

    return res.status(405).json({
      ok: false,
      route: "/api/inquiries",
      receivedAt: new Date().toISOString(),
      error: "Method not allowed",
    });
  }

  const payload = req.body as ArtwurkInquiryPayload | undefined;

  if (!payload?.artwork?.id || !payload?.inquiry?.channel || !payload?.source) {
    return res.status(400).json({
      ok: false,
      route: "/api/inquiries",
      receivedAt: new Date().toISOString(),
      error: "Invalid inquiry payload",
    });
  }

  await appendServerInquiry(payload);

  return res.status(200).json({
    ok: true,
    route: "/api/inquiries",
    receivedAt: new Date().toISOString(),
    payload,
  });
}
