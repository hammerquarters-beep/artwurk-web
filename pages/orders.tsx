import Link from "next/link";
import React, { useEffect, useState } from "react";

import PublicHeader from "../components/PublicHeader";
import SiteFooter from "../components/SiteFooter";
import SiteSeo from "../components/SiteSeo";
import { getSupabaseBrowserClient } from "../lib/supabase-browser";

type CustomerOrder = {
  id: string;
  artwork: string;
  amount: number;
  status: string;
  soldAt: string;
  provider?: string;
  paypalOrderId?: string;
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);

export default function OrdersPage() {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [status, setStatus] = useState("Checking your collector session.");

  useEffect(() => {
    const loadOrders = async () => {
      const supabase = getSupabaseBrowserClient();
      const {
        data: { session },
      } = supabase ? await supabase.auth.getSession() : { data: { session: null } };

      if (!session?.access_token) {
        setStatus("Sign in to view private ARTWURK order history.");
        return;
      }

      const response = await fetch("/api/customer/orders", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        setStatus("Order history is temporarily unavailable.");
        return;
      }

      const body = await response.json();
      setOrders(body.orders ?? []);
      setStatus(body.orders?.length ? "" : "No completed ARTWURK orders are attached to this account yet.");
    };

    void loadOrders();
  }, []);

  return (
    <div className="orders-page">
      <SiteSeo
        title="Order History | ARTWURK™"
        description="Private ARTWURK collector order history for signed-in customers."
      />
      <PublicHeader />

      <main className="orders-shell">
        <section className="orders-hero">
          <p className="orders-kicker">Collector Account</p>
          <h1>Order History</h1>
          <p>
            Paid acquisitions connected to your signed-in collector email appear here for future
            checkout, invoice, and private owner follow-up.
          </p>
        </section>

        <section className="orders-panel" aria-label="ARTWURK order history">
          {status ? (
            <div className="orders-empty">
              <p>{status}</p>
              <div className="orders-actions">
                <Link href="/profile">Create / Sign In</Link>
                <Link href="/cart">Go to Cart</Link>
              </div>
            </div>
          ) : (
            orders.map((order) => (
              <article key={order.id} className="order-card">
                <div>
                  <p className="orders-kicker">{order.provider ?? "ARTWURK"}</p>
                  <h2>{order.artwork}</h2>
                  <p>{new Date(order.soldAt).toLocaleString()}</p>
                  {order.paypalOrderId ? <p>PayPal Order: {order.paypalOrderId}</p> : null}
                </div>
                <div className="order-price">
                  <strong>{formatCurrency(order.amount)}</strong>
                  <span>{order.status}</span>
                </div>
              </article>
            ))
          )}
        </section>
      </main>

      <SiteFooter />

      <style jsx>{`
        .orders-page {
          min-height: 100vh;
          background: #ffffff;
          color: #17130f;
          font-family: "Times New Roman", Georgia, serif;
        }

        .orders-shell {
          width: min(980px, calc(100vw - 28px));
          margin: 0 auto;
          padding: 42px 0 72px;
        }

        .orders-hero,
        .orders-panel,
        .order-card,
        .orders-empty {
          border: 1px solid rgba(23, 19, 15, 0.1);
          border-radius: 32px;
          background: rgba(235, 222, 198, 0.72);
          box-shadow: 0 18px 48px rgba(72, 48, 22, 0.08);
        }

        .orders-hero {
          padding: clamp(28px, 6vw, 58px);
          text-align: center;
        }

        .orders-kicker {
          margin: 0;
          color: #75552b;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.24em;
          text-transform: uppercase;
        }

        h1 {
          margin: 16px 0 0;
          font-size: clamp(2.5rem, 7vw, 5rem);
          line-height: 0.96;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .orders-hero p,
        .order-card p,
        .orders-empty p {
          color: rgba(23, 19, 15, 0.68);
          line-height: 1.8;
        }

        .orders-panel {
          display: grid;
          gap: 14px;
          margin-top: 24px;
          padding: 16px;
        }

        .order-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 22px;
        }

        .order-card h2 {
          margin: 10px 0 0;
          font-size: 28px;
        }

        .order-price {
          display: grid;
          justify-items: end;
          gap: 8px;
          color: #75552b;
        }

        .order-price strong {
          font-size: 24px;
          font-weight: 500;
        }

        .order-price span {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }

        .orders-empty {
          padding: 28px;
          text-align: center;
        }

        .orders-actions {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
          margin-top: 20px;
        }

        .orders-actions a {
          min-height: 52px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(23, 19, 15, 0.12);
          border-radius: 999px;
          color: #17130f;
          text-decoration: none;
          transition: transform 180ms ease, background 180ms ease;
        }

        .orders-actions a:hover {
          transform: translateY(-1px);
          background: rgba(255, 248, 235, 0.48);
        }

        @media (max-width: 640px) {
          .order-card,
          .orders-actions {
            grid-template-columns: 1fr;
            display: grid;
          }

          .order-price {
            justify-items: start;
          }
        }
      `}</style>
    </div>
  );
}
