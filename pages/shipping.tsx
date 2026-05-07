import React from "react";

import InfoPage from "../components/InfoPage";

export default function ShippingPage() {
  return (
    <InfoPage
      title="Shipping & Handling"
      kicker="Acquisition Support"
      description="ARTWURK™ shipping is coordinated with care for original canvas works, collector documentation, and secure delivery planning."
      sections={[
        {
          title: "Secure Handling",
          body: "Original works are prepared for shipment with attention to surface protection, packaging stability, and direct communication before release.",
        },
        {
          title: "Collector Coordination",
          body: "Shipping details are confirmed during acquisition follow-up so destination, timing, and handling requirements can be reviewed clearly.",
        },
        {
          title: "Documentation",
          body: "Collector documentation, including authenticity details when applicable, is handled as part of the acquisition support process.",
        },
      ]}
    />
  );
}
