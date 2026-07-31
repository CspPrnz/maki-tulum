/**
 * Schema.org JSON-LD blocks. Lesson from best-practices.md §SEO:
 * LodgingBusiness on the home, Hotel on /compound, HotelRoom per stay.
 * Render as a <script type="application/ld+json"> in the <head> via Next.js.
 */
type StayLD = {
  url: string;
  name: string;
  description: string;
  bedrooms: number;
  bathrooms: number;
  occupancy: number;
  imageUrls: string[];
};

/**
 * JSON.stringify does not escape `<`, so any value containing `</script>`
 * breaks out of the tag. Nothing user-controlled reaches these components
 * today — every value comes from typed content modules — but guide article
 * bodies are headed for per-slug files, so the escape belongs here before the
 * content becomes editable rather than after.
 */
export function serializeLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export function LodgingBusinessJsonLd({ url, description }: { url: string; description: string }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: 'Maki Tulum',
    description,
    url,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Tulum',
      addressRegion: 'Quintana Roo',
      addressCountry: 'MX',
      streetAddress: 'Xul Kaa',
    },
    telephone: '',
    priceRange: '$$$',
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeLd(data) }} />
  );
}

export function HotelRoomJsonLd({ stay }: { stay: StayLD }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'HotelRoom',
    name: stay.name,
    description: stay.description,
    url: stay.url,
    image: stay.imageUrls,
    occupancy: { '@type': 'QuantitativeValue', maxValue: stay.occupancy },
    numberOfRooms: stay.bedrooms,
    amenityFeature: [
      { '@type': 'LocationFeatureSpecification', name: 'Air conditioning', value: true },
      { '@type': 'LocationFeatureSpecification', name: 'Pool', value: true },
      { '@type': 'LocationFeatureSpecification', name: 'WiFi', value: true },
    ],
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeLd(data) }} />
  );
}
