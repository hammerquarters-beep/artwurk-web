import type { NextApiRequest, NextApiResponse } from "next";

import { appendServerEvent } from "../../lib/crm-database";
import type { ArtwurkEventPayload } from "../../lib/crm-types";

type EventsApiResponse = {
  ok: boolean;
  route: "/api/events";
  receivedAt: string;
  payload?: ArtwurkEventPayload;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<EventsApiResponse>,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");

    return res.status(405).json({
      ok: false,
      route: "/api/events",
      receivedAt: new Date().toISOString(),
      error: "Method not allowed",
    });
  }

  const payload = req.body as ArtwurkEventPayload | undefined;

  if (!payload?.event || !payload?.route || !payload?.page || !payload?.source) {
    return res.status(400).json({
      ok: false,
      route: "/api/events",
      receivedAt: new Date().toISOString(),
      error: "Invalid event payload",
    });
  }

  await appendServerEvent(payload);

  return res.status(200).json({
    ok: true,
    route: "/api/events",
    receivedAt: new Date().toISOString(),
    payload,
  });
}
