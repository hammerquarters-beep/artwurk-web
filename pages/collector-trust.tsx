import React from "react";

import InfoPage from "../components/InfoPage";

export default function CollectorTrustPage() {
  return (
    <InfoPage
      title="Collector Trust"
      kicker="Private Acquisition"
      description="ARTWURK™ supports collectors with direct communication, documented inquiries, secure checkout paths, and protected owner-only CRM systems."
      sections={[
        {
          title: "Direct Follow-Up",
          body: "Collector inquiries route to Hammer HQ so availability, purchase intent, and appraisal needs can be reviewed personally.",
        },
        {
          title: "Secure Systems",
          body: "Supabase writes, owner notifications, and CRM access controls support a stable private acquisition workflow.",
        },
        {
          title: "Protected CRM",
          body: "Backend CRM, campaign, client, order, and analytics tools remain hidden from public navigation and blocked from public access.",
        },
      ]}
    />
  );
}
