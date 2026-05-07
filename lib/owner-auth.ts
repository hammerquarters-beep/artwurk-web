import type { GetServerSidePropsContext, GetServerSidePropsResult, NextApiRequest, NextApiResponse } from "next";

import { getSupabaseAdmin } from "./supabase-server";

export const OWNER_SESSION_COOKIE = "artwurk_owner_access_token";

type OwnerUser = {
  id: string;
  email: string;
};

const extractEmail = (value?: string) => {
  const match = value?.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return match?.[0].toLowerCase() ?? "";
};

const extractEmails = (value?: string) =>
  value
    ?.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi)
    ?.map((email) => email.toLowerCase()) ?? [];

export const getCrmAllowedEmails = () => {
  const configured = extractEmails(process.env.CRM_ALLOWED_EMAILS);

  if (configured.length) {
    return Array.from(new Set(configured));
  }

  return Array.from(
    new Set(
      [
        ...extractEmails(process.env.OWNER_EMAIL),
        ...extractEmails(process.env.ARTWURK_OWNER_EMAIL),
        ...extractEmails(process.env.ARTWURK_OWNER_NOTIFICATION_EMAIL),
        "hammerhq@outlook.com",
        "hammer.quarters@gmail.com",
      ].filter(Boolean),
    ),
  );
};

export const getOwnerEmail = () => getCrmAllowedEmails()[0] ?? "hammerhq@outlook.com";

export const isOwnerEmail = (email?: string | null) =>
  Boolean(email && getCrmAllowedEmails().includes(extractEmail(email)));

const parseCookies = (cookieHeader?: string) =>
  Object.fromEntries(
    (cookieHeader ?? "")
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const index = part.indexOf("=");
        const key = index >= 0 ? part.slice(0, index) : part;
        const value = index >= 0 ? part.slice(index + 1) : "";
        return [key, decodeURIComponent(value)];
      }),
  );

export const getOwnerAccessTokenFromRequest = (req: Pick<NextApiRequest, "headers">) => {
  const authHeader = req.headers.authorization;

  if (authHeader?.toLowerCase().startsWith("bearer ")) {
    return authHeader.slice("bearer ".length).trim();
  }

  return parseCookies(req.headers.cookie)[OWNER_SESSION_COOKIE] ?? "";
};

export const verifyOwnerAccessToken = async (accessToken?: string): Promise<OwnerUser> => {
  if (!accessToken) {
    throw new Error("Owner session is required.");
  }

  const { data, error } = await getSupabaseAdmin().auth.getUser(accessToken);
  const email = data.user?.email;

  if (error || !data.user || !email) {
    throw new Error("Owner session is invalid.");
  }

  if (!isOwnerEmail(email)) {
    throw new Error("This account is not approved for CRM access.");
  }

  return {
    id: data.user.id,
    email,
  };
};

export const getOwnerAuthFailureStatus = (message: string) =>
  message.includes("not authorized") || message.includes("not approved") ? 403 : 401;

export const requireOwnerApi = async (
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<OwnerUser | null> => {
  try {
    return await verifyOwnerAccessToken(getOwnerAccessTokenFromRequest(req));
  } catch (issue) {
    const message = issue instanceof Error ? issue.message : "Owner authorization failed.";
    const status = getOwnerAuthFailureStatus(message);

    res.status(status).json({
      ok: false,
      error: message,
    });

    return null;
  }
};

export const requireOwnerPage = async <P extends Record<string, unknown> = Record<string, never>>(
  context: GetServerSidePropsContext,
  props?: P,
): Promise<GetServerSidePropsResult<P>> => {
  try {
    await verifyOwnerAccessToken(getOwnerAccessTokenFromRequest(context.req));

    return {
      props: (props ?? {}) as P,
    };
  } catch {
    return {
      redirect: {
        destination: `/profile?owner=required&next=${encodeURIComponent(
          context.resolvedUrl,
        )}`,
        permanent: false,
      },
    };
  }
};

export const buildOwnerSessionCookie = (accessToken: string, maxAgeSeconds: number) =>
  `${OWNER_SESSION_COOKIE}=${encodeURIComponent(
    accessToken,
  )}; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=${maxAgeSeconds}`;

export const clearOwnerSessionCookie = () =>
  `${OWNER_SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0`;
