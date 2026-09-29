import type { ImageSourcePropType } from 'react-native';

/**
 * Anatomical plates from Henry Gray, "Anatomy of the Human Body" (1918), public domain,
 * via Wikimedia Commons. Processed into two styles by scripts/prepare-figures.py.
 */
export interface Figure {
  plate: ImageSourcePropType;
  ghost: ImageSourcePropType;
  /** Figure number as printed, e.g. "Fig. 1098". */
  label: string;
  caption: string;
  /** width / height of the processed plate. */
  aspect: number;
}

export const FIGURE_CREDIT = "Anatomical plates: Gray's Anatomy (1918), public domain, via Wikimedia Commons.";

const gallbladder: Figure = {
  plate: require('../../assets/figures/gallbladder-plate.jpg'),
  ghost: require('../../assets/figures/gallbladder-ghost.png'),
  label: 'Plate',
  caption: 'The gall-bladder and bile ducts (after Gray).',
  aspect: 472 / 374,
};

const figures: Record<string, Figure> = {
  'lap-chole': gallbladder,
  'acute-cholecystitis': gallbladder,
  'gallstone-pancreatitis': {
    plate: require('../../assets/figures/pancreas-plate.jpg'),
    ghost: require('../../assets/figures/pancreas-ghost.png'),
    label: 'Fig. 1098',
    caption: 'The duodenum and pancreas.',
    aspect: 696 / 496,
  },
  'acute-appendicitis': {
    plate: require('../../assets/figures/appendix-plate.jpg'),
    ghost: require('../../assets/figures/appendix-ghost.png'),
    label: 'Fig. 1073',
    caption: 'The cecum and vermiform process, with their arteries.',
    aspect: 500 / 405,
  },
  'adhesive-sbo': {
    plate: require('../../assets/figures/ileocecal-plate.jpg'),
    ghost: require('../../assets/figures/ileocecal-ghost.png'),
    label: 'Fig. 1044',
    caption: 'The terminal ileum at the inferior ileocecal fossa.',
    aspect: 550 / 313,
  },
  'perforated-peptic-ulcer': {
    plate: require('../../assets/figures/stomach-plate.jpg'),
    ghost: require('../../assets/figures/stomach-ghost.png'),
    label: 'Fig. 1050',
    caption: 'The interior of the stomach.',
    aspect: 500 / 327,
  },
  'acute-diverticulitis': {
    plate: require('../../assets/figures/sigmoid-plate.jpg'),
    ghost: require('../../assets/figures/sigmoid-ghost.png'),
    label: 'Fig. 1076',
    caption: 'Iliac colon, sigmoid colon, and rectum.',
    aspect: 600 / 503,
  },
  'central-line-ij': {
    plate: require('../../assets/figures/neck-plate.jpg'),
    ghost: require('../../assets/figures/neck-ghost.png'),
    label: 'Fig. 557',
    caption: 'Veins of the head and neck, lateral view.',
    aspect: 1000 / 1181,
  },
};

export function figureFor(procedureId: string): Figure | undefined {
  return figures[procedureId];
}
