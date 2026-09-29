import type { IconName } from '@/theme';

/**
 * Library sections: the surgical specialties recognized by the American College of Surgeons.
 * Every procedure is filed under exactly one section (its first tag) and may also train others.
 */
export type SpecialtyId =
  | 'general'
  | 'cardiothoracic'
  | 'colorectal'
  | 'obgyn'
  | 'gyn-onc'
  | 'neurosurgery'
  | 'ophthalmology'
  | 'omfs'
  | 'orthopedics'
  | 'ent'
  | 'pediatric'
  | 'plastics'
  | 'urology'
  | 'vascular';

/** Non-surgical disciplines whose trainees use these cases; they match cases but are not library tabs. */
export type AudienceId = 'emergency' | 'anesthesiology' | 'critical-care';

export type Tag = SpecialtyId | AudienceId;

export interface Specialty {
  id: SpecialtyId;
  label: string;
  /** Tab label. */
  short: string;
  icon: IconName;
}

/** In library order. */
export const SPECIALTIES: Specialty[] = [
  { id: 'general', label: 'General Surgery', short: 'General', icon: 'hospital-building' },
  { id: 'cardiothoracic', label: 'Cardiothoracic Surgery', short: 'Cardiothoracic', icon: 'heart-pulse' },
  { id: 'colorectal', label: 'Colon and Rectal Surgery', short: 'Colorectal', icon: 'stomach' },
  { id: 'obgyn', label: 'Gynecology and Obstetrics', short: 'OB/GYN', icon: 'human-pregnant' },
  { id: 'gyn-onc', label: 'Gynecologic Oncology', short: 'Gyn Onc', icon: 'ribbon' },
  { id: 'neurosurgery', label: 'Neurological Surgery', short: 'Neurosurgery', icon: 'brain' },
  { id: 'ophthalmology', label: 'Ophthalmic Surgery', short: 'Ophthalmology', icon: 'eye-outline' },
  { id: 'omfs', label: 'Oral and Maxillofacial Surgery', short: 'OMFS', icon: 'tooth-outline' },
  { id: 'orthopedics', label: 'Orthopedic Surgery', short: 'Orthopedics', icon: 'bone' },
  { id: 'ent', label: 'Otorhinolaryngology (ENT)', short: 'ENT', icon: 'ear-hearing' },
  { id: 'pediatric', label: 'Pediatric Surgery', short: 'Pediatric', icon: 'baby-face-outline' },
  { id: 'plastics', label: 'Plastic and Maxillofacial Surgery', short: 'Plastics', icon: 'hand-back-right-outline' },
  { id: 'urology', label: 'Urology', short: 'Urology', icon: 'water-outline' },
  { id: 'vascular', label: 'Vascular Surgery', short: 'Vascular', icon: 'blood-bag' },
];

const BY_ID = Object.fromEntries(SPECIALTIES.map((s) => [s.id, s])) as Record<SpecialtyId, Specialty>;

export function specialty(id: SpecialtyId): Specialty {
  return BY_ID[id];
}

export function isSpecialtyId(tag: string): tag is SpecialtyId {
  return tag in BY_ID;
}

/**
 * Which specialties (and audiences) each case trains. The first entry must be a library section:
 * it is where the case is filed. Every procedure must appear here (tested).
 */
export const PROCEDURE_SPECIALTIES: Record<string, Tag[]> = {
  'lap-chole': ['general'],
  'acute-cholecystitis': ['general'],
  'gallstone-pancreatitis': ['general', 'critical-care', 'emergency'],
  'acute-appendicitis': ['general', 'emergency'],
  'adhesive-sbo': ['general'],
  'perforated-peptic-ulcer': ['general'],
  'acute-diverticulitis': ['colorectal', 'general'],
  'tapp-inguinal-hernia': ['general'],
  'trauma-primary-survey': ['general', 'emergency', 'critical-care'],
  'central-line-ij': ['general', 'critical-care', 'anesthesiology', 'emergency'],
  'surgical-safety-checklist': ['general', 'anesthesiology'],
  'spontaneous-pneumothorax': ['cardiothoracic', 'emergency'],
  'acute-aortic-dissection': ['cardiothoracic', 'vascular', 'emergency'],
  'pleural-infection': ['cardiothoracic', 'critical-care'],
  'sigmoid-volvulus': ['colorectal', 'general'],
  'fulminant-c-difficile': ['colorectal', 'general', 'critical-care'],
  'ectopic-pregnancy': ['obgyn', 'emergency'],
  'postpartum-hemorrhage': ['obgyn', 'emergency', 'anesthesiology'],
  'adnexal-torsion': ['obgyn', 'pediatric', 'emergency'],
  'early-endometrial-cancer': ['gyn-onc', 'obgyn'],
  'early-cervical-cancer': ['gyn-onc', 'obgyn'],
  'severe-tbi': ['neurosurgery', 'critical-care', 'general'],
  'traumatic-intracranial-hematoma': ['neurosurgery', 'emergency', 'general'],
  'aneurysmal-sah': ['neurosurgery', 'emergency', 'critical-care'],
  'advanced-ovarian-cancer': ['gyn-onc', 'obgyn'],
  'acute-angle-closure': ['ophthalmology', 'emergency'],
  'postoperative-endophthalmitis': ['ophthalmology'],
  'open-globe-injury': ['ophthalmology', 'emergency'],
  'hip-fracture': ['orthopedics', 'anesthesiology'],
  'open-tibial-fracture': ['orthopedics', 'plastics', 'vascular', 'emergency'],
  'acute-compartment-syndrome': ['orthopedics', 'general', 'emergency'],
  'epistaxis': ['ent', 'emergency'],
  'tonsillectomy': ['ent', 'pediatric', 'anesthesiology'],
  'adult-neck-mass': ['ent', 'general'],
  'intussusception': ['pediatric', 'emergency'],
  'pyloric-stenosis': ['pediatric', 'anesthesiology'],
  'pediatric-spleen-injury': ['pediatric', 'general', 'emergency'],
  'obstructing-infected-stone': ['urology', 'emergency', 'critical-care'],
  'bladder-trauma': ['urology', 'general', 'emergency'],
  'testicular-torsion': ['urology', 'pediatric', 'emergency'],
  'acute-limb-ischemia': ['vascular', 'general', 'emergency'],
  'ruptured-aaa': ['vascular', 'general', 'emergency'],
  'symptomatic-carotid-stenosis': ['vascular', 'neurosurgery'],
  'cutaneous-melanoma': ['plastics', 'general'],
  'major-burn': ['plastics', 'general', 'emergency'],
  'necrotizing-soft-tissue-infection': ['plastics', 'general', 'emergency'],
  'early-oral-cavity-cancer': ['omfs', 'ent'],
  'mronj-risk': ['omfs'],
  'mandibular-third-molar': ['omfs'],
};

