export type CartArtworkItem = {
  artworkId: string;
  displayId?: string;
  title: string;
  image?: string;
  dimensions?: string;
  priceLabel: string;
  unitAmount: number | null;
  quantity: number;
};

export type CartSnapshot = {
  id?: string;
  status?: string;
  subtotal: number;
  currency: "USD";
  items: CartArtworkItem[];
};

export type CartEventName =
  | "cart_add"
  | "cart_view"
  | "cart_remove"
  | "cart_merge"
  | "checkout_start"
  | "purchase_complete"
  | "abandoned_followup_queued"
  | "abandoned_followup_sent";

export const parsePriceToAmount = (priceLabel?: string): number | null => {
  if (!priceLabel) {
    return null;
  }

  const match = priceLabel.replaceAll(",", "").match(/\$?(\d+(?:\.\d{1,2})?)/);
  return match ? Number(match[1]) : null;
};

export const calculateCartSubtotal = (items: CartArtworkItem[]) =>
  items.reduce((sum, item) => sum + (item.unitAmount ?? 0) * item.quantity, 0);
