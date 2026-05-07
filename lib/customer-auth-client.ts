import type { Session } from "@supabase/supabase-js";

import { trackLead } from "./tracking";

const leadNoticeKey = (userId: string) => `artwurk.customer.ownerNotified.${userId}`;

export const getCustomerDisplayName = (session?: Session | null) => {
  const metadata = session?.user.user_metadata ?? {};
  const firstName = typeof metadata.first_name === "string" ? metadata.first_name : "";
  const lastName = typeof metadata.last_name === "string" ? metadata.last_name : "";
  const fullName = typeof metadata.full_name === "string" ? metadata.full_name : "";
  const displayName =
    typeof metadata.display_name === "string" && metadata.display_name.trim()
      ? metadata.display_name.trim()
      : typeof metadata.name === "string" && metadata.name.trim()
        ? metadata.name.trim()
        : fullName.trim() || [firstName, lastName].filter(Boolean).join(" ").trim();

  return displayName || session?.user.email?.split("@")[0] || "";
};

export const syncCustomerSession = async ({
  session,
  source,
  notifyOwner = false,
}: {
  session?: Session | null;
  source: string;
  notifyOwner?: boolean;
}) => {
  if (!session?.access_token || !session.user.email) {
    return;
  }

  const metadata = session.user.user_metadata ?? {};
  const displayName = getCustomerDisplayName(session);
  const fullName = typeof metadata.full_name === "string" ? metadata.full_name.trim() : "";
  const nameParts = fullName ? fullName.split(" ") : [];
  const firstName =
    typeof metadata.first_name === "string" && metadata.first_name.trim()
      ? metadata.first_name.trim()
      : nameParts[0] ?? "";
  const lastName =
    typeof metadata.last_name === "string" && metadata.last_name.trim()
      ? metadata.last_name.trim()
      : nameParts.slice(1).join(" ");

  await fetch("/api/customer/profile", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      displayName: displayName || undefined,
      phone: typeof metadata.phone === "string" ? metadata.phone : undefined,
      preferredContact: "email",
      marketingConsent: true,
      smsConsent: false,
      source,
    }),
  });

  await fetch("/api/customer/welcome", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      displayName: displayName || undefined,
    }),
  });

  if (notifyOwner && typeof window !== "undefined") {
    const key = leadNoticeKey(session.user.id);

    if (!window.localStorage.getItem(key)) {
      trackLead({
        route: window.location.pathname,
        page: "auth",
        source,
        status: "new",
        intent: "general",
        customer: {
          name: displayName || undefined,
          email: session.user.email,
          preferredContact: "email",
        },
        metadata: {
          accessType: "collector-auth",
          provider: session.user.app_metadata?.provider,
        },
      });
      window.localStorage.setItem(key, new Date().toISOString());
    }
  }
};
