export default async function handler(req, res) {
  const sales = [
    { amount: 1050, soldAt: "2026-04-01T10:00:00.000Z", status: "paid" },
    { amount: 2200, soldAt: "2026-04-10T10:00:00.000Z", status: "paid" },
    { amount: 850, soldAt: "2026-03-25T10:00:00.000Z", status: "paid" },
  ];

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthlySales = sales.filter((sale) => {
    const date = new Date(sale.soldAt);
    return (
      sale.status === "paid" &&
      date.getMonth() === currentMonth &&
      date.getFullYear() === currentYear
    );
  });

  const revenueThisMonth = monthlySales.reduce((sum, sale) => sum + sale.amount, 0);

  res.status(200).json({
    revenueThisMonth,
    totalTransactions: monthlySales.length,
    monthlySales,
  });
}
