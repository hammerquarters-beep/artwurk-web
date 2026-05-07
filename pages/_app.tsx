import type { AppProps } from "next/app";

import { CartProvider } from "../components/CartProvider";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <CartProvider>
      <Component {...pageProps} />
      <style jsx global>{`
        :root {
          --artwurk-cream: #e7d8bd;
          --artwurk-taupe: #c7ad82;
          --artwurk-taupe-deep: #9f8053;
          --artwurk-charcoal: #17130f;
          --artwurk-muted: rgba(23, 19, 15, 0.68);
          --artwurk-gold: #b89143;
        }

        html {
          scroll-behavior: smooth;
          background: var(--artwurk-cream);
        }

        body {
          margin: 0;
          background: var(--artwurk-cream);
        }

        a {
          text-decoration: none;
        }

        a:focus-visible,
        button:focus-visible,
        input:focus-visible,
        select:focus-visible,
        textarea:focus-visible {
          outline: 2px solid rgba(184, 145, 67, 0.72);
          outline-offset: 3px;
        }
      `}</style>
    </CartProvider>
  );
}
