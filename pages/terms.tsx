import React from "react";

import InfoPage from "../components/InfoPage";

export default function TermsPage() {
  return (
    <InfoPage
      title="Terms of Service"
      kicker="ARTWURK Terms"
      description="Use of the ARTWURK™ website supports private collector discovery, inquiries, appraisal intake, and original artwork acquisition."
      sections={[
        {
          title: "Website Use",
          body: "The public website is provided for reviewing original artwork, contacting Hammer HQ, submitting appraisal details, and requesting collector support.",
        },
        {
          title: "Artwork Information",
          body: "Artwork pricing, availability, dimensions, and details are presented in good faith and may be confirmed directly before purchase.",
        },
        {
          title: "Protected Areas",
          body: "CRM, campaign, client, order, analytics, and backend tools are private and restricted to approved admin access only.",
        },
      ]}
    />
  );
}
