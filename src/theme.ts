import type { ComponentProps } from 'react';
import type MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

/**
 * Raw palette for places className cannot reach (SVG strokes, icon tints). Mirrors tailwind.config.js:
 * two anchors (ink-black, warm bone) and a single accent (arterial red).
 */
export const palette = {
  canvas: '#0B0D0F',
  surface: '#111417',
  surfaceRaised: '#161A1E',
  line: '#252A30',
  lineStrong: '#3A4148',
  ink: '#ECE6DA',
  inkMuted: '#A39C8F',
  inkFaint: '#6B665D',
  accent: '#D9483B',
  paper: '#F1EBDD',
  // Legacy aliases, so status reads through the restrained palette.
  signal: '#D9483B',
  alarm: '#D9483B',
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
