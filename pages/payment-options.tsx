import React from "react";

import InfoPage from "../components/InfoPage";

export default function PaymentOptionsPage() {
  return (
    <InfoPage
      title="Payment Options"
      kicker="Secure Acquisition"
      description="ARTWURK™ supports premium collector checkout paths including secure hosted checkout where available and direct invoice support."
      sections={[
        {
          title: "Secure Checkout",
          body: "Available artworks can be paired with secure hosted PayPal checkout links. Eligible payment options may include PayPal, Venmo, Pay Later, card checkout, and other supported methods.",
        },
        {
          title: "Invoice Support",
          body: "Collectors may request a direct invoice for acquisition support, frame selections, custom handling, or private purchase coordination.",
        },
        {
          title: "Owner Follow-Up",
          body: "High-intent purchase requests are routed into the ARTWURK CRM so Hammer HQ can follow up directly with next steps.",
        },
      ]}
    />
  );
}
