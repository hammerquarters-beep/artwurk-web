import type { NextApiRequest, NextApiResponse } from "next";

import { clearCrmSnapshot, getCrmSnapshot } from "../../lib/crm-database";
import type { ArtwurkCrmSnapshot } from "../../lib/crm-types";

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
  if (req.method === "DELETE") {
    await clearCrmSnapshot();

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

  return res.status(200).json({
    ok: true,
    route: "/api/crm",
    receivedAt: new Date().toISOString(),
    snapshot: await getCrmSnapshot(),
  });
}
