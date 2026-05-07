import React from "react";

import InfoPage from "../components/InfoPage";

export default function AboutPage() {
  return (
    <InfoPage
      title="About ARTWURK"
      kicker="Hammer HQ LLC"
      description="ARTWURK™ is a luxury original artwork brand built around bold presence, private collector access, and direct acquisition support."
      sections={[
        {
          title: "Brand Position",
          body: "ARTWURK focuses on original works with visual force, emotional presence, and collector-level distinction.",
        },
        {
          title: "Collector Experience",
          body: "The site is designed for private inquiries, secure checkout where available, and direct Hammer HQ follow-up.",
        },
        {
          title: "Company",
          body: "ARTWURK is operated by Hammer HQ LLC with a focus on premium artwork presentation, appraisal intake, and collector relationships.",
        },
      ]}
    />
  );
}
