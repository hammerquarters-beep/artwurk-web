import type { NextApiRequest } from "next";

import { getSupabaseAdmin } from "./supabase-server";

export type CustomerUser = {
  id: string;
  email: string;
  metadata: Record<string, unknown>;
};

export const getAccessTokenFromRequest = (req: Pick<NextApiRequest, "headers">) => {
  const authHeader = req.headers.authorization;

  if (authHeader?.toLowerCase().startsWith("bearer ")) {
    return authHeader.slice("bearer ".length).trim();
  }

  return "";
};

export const verifyCustomerAccessToken = async (
  input?: string | Pick<NextApiRequest, "headers">,
): Promise<CustomerUser> => {
  const accessToken =
    typeof input === "string" ? input : input ? getAccessTokenFromRequest(input) : "";

  if (!accessToken) {
    throw new Error("Customer session is required.");
  }

  const { data, error } = await getSupabaseAdmin().auth.getUser(accessToken);
  const email = data.user?.email;

  if (error || !data.user || !email) {
    throw new Error("Customer session is invalid.");
  }

  return {
    id: data.user.id,
    email,
    metadata: (data.user.user_metadata ?? {}) as Record<string, unknown>,
  };
};
