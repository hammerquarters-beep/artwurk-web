import artworks from "../data/artworks";
import { parsePriceToAmount } from "./cart-types";

type PayPalTokenResponse = {
  access_token?: string;
};

export type PayPalCheckoutItem = {
  artworkId: string;
  title?: string;
  quantity?: number;
};

const getPayPalBaseUrl = () =>
  process.env.PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

export const getPayPalClientId = () => process.env.PAYPAL_CLIENT_ID ?? "";

export const isPayPalConfigured = () =>
  Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);

export const getPayPalSdkUrl = () => {
  const clientId = getPayPalClientId();

  if (!clientId) {
    return "";
  }

  return `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(
    clientId,
  )}&components=buttons&enable-funding=venmo,paylater&currency=USD`;
};

const getPayPalAccessToken = async () => {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("PayPal credentials are not configured.");
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const response = await fetch(`${getPayPalBaseUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const body = (await response.json()) as PayPalTokenResponse;

  if (!body.access_token) {
    throw new Error("PayPal did not return an access token.");
  }

  return body.access_token;
};

const formatAmount = (amount: number) => amount.toFixed(2);

export const buildPayPalArtworkItems = (items: PayPalCheckoutItem[]) => {
  const requestedIds = new Set(items.map((item) => item.artworkId));
  const selected = artworks.filter((artwork) => requestedIds.has(artwork.id));

  if (!selected.length) {
    throw new Error("No payable artwork was selected.");
  }

  if (selected.length !== requestedIds.size) {
    throw new Error("One or more selected artworks could not be verified.");
  }

  return selected.map((artwork) => {
    const amount = parsePriceToAmount(artwork.price);

    if (!amount) {
      throw new Error(`${artwork.name} is not configured for direct checkout yet.`);
    }

    return {
      artwork,
      quantity: 1,
      amount,
    };
  });
};

export const createPayPalOrder = async ({
  items,
  customerEmail,
}: {
  items: PayPalCheckoutItem[];
  customerEmail?: string;
}) => {
  const verifiedItems = buildPayPalArtworkItems(items);
  const total = verifiedItems.reduce((sum, item) => sum + item.amount * item.quantity, 0);
  const accessToken = await getPayPalAccessToken();
  const invoiceId = `ARTWURK-${Date.now()}`;

  const response = await fetch(`${getPayPalBaseUrl()}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "PayPal-Request-Id": invoiceId,
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          invoice_id: invoiceId,
          custom_id: verifiedItems.map((item) => item.artwork.id).join(","),
          description: "ARTWURK original artwork acquisition",
          amount: {
            currency_code: "USD",
            value: formatAmount(total),
            breakdown: {
              item_total: {
                currency_code: "USD",
                value: formatAmount(total),
              },
            },
          },
          items: verifiedItems.map(({ artwork, amount }) => ({
            name: artwork.name.slice(0, 127),
            sku: artwork.id,
            quantity: "1",
            category: "PHYSICAL_GOODS",
            unit_amount: {
              currency_code: "USD",
              value: formatAmount(amount),
            },
          })),
          payee: undefined,
          shipping: undefined,
        },
      ],
      payer: customerEmail
        ? {
            email_address: customerEmail,
          }
        : undefined,
      application_context: {
        brand_name: "ARTWURK",
        shipping_preference: "NO_SHIPPING",
        user_action: "PAY_NOW",
      },
    }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return {
    paypalOrder: await response.json(),
    verifiedItems,
    total,
  };
};

export const capturePayPalOrder = async (orderId: string) => {
  const accessToken = await getPayPalAccessToken();
  const response = await fetch(`${getPayPalBaseUrl()}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "PayPal-Request-Id": `ARTWURK-CAPTURE-${orderId}`,
    },
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
};
