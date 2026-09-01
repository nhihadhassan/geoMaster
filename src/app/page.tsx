import { MapContainer } from "@/components/map/MapContainer";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/config/site";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  applicationCategory: "EducationalApplication",
  operatingSystem: "Any",
  browserRequirements: "Requires JavaScript and WebGL support.",
  isAccessibleForFree: true,
  inLanguage: "en",
  educationalUse: ["practice", "self-assessment"],
  featureList: [
    "Interactive world map",
    "Country geography quizzes",
    "Focused practice and progress tracking",
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <MapContainer />
    </>
  );
}
