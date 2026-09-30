/**
 * Reference values shown when a monitor reading is hovered or tapped. Laboratories differ; these are
 * orientation values, not diagnostic thresholds. Every entry is sourced (see docs/EVIDENCE.md,
 * "Monitor reference values"):
 * - Resting adult vital signs: MedlinePlus, "Vital signs" (A.D.A.M. Medical Encyclopedia, article 002341).
 * - SpO2: MedlinePlus Lab Tests, "Pulse oximetry".
 * - Laboratory values: MedlinePlus Medical Encyclopedia test articles (WBC count 003643, blood differential
 *   003657, C-reactive protein 003356, lactic acid 003507, potassium 003484, creatinine 003475,
 *   prothrombin time 003652, platelet count 003647, BUN 003474, hematocrit 003646, hemoglobin 003645,
 *   bilirubin 003479, CO2 003469, tonometry 003447, polysomnography 003932).
 * - GCS severity, ICP and CPP: Brain Trauma Foundation, Guidelines for the Management of Severe
 *   Traumatic Brain Injury, 4th edition (2016).
 * A label with no entry shows REFERENCE_RANGE_FALLBACK instead.
 */
export const REFERENCE_RANGES: Record<string, string> = {
  HR: '60–100 bpm (resting adult)',
  BP: '90/60 to 120/80 mmHg (resting adult)',
  RR: '12–18 /min (resting adult)',
  Temp: '36.5–37.3 °C (resting adult)',
  SpO2: '95–100 %',
  GCS: 'Scale 3–15; a score of 3–8 defines severe TBI',
  WBC: '4.5–11.0 ×10³/µL (same as ×10⁹/L)',
  Neut: '40–60 % of white cells',
  CRP: 'Under 3 mg/L in most healthy adults',
  Lactate: '0.5–2.2 mmol/L',
  K: '3.7–5.2 mmol/L',
  Cr: 'Men 0.7–1.3 mg/dL; women 0.5–0.95 mg/dL',
  INR: '0.8–1.1 off anticoagulants',
  Plt: '150–400 ×10³/µL',
  BUN: '6–20 mg/dL',
  Hct: 'Men 37–48 %; women 34–43 %',
  Hb: 'Men 13.8–17.2 g/dL; women 12.1–15.1 g/dL',
  Lipase: 'Upper limit is set by each laboratory; the case gives it',
  Bili: 'Total 0.1–1.2 mg/dL',
  HCO3: '23–29 mmol/L',
  IOP: '10–21 mmHg',
  AHI: 'Under 5 /h is normal in adults; no pediatric range listed',
  ICP: 'Severe TBI: treat above 22 mmHg',
  CPP: 'Severe TBI: target 60–70 mmHg',
};

/** Shown for a reading with no entry above. */
export const REFERENCE_RANGE_FALLBACK = 'No reference range listed for this reading';

/**
 * Cases whose patient is a child or adolescent. Every range above is an adult value, and no sourced
 * paediatric set has been read, so these cases show no ranges. A test keeps this list in step with the
 * ages written in each case's opening text.
 */
export const PEDIATRIC_CASES = new Set([
  'pyloric-stenosis',
  'intussusception',
  'pediatric-spleen-injury',
  'tonsillectomy',
  'testicular-torsion',
  'adnexal-torsion',
]);

/** Pregnant or postpartum patients: pregnancy changes normal values, and no sourced obstetric set has been read. */
export const OBSTETRIC_CASES = new Set(['postpartum-hemorrhage', 'ectopic-pregnancy']);

/** The sourced reference text for a reading in a given case, or undefined when none applies. */
export function referenceRangeFor(procedureId: string, label: string): string | undefined {
  if (PEDIATRIC_CASES.has(procedureId) || OBSTETRIC_CASES.has(procedureId)) return undefined;
  return REFERENCE_RANGES[label];
}

export type ReadingGroup = 'vital' | 'observation' | 'lab';

/** Display order. Readings not listed sort after these, in their authored order. */
export const READING_ORDER = [
  // Vital signs
  'HR',
  'BP',
  'MAP',
  'RR',
  'SpO2',
  'Temp',
  // Bedside observations and monitoring
  'GCS',
  'ICP',
  'CPP',
  'IOP',
  'AHI',
  'Since injury',
  // Laboratory values
  'Hb',
  'Hct',
  'WBC',
  'Neut',
  'Plt',
  'INR',
  'K',
  'HCO3',
  'Lactate',
  'BUN',
  'Cr',
  'CRP',
  'Bili',
  'Lipase',
] as const;

const VITAL_LABELS = new Set(['HR', 'BP', 'MAP', 'RR', 'SpO2', 'Temp']);
const OBSERVATION_LABELS = new Set(['GCS', 'ICP', 'CPP', 'IOP', 'AHI', 'Since injury']);

export function readingGroup(label: string): ReadingGroup {
  if (VITAL_LABELS.has(label)) return 'vital';
  if (OBSERVATION_LABELS.has(label)) return 'observation';
  return 'lab';
}

/** Sort readings into READING_ORDER, keeping the authored order for anything unlisted. */
export function orderReadings<T extends { label: string }>(readings: readonly T[]): T[] {
  const rank = (label: string) => {
    const i = (READING_ORDER as readonly string[]).indexOf(label);
    return i === -1 ? READING_ORDER.length : i;
  };
  return readings
    .map((reading, i) => ({ reading, i }))
    .sort((a, b) => rank(a.reading.label) - rank(b.reading.label) || a.i - b.i)
    .map((x) => x.reading);
}
