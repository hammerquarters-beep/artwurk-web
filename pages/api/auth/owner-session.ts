import type { NextApiRequest, NextApiResponse } from "next";

import {
  buildOwnerSessionCookie,
  clearOwnerSessionCookie,
  getOwnerEmail,
  verifyOwnerAccessToken,
} from "../../../lib/owner-auth";

type OwnerSessionResponse = {
  ok: boolean;
  ownerEmail?: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<OwnerSessionResponse>,
) {
  if (req.method === "DELETE") {
    res.setHeader("Set-Cookie", clearOwnerSessionCookie());
    return res.status(200).json({ ok: true });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, DELETE");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const accessToken = String(req.body?.accessToken ?? "");

  try {
    const owner = await verifyOwnerAccessToken(accessToken);
    res.setHeader("Set-Cookie", buildOwnerSessionCookie(accessToken, 60 * 60 * 24 * 7));

    return res.status(200).json({
      ok: true,
      ownerEmail: owner.email,
    });
  } catch (issue) {
    res.setHeader("Set-Cookie", clearOwnerSessionCookie());

    return res.status(403).json({
      ok: false,
      ownerEmail: getOwnerEmail(),
      error: issue instanceof Error ? issue.message : "Owner authorization failed.",
    });
  }
}
