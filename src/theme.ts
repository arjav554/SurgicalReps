import type { ComponentProps } from 'react';
import type MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

/**
 * Raw palette for places className cannot reach (SVG strokes, icon tints). Mirrors tailwind.config.js:
 * two anchors (blue-black, warm bone), gold for emphasis, and red kept for danger and alarms.
 */
export const palette = {
  canvas: '#080B10',
  surface: '#0D1218',
  surfaceRaised: '#121820',
  line: '#1E2530',
  lineStrong: '#2E3742',
  /** Input and control boundaries: 3:1 or better on every surface (WCAG 1.4.11). */
  field: '#6A7078',
  ink: '#ECE6DA',
  inkMuted: '#A8A295',
  /** Smallest text on dark: 4.5:1 or better on every surface. */
  inkFaint: '#8B8780',
  /** Gold: highlights, active tabs, key numbers and the spotlight. */
  accent: '#C9A45C',
  goldDim: '#1C1810',
  paper: '#F1EBDD',
  /** Red is reserved for danger, failure and alarms. 4.5:1 or better as text on every surface. */
  alarm: '#E06356',
  // Legacy aliases: `signal` is gold, `vital` and `caution` are bone.
  signal: '#C9A45C',
  vital: '#ECE6DA',
  caution: '#ECE6DA',
} as const;

/** Maximum corner radius in the system. */
export const RADIUS = 4;

export type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

/** Categories are told apart by icon and label, never by hue. */
export const categoryStyle: Record<string, { icon: IconName; color: string }> = {
  Hepatobiliary: { icon: 'stomach', color: palette.inkMuted },
  'Emergency General Surgery': { icon: 'hospital-box-outline', color: palette.inkMuted },
  Colorectal: { icon: 'bacteria', color: palette.inkMuted },
  Hernia: { icon: 'layers-outline', color: palette.inkMuted },
  Trauma: { icon: 'ambulance', color: palette.inkMuted },
  'Bedside Procedures': { icon: 'needle', color: palette.inkMuted },
  'Perioperative Safety': { icon: 'shield-check-outline', color: palette.inkMuted },
  'Plastic Surgery': { icon: 'content-cut', color: palette.inkMuted },
  Vascular: { icon: 'heart-pulse', color: palette.inkMuted },
  Urology: { icon: 'water-outline', color: palette.inkMuted },
  'Pediatric Surgery': { icon: 'baby-face-outline', color: palette.inkMuted },
  Otolaryngology: { icon: 'ear-hearing', color: palette.inkMuted },
  'Orthopedic Trauma': { icon: 'bone', color: palette.inkMuted },
  Ophthalmology: { icon: 'eye-outline', color: palette.inkMuted },
  Neurovascular: { icon: 'brain', color: palette.inkMuted },
  Neurotrauma: { icon: 'brain', color: palette.inkMuted },
  'Gynecologic Oncology': { icon: 'ribbon', color: palette.inkMuted },
  Obstetrics: { icon: 'baby-carriage', color: palette.inkMuted },
  Gynecology: { icon: 'human-pregnant', color: palette.inkMuted },
  'Aortic Disease': { icon: 'heart-flash', color: palette.inkMuted },
  Thoracic: { icon: 'lungs', color: palette.inkMuted },
  'Oral and Maxillofacial': { icon: 'tooth-outline', color: palette.inkMuted },
};

export function styleForCategory(category: string | undefined) {
  return categoryStyle[category ?? ''] ?? { icon: 'stethoscope' as IconName, color: palette.inkMuted };
}

/** `#RRGGBB` + alpha (0–1) → `#RRGGBBAA`. */
export function withAlpha(hex: string, alpha: number): string {
  return `${hex}${Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0')}`;
}
