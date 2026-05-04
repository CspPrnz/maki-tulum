/**
 * Static stay data. Lives in code for Phase 1 (marketing).
 * Phase 2 moves this to the DB when bookings turn on.
 */
import type { Locale } from '@maki/i18n';

export type StayType = 'villa' | 'apartment-1st-floor' | 'apartment-2nd-floor';
export type StayStatus = 'available' | 'placeholder' | 'coming-soon';

export type StayPhoto = {
  src: string;
  alt: Record<Locale, string>;
};

export type Stay = {
  slug: string;
  name: string;
  number: number;
  type: StayType;
  sleeps: number;
  bedrooms: number;
  bathrooms: number;
  hero: StayPhoto;
  photos: StayPhoto[];
  status: StayStatus;
  /** Standout feature, used as a sub-headline. Translated in i18n keys. */
  signature: { en: string; es: string; de: string };
};

export const STAYS: Stay[] = [
  {
    slug: 'villa-18',
    name: 'Villa 18',
    number: 18,
    type: 'villa',
    sleeps: 4,
    bedrooms: 2,
    bathrooms: 2,
    status: 'available',
    signature: {
      en: 'Two-storey villa with private plunge pool and rooftop',
      es: 'Villa de dos pisos con alberca privada y rooftop',
      de: 'Zweistöckige Villa mit privatem Pool und Dachterrasse',
    },
    hero: {
      src: '/photos/villa-18/exterior-1.jpg',
      alt: {
        en: 'Rooftop terrace at Villa 18 with bamboo pergola, white plaster walls and cacti',
        es: 'Terraza en la azotea de Villa 18 con pérgola de bambú, paredes blancas y cactus',
        de: 'Dachterrasse der Villa 18 mit Bambus-Pergola, weiß verputzten Wänden und Kakteen',
      },
    },
    photos: [
      {
        src: '/photos/villa-18/living-1.jpg',
        alt: {
          en: 'Open living room with dining table and view of the plunge pool',
          es: 'Sala abierta con mesa de comedor y vista a la alberca',
          de: 'Offenes Wohnzimmer mit Esstisch und Blick auf den Pool',
        },
      },
      {
        src: '/photos/villa-18/living-2.jpg',
        alt: {
          en: 'Living room with sofa and floor-to-ceiling windows onto the garden',
          es: 'Sala con sofá y ventanales al jardín',
          de: 'Wohnzimmer mit Sofa und bodentiefen Fenstern zum Garten',
        },
      },
      {
        src: '/photos/villa-18/living-3.jpg',
        alt: {
          en: 'Kitchen and dining area, natural light',
          es: 'Cocina y comedor, luz natural',
          de: 'Küche und Essbereich, natürliches Licht',
        },
      },
      {
        src: '/photos/villa-18/bedroom-main.jpg',
        alt: {
          en: 'Main bedroom with king bed',
          es: 'Recámara principal con cama king',
          de: 'Hauptschlafzimmer mit Kingsize-Bett',
        },
      },
      {
        src: '/photos/villa-18/bedroom-secondary.jpg',
        alt: {
          en: 'Second bedroom',
          es: 'Segunda recámara',
          de: 'Zweites Schlafzimmer',
        },
      },
      {
        src: '/photos/villa-18/garden.jpg',
        alt: {
          en: 'Private garden with plunge pool',
          es: 'Jardín privado con alberca',
          de: 'Privater Garten mit Pool',
        },
      },
      {
        src: '/photos/villa-18/exterior-2.jpg',
        alt: {
          en: 'Villa 18 exterior',
          es: 'Exterior de Villa 18',
          de: 'Außenansicht Villa 18',
        },
      },
    ],
  },
  {
    slug: 'villa-19',
    name: 'Villa 19',
    number: 19,
    type: 'villa',
    sleeps: 4,
    bedrooms: 2,
    bathrooms: 2,
    status: 'placeholder',
    signature: {
      en: 'Sister villa to 18 — fresh photos coming, same compound, same calm',
      es: 'Villa hermana de la 18 — pronto fotos nuevas, mismo complejo, misma calma',
      de: 'Schwesterhaus zur 18 — frische Fotos folgen, gleiche Anlage, gleiche Ruhe',
    },
    hero: {
      src: '/photos/villa-19/placeholder-1.jpg',
      alt: {
        en: 'Compound at Maki Tulum (placeholder photo for Villa 19)',
        es: 'Complejo Maki Tulum (foto provisional de Villa 19)',
        de: 'Anlage Maki Tulum (Platzhalterfoto für Villa 19)',
      },
    },
    photos: [
      {
        src: '/photos/villa-19/placeholder-2.jpg',
        alt: {
          en: 'Placeholder — Villa 19 photos coming soon',
          es: 'Provisional — pronto fotos de Villa 19',
          de: 'Platzhalter — Fotos der Villa 19 folgen',
        },
      },
      {
        src: '/photos/villa-19/placeholder-3.jpg',
        alt: {
          en: 'Placeholder — Villa 19 photos coming soon',
          es: 'Provisional — pronto fotos de Villa 19',
          de: 'Platzhalter — Fotos der Villa 19 folgen',
        },
      },
    ],
  },
];

export function getStay(slug: string): Stay | undefined {
  return STAYS.find((s) => s.slug === slug);
}

export function listStays(): Stay[] {
  return STAYS;
}
