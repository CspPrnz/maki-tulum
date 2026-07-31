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
      streetAddress: 'Aldea Zama',
    },
    telephone: '',
    priceRange: '$$$',
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
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
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}
