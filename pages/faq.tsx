import React from "react";

import InfoPage from "../components/InfoPage";

export default function FaqPage() {
  return (
    <InfoPage
      title="General Questions"
      kicker="Collector Support"
      description="Answers for collectors reviewing ARTWURK™ originals, private inquiries, appraisal services, and acquisition support."
      sections={[
        {
          title: "Availability",
          body: "Availability is handled directly through Hammer HQ. If a work is available, reserved, or price-on-request, the collector inquiry flow records your interest for direct follow-up.",
        },
        {
          title: "Private Inquiries",
          body: "Collectors can use the inquiry form, email, phone, or WhatsApp to request availability, viewing notes, invoice support, and reserve conversations.",
        },
        {
          title: "Appraisals",
          body: "The Art Appraisal page accepts artwork details for review. Hammer HQ can evaluate submitted work for appraisal, acquisition, or collector placement opportunities.",
        },
      ]}
    />
  );
}
