export type NodeId = string;

/** Every procedure graph is entered through this node. */
export const START_NODE_ID: NodeId = 'start';

export type TerminalStatus = 'success' | 'failure';

export type VitalStatus = 'normal' | 'warning' | 'critical';

/** One monitor reading shown alongside a node, e.g. HR 132 (critical). */
export interface Vital {
  label: string;
  value: string;
  unit?: string;
  status?: VitalStatus;
  /** Short text qualifier shown with the value, e.g. a rhythm ("Irregular") or where it was measured. */
  note?: string;
}

/**
 * 1-based indices into the procedure's `references` that support a statement.
 * See docs/CONTENT_POLICY.md: every rationale must carry at least one.
 */
export type Citation = number[];

export interface DecisionOption {
  label: string;
  next: NodeId;
  isCorrect: boolean;
  /** Incorrect options: the complication explanation. Correct options: the teaching rationale. */
  feedback?: string;
  /** Sources for `feedback`. Required whenever `feedback` is present. */
  cite?: Citation;
}

export interface MultiOption {
  label: string;
  isCorrect: boolean;
}

export interface InfoNode {
  type: 'info';
  text: string;
  vitals?: Vital[];
  next: NodeId;
  /** Sources for any clinical statement in `text` beyond the scenario itself. */
  cite?: Citation;
}

/** Single best answer. */
export interface DecisionNode {
  type: 'decision';
  text: string;
  vitals?: Vital[];
  options: DecisionOption[];
}

/** Select all that apply: passes only when the chosen set exactly matches the correct set. */
export interface MultiSelectNode {
  type: 'multi';
  text: string;
  vitals?: Vital[];
  options: MultiOption[];
  /** Shown as the complication explanation on failure and as the rationale in the debrief. */
  feedback: string;
  /** Sources for `feedback` and for which options are correct. */
  cite: Citation;
  next: NodeId;
  failNext: NodeId;
}

export interface ChanceOutcome {
  next: NodeId;
  weight: number;
}

/**
 * Invisible branch point resolved the moment it is entered, so repeated reps
 * meet different case variants (CT findings, hemodynamics, intraoperative anatomy).
 */
export interface ChanceNode {
  type: 'chance';
  outcomes: ChanceOutcome[];
}

export interface TerminalNode {
  type: 'terminal';
  status: TerminalStatus;
  text: string;
  vitals?: Vital[];
}

export type ProcedureNode = InfoNode | DecisionNode | MultiSelectNode | ChanceNode | TerminalNode;

/** Nodes the resident actually sees. */
export type VisibleNode = Exclude<ProcedureNode, ChanceNode>;

/** What kind of source a reference is. Narrative reviews may support, never stand alone for, a claim. */
export type EvidenceKind =
  | 'guideline'
  | 'consensus'
  | 'trial'
  | 'systematic-review'
  | 'cohort'
  | 'classification'
  | 'review'
  | 'textbook'
  | 'regulatory';

export const EVIDENCE_KINDS: readonly EvidenceKind[] = [
  'guideline',
  'consensus',
  'trial',
  'systematic-review',
  'cohort',
  'classification',
  'review',
  'textbook',
  'regulatory',
];

/** A published source the procedure's content is drawn from, with identifiers that can be checked. */
export interface Reference {
  /** Vancouver-style: authors, title, journal or publisher, year, volume, pages. */
  citation: string;
  /** Where the source can be read: doi.org, PubMed/PMC, or the issuing body's own page. */
  url: string;
  kind: EvidenceKind;
  pmid?: string;
  doi?: string;
}

export interface Procedure {
  id: string;
  title: string;
  description: string;
  category?: string;
  objectives: string[];
  references: Reference[];
  /** ISO date the content was last checked against its sources. */
  reviewed: string;
  nodes: Record<NodeId, ProcedureNode>;
}
