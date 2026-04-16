import type { NextApiRequest, NextApiResponse } from "next";

import type { ArtwurkLeadPayload } from "../../lib/tracking";

type LeadsApiResponse = {
  ok: boolean;
  route: "/api/leads";
  receivedAt: string;
  payload?: ArtwurkLeadPayload;
  error?: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<LeadsApiResponse>,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");

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

  return res.status(200).json({
    ok: true,
    route: "/api/leads",
    receivedAt: new Date().toISOString(),
    payload,
  });
}
