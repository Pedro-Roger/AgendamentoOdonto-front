import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/src/lib/seo";

export function buildDentistSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Dentist",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    logo: `${SITE_URL}/sorriso.png`,
    image: `${SITE_URL}/sorriso.png`,
    areaServed: "BR",
    priceRange: "$$",
  };
}

export function JsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(buildDentistSchema()) }}
    />
  );
}