/** Fundamentals for anyone who operates or works in the OR, whatever their specialty. */
export const CORE_PROCEDURES = ['surgical-safety-checklist', 'trauma-primary-survey', 'central-line-ij'];

export function specialtiesOf(procedureId: string): Tag[] {
  return PROCEDURE_SPECIALTIES[procedureId] ?? ['general'];
}

/** The library section a case is filed under. */
export function primarySpecialtyLabel(procedureId: string): string {
  if (procedureId === 'surgical-safety-checklist') return 'Every specialty';
  const first = specialtiesOf(procedureId)[0]!;
  return isSpecialtyId(first) ? specialty(first).label : 'General Surgery';
}

/** Section labels a case appears under, primary first (audiences excluded). */
export function sectionLabels(procedureId: string): string[] {
  return specialtiesOf(procedureId)
    .filter(isSpecialtyId)
    .map((id) => specialty(id).label);
}

// ——— Onboarding choices ———

export type TrainingStage = 'student' | 'intern' | 'resident' | 'fellow' | 'attending' | 'other';

export const TRAINING_STAGES: { id: TrainingStage; label: string; detail: string; short: string }[] = [
  { id: 'student', label: 'Medical student', detail: 'Clerkships, sub-internships, applying', short: 'medical student' },
  { id: 'intern', label: 'Intern (PGY-1)', detail: 'First year of residency', short: 'PGY-1' },
  { id: 'resident', label: 'Resident (PGY-2 and up)', detail: 'Senior and chief years', short: 'resident' },
  { id: 'fellow', label: 'Fellow', detail: 'Subspecialty training', short: 'fellow' },
  { id: 'attending', label: 'Attending or consultant', detail: 'Independent practice or teaching', short: 'attending' },
  { id: 'other', label: 'Other clinician', detail: 'PA, NP, nurse, or allied health', short: 'clinician' },
];

/** Everything a learner can name in the quiz: the 14 sections, three audiences, or undecided. */
export type SpecialtyChoice = SpecialtyId | AudienceId | 'undecided';

export const SPECIALTY_CHOICES: { id: SpecialtyChoice; label: string; library: Tag[] }[] = [
  ...SPECIALTIES.map((s) => ({ id: s.id as SpecialtyChoice, label: s.label, library: [s.id] as Tag[] })),
  { id: 'emergency', label: 'Emergency Medicine', library: ['emergency'] },
  { id: 'anesthesiology', label: 'Anesthesiology', library: ['anesthesiology'] },
  { id: 'critical-care', label: 'Critical Care', library: ['critical-care'] },
  { id: 'undecided', label: 'Undecided', library: ['general'] },
];

const CHOICE_IDS = new Set<string>(SPECIALTY_CHOICES.map((c) => c.id));

/** Earlier builds offered HPB, acute care, and MIS as choices; they now map to General Surgery. */
const RENAMED: Record<string, SpecialtyChoice> = {
  hpb: 'general',
  'acute-care': 'general',
  mis: 'general',
  orthopaedics: 'orthopedics',
};

/** Normalize a stored or synced choice id to the current list. */
export function normalizeChoice(id: string): SpecialtyChoice {
  if (CHOICE_IDS.has(id)) return id as SpecialtyChoice;
  return RENAMED[id] ?? 'undecided';
}

/** Map choices saved by earlier builds (HPB, acute care, MIS, "orthopaedics") onto the current sections. */
export function normalizeProfile<T extends { specialty: string; interests: string[] }>(
  profile: T,
): T & { specialty: SpecialtyChoice; interests: SpecialtyChoice[] } {
  const specialty = normalizeChoice(profile.specialty);
  const interests = [...new Set(profile.interests.map(normalizeChoice))].filter((i) => i !== specialty && i !== 'undecided');
  return { ...profile, specialty, interests };
}

export function specialtyChoice(id: SpecialtyChoice) {
  return SPECIALTY_CHOICES.find((c) => c.id === id) ?? SPECIALTY_CHOICES[SPECIALTY_CHOICES.length - 1]!;
}

export function trainingStage(id: TrainingStage) {
  return TRAINING_STAGES.find((s) => s.id === id) ?? TRAINING_STAGES[TRAINING_STAGES.length - 1]!;
}
