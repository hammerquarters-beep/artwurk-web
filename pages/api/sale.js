export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { artwork, amount, email } = req.body ?? {};

  const sale = {
    artwork,
    amount,
    email,
    status: "paid",
    soldAt: new Date().toISOString(),
  };

  console.log("SALE:", sale);

  return res.status(200).json({ success: true });
}
