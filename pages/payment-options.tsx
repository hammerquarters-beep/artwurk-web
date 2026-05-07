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
          body: "The Watcher currently includes a hosted PayPal checkout experience. Additional checkout options can be coordinated through Hammer HQ.",
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
