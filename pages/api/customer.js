export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { email } = req.body ?? {};

  const customer = {
    email,
    createdAt: new Date().toISOString(),
    firstTimeBuyer: true,
  };

  console.log("CUSTOMER:", customer);

  return res.status(200).json({ success: true });
}
