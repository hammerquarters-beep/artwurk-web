import { getCollectors, upsertCollector } from "../../lib/crm-database";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { name, email, phone, source } = req.body ?? {};

    try {
      const client = await upsertCollector({
        name,
        email,
        phone,
        source: source ?? "api_clients",
        metadata: {
          route: "/api/clients",
        },
      });

      return res.status(200).json({ success: true, client });
    } catch (issue) {
      return res.status(503).json({
        success: false,
        error: issue instanceof Error ? issue.message : "Unable to persist client",
      });
    }
  }

  if (req.method === "GET") {
    try {
      return res.status(200).json({ clients: await getCollectors() });
    } catch (issue) {
      return res.status(503).json({
        clients: [],
        error: issue instanceof Error ? issue.message : "Unable to load clients",
      });
    }
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ success: false, error: "Method not allowed" });
}
