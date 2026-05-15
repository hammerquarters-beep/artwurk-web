import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { CartArtworkItem, CartSnapshot } from "../lib/cart-types";
import { calculateCartSubtotal } from "../lib/cart-types";
import { getSupabaseBrowserClient } from "../lib/supabase-browser";
import { trackEvent } from "../lib/tracking";

type CartContextValue = CartSnapshot & {
  count: number;
  drawerOpen: boolean;
  ready: boolean;
  addItem: (item: CartArtworkItem) => Promise<void>;
  removeItem: (artworkId: string) => Promise<void>;
  clearLocalCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  startCheckout: () => Promise<void>;
  refreshCart: () => Promise<void>;
};

const CART_STORAGE_KEY = "artwurk.collector.cart.v1";

const CartContext = createContext<CartContextValue | null>(null);

const emptyCart = (items: CartArtworkItem[] = []): CartSnapshot => ({
  subtotal: calculateCartSubtotal(items),
  currency: "USD",
  items,
});

const dedupeItems = (items: CartArtworkItem[]) => {
  const map = new Map<string, CartArtworkItem>();

  items.forEach((item) => {
    map.set(item.artworkId, {
      ...item,
      quantity: 1,
    });
  });

  return Array.from(map.values());
};

const readStoredItems = () => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as CartArtworkItem[]) : [];
    return Array.isArray(parsed) ? dedupeItems(parsed) : [];
  } catch {
    return [];
  }
};

const writeStoredItems = (items: CartArtworkItem[]) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(dedupeItems(items)));
};

const getAccessToken = async () => {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.access_token ?? null;
};

const requestCart = async (action: string, payload: Record<string, unknown> = {}) => {
  const token = await getAccessToken();

  if (!token) {
    return null;
  }

  const response = await fetch("/api/cart", {
    method: action === "get" ? "GET" : "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: action === "get" ? undefined : JSON.stringify({ action, ...payload }),
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as { cart?: CartSnapshot };
  return data.cart ?? null;
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartSnapshot>(emptyCart());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const hasMergedRef = useRef(false);

  const applyCart = useCallback((snapshot: CartSnapshot) => {
    const nextItems = dedupeItems(snapshot.items ?? []);
    const nextCart = {
      ...snapshot,
      subtotal: calculateCartSubtotal(nextItems),
      currency: "USD" as const,
      items: nextItems,
    };

    setCart(nextCart);
    writeStoredItems(nextItems);
  }, []);

  const mergeWithServer = useCallback(async () => {
    const storedItems = readStoredItems();
    const serverCart = await requestCart("merge", { items: storedItems });

    if (serverCart) {
      applyCart(serverCart);
      hasMergedRef.current = true;
    }
  }, [applyCart]);

  const refreshCart = useCallback(async () => {
    const serverCart = await requestCart("get");

    if (serverCart) {
      applyCart(serverCart);
    }
  }, [applyCart]);

  useEffect(() => {
    const storedItems = readStoredItems();
    applyCart(emptyCart(storedItems));
    setReady(true);

    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      return;
    }

    void supabase.auth.getSession().then(({ data }) => {
      if (data.session && !hasMergedRef.current) {
        void mergeWithServer();
      }
    });

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && session) {
        void mergeWithServer();
      }
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, [applyCart, mergeWithServer]);

  const addItem = useCallback(
    async (item: CartArtworkItem) => {
      const exists = cart.items.some((current) => current.artworkId === item.artworkId);
      const nextItems = exists ? cart.items : dedupeItems([...cart.items, { ...item, quantity: 1 }]);
      applyCart(emptyCart(nextItems));
      setDrawerOpen(true);

      trackEvent({
        event: exists ? "cart_view" : "cart_add",
        route: typeof window === "undefined" ? "/" : window.location.pathname,
        page: "cart",
        source: "collector-cart",
        metadata: {
          artworkId: item.artworkId,
          title: item.title,
          duplicatePrevented: exists,
        },
      });

      const serverCart = exists ? null : await requestCart("add", { item });

      if (serverCart) {
        applyCart(serverCart);
      }
    },
    [applyCart, cart.items],
  );

  const removeItem = useCallback(
    async (artworkId: string) => {
      const nextItems = cart.items.filter((item) => item.artworkId !== artworkId);
      applyCart(emptyCart(nextItems));

      trackEvent({
        event: "cart_remove",
        route: typeof window === "undefined" ? "/cart" : window.location.pathname,
        page: "cart",
        source: "collector-cart",
        metadata: { artworkId },
      });

      const serverCart = await requestCart("remove", { artworkId });

      if (serverCart) {
        applyCart(serverCart);
      }
    },
    [applyCart, cart.items],
  );

  const clearLocalCart = useCallback(() => {
    applyCart(emptyCart());
  }, [applyCart]);

  const openCart = useCallback(() => {
    setDrawerOpen(true);
  }, []);

  const closeCart = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  const startCheckout = useCallback(async () => {
    trackEvent({
      event: "checkout_start",
      route: "/cart",
      page: "cart",
      source: "cart-checkout",
      metadata: {
        itemCount: cart.items.length,
        subtotal: cart.subtotal,
      },
    });

    const serverCart = await requestCart("checkout_start");

    if (serverCart) {
      applyCart(serverCart);
    }
  }, [applyCart, cart.items.length, cart.subtotal]);

  const value = useMemo<CartContextValue>(
    () => ({
      ...cart,
      count: cart.items.length,
      drawerOpen,
      ready,
      addItem,
      removeItem,
      clearLocalCart,
      openCart,
      closeCart,
      startCheckout,
      refreshCart,
    }),
    [addItem, cart, clearLocalCart, closeCart, drawerOpen, openCart, ready, refreshCart, removeItem, startCheckout],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider.");
  }

  return context;
};
