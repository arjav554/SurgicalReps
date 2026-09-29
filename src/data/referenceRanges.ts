/**
 * Typical adult reference ranges shown when a monitor reading is hovered or tapped.
 * Laboratories differ; these are orientation values, not diagnostic thresholds.
 */
export const REFERENCE_RANGES: Record<string, string> = {
  HR: '60–100 bpm',
  BP: 'Systolic 90–120 / diastolic 60–80 mmHg',
  MAP: '70–100 mmHg (sepsis target ≥ 65)',
  SpO2: '95–100 %',
  RR: '12–20 /min',
  Temp: '36.1–37.2 °C (fever ≥ 38.0 °C)',
  GCS: '15 (scale 3–15)',
  WBC: '4.0–11.0 ×10³/µL',
  Neut: '40–70 % of white cells',
  CRP: '< 10 mg/L',
  Lactate: '0.5–2.0 mmol/L',
  K: '3.5–5.0 mmol/L',
  Cr: '0.6–1.2 mg/dL',
  INR: '0.8–1.2 (off anticoagulation)',
  Plt: '150–400 ×10³/µL',
  BUN: '7–20 mg/dL',
  Hct: '≈ 36–50 % (sex-specific)',
  Lipase: 'Below the laboratory upper limit (here 60 U/L); > 3× supports pancreatitis',
  Bili: '0.1–1.2 mg/dL',
  'Since injury': 'Tranexamic acid benefit window: within 3 h of injury',
};
