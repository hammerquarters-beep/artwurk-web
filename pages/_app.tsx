import type { AppProps } from "next/app";

import { CartProvider } from "../components/CartProvider";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <CartProvider>
      <Component {...pageProps} />
    </CartProvider>
  );
}
