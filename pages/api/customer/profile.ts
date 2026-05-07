import type { NextApiRequest, NextApiResponse } from "next";

import { upsertCollector } from "../../../lib/crm-database";
import { verifyCustomerAccessToken } from "../../../lib/customer-auth";
import { getSupabaseAdmin } from "../../../lib/supabase-server";

const mapCollectorProfile = (collector: Record<string, any> | null) =>
  collector
    ? {
        id: collector.id,
        email: collector.email,
        name: collector.name,
        firstName: collector.first_name,
        lastName: collector.last_name,
        displayName: collector.display_name,
        phone: collector.phone,
        preferredContact: collector.preferred_contact,
        shippingAddress: collector.shipping_address,
        shippingCity: collector.shipping_city,
        shippingState: collector.shipping_state,
        shippingZip: collector.shipping_zip,
        shippingCountry: collector.shipping_country,
        marketingConsent: Boolean(collector.marketing_consent),
        smsConsent: Boolean(collector.sms_consent),
        source: collector.source,
        status: collector.status,
        createdAt: collector.created_at,
      }
    : null;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!["GET", "POST"].includes(req.method ?? "")) {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ ok: false, error: "Method not allowed." });
  }

  let customer;

  try {
    customer = await verifyCustomerAccessToken(req);
  } catch (issue) {
    return res.status(401).json({
      ok: false,
      error: issue instanceof Error ? issue.message : "Customer session is required.",
    });
  }

  try {
    if (req.method === "GET") {
      const result = await getSupabaseAdmin()
        .from("artwurk_collectors")
        .select("id,email,name,first_name,last_name,display_name,phone,preferred_contact,shipping_address,shipping_city,shipping_state,shipping_zip,shipping_country,marketing_consent,sms_consent,source,status,created_at")
        .eq("email", customer.email)
        .maybeSingle();

      if (result.error) {
        throw result.error;
      }

      return res.status(200).json({ ok: true, collector: mapCollectorProfile(result.data) });
    }

    const {
      firstName,
      lastName,
      displayName,
      phone,
      preferredContact,
      shippingAddress,
      shippingCity,
      shippingState,
      shippingZip,
      shippingCountry,
      marketingConsent,
      smsConsent,
      source,
    } = req.body ?? {};

    const name =
      typeof displayName === "string" && displayName.trim()
        ? displayName.trim()
        : [firstName, lastName].filter(Boolean).join(" ").trim();

    const collector = await upsertCollector({
      email: customer.email,
      name,
      firstName,
      lastName,
      displayName,
      phone,
      preferredContact,
      shippingAddress,
      shippingCity,
      shippingState,
      shippingZip,
      shippingCountry,
      source: source ?? "collector-profile",
      status: "active",
      marketingConsent: Boolean(marketingConsent),
      smsConsent: Boolean(smsConsent),
      metadata: {
        userId: customer.id,
        profileUpdatedAt: new Date().toISOString(),
      },
    });

    return res.status(200).json({ ok: true, collector });
  } catch (issue) {
    return res.status(503).json({
      ok: false,
      error: issue instanceof Error ? issue.message : "Unable to save profile.",
    });
  }
}
