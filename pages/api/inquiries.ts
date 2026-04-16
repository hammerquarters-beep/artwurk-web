import type { NextApiRequest, NextApiResponse } from "next";

import type { ArtwurkInquiryPayload } from "../../lib/tracking";

type InquiriesApiResponse = {
  ok: boolean;
  route: "/api/inquiries";
  receivedAt: string;
  payload?: ArtwurkInquiryPayload;
  error?: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<InquiriesApiResponse>,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");

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

  return res.status(200).json({
    ok: true,
    route: "/api/inquiries",
    receivedAt: new Date().toISOString(),
    payload,
  });
}
