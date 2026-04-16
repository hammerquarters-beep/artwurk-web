const mockClients = [
  {
    name: "Collector One",
    email: "collector1@example.com",
    phone: "+1 (209) 555-1001",
    status: "VIP",
    source: "Gallery Signup",
  },
  {
    name: "Collector Two",
    email: "collector2@example.com",
    phone: "+1 (209) 555-1002",
    status: "First-Time Buyer",
    source: "Popup Offer",
  },
  {
    name: "Collector Three",
    email: "collector3@example.com",
    phone: "+1 (209) 555-1003",
    status: "Returning",
    source: "Collector Inquiry",
  },
];

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { name, email, phone, source } = req.body ?? {};

    const client = {
      name,
      email,
      phone,
      source,
      createdAt: new Date().toISOString(),
    };

    console.log("NEW CLIENT:", client);

    return res.status(200).json({ success: true, client });
  }

  if (req.method === "GET") {
    return res.status(200).json({ clients: mockClients });
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ success: false, error: "Method not allowed" });
}
