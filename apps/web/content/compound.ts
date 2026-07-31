/**
 * Photo strip for the Compound page. Static for Phase 1B, same pattern as
 * content/stays.ts. Alt text is a direct description of what's in the frame
 * (verified against the actual files in public/photos/compound/).
 */
import type { Locale } from '@maki/i18n';

export type CompoundPhoto = {
  src: string;
  alt: Record<Locale, string>;
};

export const COMPOUND_PHOTOS: CompoundPhoto[] = [
  {
    src: '/photos/compound/compound-2.jpg',
    alt: {
      en: 'Private plunge pool and lawn framed by jungle trees and a bamboo fence',
      es: 'Alberca privada y jardín enmarcados por árboles de la selva y una cerca de bambú',
      de: 'Privater Pool und Rasen, umrahmt von Dschungelbäumen und einem Bambuszaun',
    },
  },
  {
    src: '/photos/compound/compound-3.jpg',
    alt: {
      en: 'Rooftop corner with a woven chair, looking out over the jungle canopy',
      es: 'Rincón de la azotea con una silla tejida, con vista a la copa de los árboles de la selva',
      de: 'Ecke auf der Dachterrasse mit einem geflochtenen Stuhl, Blick über die Baumkronen des Dschungels',
    },
  },
  {
    src: '/photos/compound/compound-1.jpg',
    alt: {
      en: 'Bedroom with a raised concrete-and-plaster bed platform and warm natural light',
      es: 'Recámara con una plataforma de cama en concreto y aplanado, con luz natural cálida',
      de: 'Schlafzimmer mit erhöhter Bettplattform aus Beton und Putz, warmes Tageslicht',
    },
  },
];

export function listCompoundPhotos(): CompoundPhoto[] {
  return COMPOUND_PHOTOS;
}
