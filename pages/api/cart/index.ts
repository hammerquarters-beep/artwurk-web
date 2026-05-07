import type { NextApiRequest, NextApiResponse } from "next";

import {
  addCustomerCartItem,
  getCustomerCartSnapshot,
  markCheckoutStarted,
  mergeCustomerCart,
  removeCustomerCartItem,
} from "../../../lib/cart-database";
import type { CartArtworkItem, CartSnapshot } from "../../../lib/cart-types";
import { verifyCustomerAccessToken } from "../../../lib/customer-auth";

type CartApiResponse = {
  ok: boolean;
  cart?: CartSnapshot;
  error?: string;
};

const getCustomer = async (req: NextApiRequest) => {
  const customer = await verifyCustomerAccessToken(req);

  if (!customer.email) {
    throw new Error("A customer email is required for cart persistence.");
  }

  return {
    userId: customer.id,
    email: customer.email,
  };
};

const isCartItem = (value: unknown): value is CartArtworkItem => {
  const item = value as Partial<CartArtworkItem>;
  return Boolean(item?.artworkId && item.title && item.priceLabel);
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CartApiResponse>,
) {
  let customer;

  try {
    customer = await getCustomer(req);
  } catch (issue) {
    return res.status(401).json({
      ok: false,
      error: issue instanceof Error ? issue.message : "Customer session is required.",
    });
  }

  try {
    if (req.method === "GET") {
      return res.status(200).json({
        ok: true,
        cart: await getCustomerCartSnapshot(customer),
      });
    }

    if (req.method !== "POST") {
      res.setHeader("Allow", "GET, POST");
      return res.status(405).json({ ok: false, error: "Method not allowed." });
    }

    const { action } = req.body ?? {};

    if (action === "merge") {
      const items = Array.isArray(req.body?.items)
        ? req.body.items.filter(isCartItem)
        : [];

      return res.status(200).json({
        ok: true,
        cart: await mergeCustomerCart(customer, items),
      });
    }

    if (action === "add" && isCartItem(req.body?.item)) {
      return res.status(200).json({
        ok: true,
        cart: await addCustomerCartItem(customer, req.body.item),
      });
    }

    if (action === "remove" && typeof req.body?.artworkId === "string") {
      return res.status(200).json({
        ok: true,
        cart: await removeCustomerCartItem(customer, req.body.artworkId),
      });
    }

    if (action === "checkout_start") {
      return res.status(200).json({
        ok: true,
        cart: await markCheckoutStarted(customer),
      });
    }

    return res.status(400).json({ ok: false, error: "Unsupported cart action." });
  } catch (issue) {
    return res.status(503).json({
      ok: false,
      error: issue instanceof Error ? issue.message : "Unable to update cart.",
    });
  }
}
