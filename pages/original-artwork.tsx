import React from "react";

import InfoPage from "../components/InfoPage";

export default function OriginalArtworkPage() {
  return (
    <InfoPage
      title="Original Artwork"
      kicker="One-of-One Works"
      description="ARTWURK™ presents original paintings created for collectors, interiors, and private acquisition conversations."
      sections={[
        {
          title: "One-of-One",
          body: "Original works are presented as individual collector pieces with title, dimensions, price or inquiry status, and story context.",
        },
        {
          title: "Artwork Stories",
          body: "Each work carries a story or visual direction to help collectors understand the emotional and interior presence of the piece.",
        },
        {
          title: "Acquisition",
          body: "Collectors can open each artwork modal to inquire, reserve, request invoice support, or use secure checkout when available.",
        },
      ]}
    />
  );
}
