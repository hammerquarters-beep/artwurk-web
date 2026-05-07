import React from "react";

import InfoPage from "../components/InfoPage";

export default function PrivacyPage() {
  return (
    <InfoPage
      title="Privacy Policy"
      kicker="Collector Privacy"
      description="ARTWURK™ collects collector information only to support inquiries, appraisal intake, acquisition follow-up, and owner notifications."
      sections={[
        {
          title: "Information Collected",
          body: "Forms may collect name, email, phone, inquiry details, artwork interest, and related context needed for Hammer HQ follow-up.",
        },
        {
          title: "Use of Information",
          body: "Collector information supports direct replies, acquisition support, appraisal review, CRM tracking, and operational notifications.",
        },
        {
          title: "Private Systems",
          body: "CRM access is protected and restricted to approved admin users. Public visitors cannot access backend collector tools.",
        },
      ]}
    />
  );
}
