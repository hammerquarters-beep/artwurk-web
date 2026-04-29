import type { NextApiRequest, NextApiResponse } from "next";

import { buildTrafficSnapshot } from "../../../lib/crm-analytics";
import { getCrmSnapshot } from "../../../lib/crm-database";
import type { ArtwurkTrafficSnapshot } from "../../../lib/crm-types";

type TrafficApiResponse = {
  ok: boolean;
  route: "/api/crm/traffic";
  receivedAt: string;
  traffic?: ArtwurkTrafficSnapshot;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TrafficApiResponse>,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");

    return res.status(405).json({
      ok: false,
      route: "/api/crm/traffic",
      receivedAt: new Date().toISOString(),
      error: "Method not allowed",
    });
  }

  const snapshot = await getCrmSnapshot();

  return res.status(200).json({
    ok: true,
    route: "/api/crm/traffic",
    receivedAt: new Date().toISOString(),
    traffic: buildTrafficSnapshot(snapshot),
  });
}
