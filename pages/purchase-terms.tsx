import React from "react";

import InfoPage from "../components/InfoPage";

export default function PurchaseTermsPage() {
  return (
    <InfoPage
      title="Returns / Purchase Terms"
      kicker="Collector Terms"
      description="Purchase terms are designed for original artwork acquisition, direct owner follow-up, and clear collector expectations."
      sections={[
        {
          title: "Original Works",
          body: "ARTWURK pieces are original works. Purchase details, condition notes, and availability should be confirmed before acquisition is finalized.",
        },
        {
          title: "Reservations",
          body: "Reserve requests indicate collector intent but do not finalize ownership until payment and Hammer HQ confirmation are complete.",
        },
        {
          title: "Terms Review",
          body: "For private acquisitions, Hammer HQ can clarify shipment, payment, and final sale terms before a collector completes purchase.",
        },
      ]}
    />
  );
}
