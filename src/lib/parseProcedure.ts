import {
  EVIDENCE_KINDS,
  START_NODE_ID,
  type ChanceOutcome,
  type Citation,
  type DecisionOption,
  type EvidenceKind,
  type MultiOption,
  type NodeId,
  type Procedure,
  type ProcedureNode,
  type Reference,
  type Vital,
} from '@/types/procedure';

/** PubMed identifiers are plain integers; DOIs are `10.<registrant>/<suffix>`. */
export const PMID_PATTERN = /^[1-9]\d{0,8}$/;
export const DOI_PATTERN = /^10\.\d{4,9}\/\S+$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * JSON imports are typed structurally (`type: string`, not the literal union),
 * so every procedure is validated at load time instead of being cast. This also
 * catches authoring mistakes in the graph itself: a missing entry node, a `next`
 * pointer that leads nowhere, an unreachable node, a cycle, or a scenario that
 * cannot be won all fail loudly here rather than mid-simulation.
 *
 * It also enforces the sourcing rules in docs/CONTENT_POLICY.md: every rationale
 * must cite the procedure's references, and every reference must carry a checkable
 * identifier. Content that breaks them does not load.
 */
export function parseProcedure(raw: unknown): Procedure {
  const root = expectRecord(raw, 'procedure');
  const id = expectString(root.id, 'procedure.id');
  const title = expectString(root.title, `${id}.title`);
  const description = expectString(root.description, `${id}.description`);
  const category =
    root.category === undefined ? undefined : expectString(root.category, `${id}.category`);
  const objectives =
    root.objectives === undefined
      ? []
      : expectArray(root.objectives, `${id}.objectives`).map((o, i) =>
          expectString(o, `${id}.objectives[${i}]`),
        );
  const references = parseReferences(root.references, `${id}.references`);
  const reviewed = parseReviewed(root.reviewed, `${id}.reviewed`);
  const rawNodes = expectRecord(root.nodes, `${id}.nodes`);

  const nodes: Record<NodeId, ProcedureNode> = {};
  for (const [nodeId, rawNode] of Object.entries(rawNodes)) {
    nodes[nodeId] = parseNode(rawNode, `${id}.nodes.${nodeId}`, references.length);
  }

  if (!nodes[START_NODE_ID]) {
    throw new Error(`${id}: missing entry node "${START_NODE_ID}"`);
  }
  if (nodes[START_NODE_ID].type === 'terminal') {
    throw new Error(`${id}: entry node "${START_NODE_ID}" cannot be terminal`);
  }

  for (const [nodeId, node] of Object.entries(nodes)) {
    for (const target of outgoingEdges(node)) {
      if (!nodes[target]) {
        throw new Error(`${id}.nodes.${nodeId}: "next" points to unknown node "${target}"`);
      }
    }
  }

  assertAcyclic(id, nodes);

  const reachable = reachableFrom(START_NODE_ID, nodes);
  const orphans = Object.keys(nodes).filter((nodeId) => !reachable.has(nodeId));
  if (orphans.length > 0) {
    throw new Error(`${id}: unreachable from "${START_NODE_ID}": ${orphans.join(', ')}`);
  }
  const winnable = [...reachable].some((nodeId) => {
    const node = nodes[nodeId];
    return node?.type === 'terminal' && node.status === 'success';
  });
  if (!winnable) {
    throw new Error(`${id}: no reachable success terminal`);
  }

  return { id, title, description, category, objectives, references, reviewed, nodes };
}

export function outgoingEdges(node: ProcedureNode): NodeId[] {
  switch (node.type) {
    case 'info':
      return [node.next];
    case 'decision':
      return node.options.map((option) => option.next);
    case 'multi':
      return [node.next, node.failNext];
    case 'chance':
      return node.outcomes.map((outcome) => outcome.next);
    case 'terminal':
      return [];
  }
}

function reachableFrom(start: NodeId, nodes: Record<NodeId, ProcedureNode>): Set<NodeId> {
  const seen = new Set<NodeId>();
  const stack = [start];
  while (stack.length > 0) {
    const nodeId = stack.pop();
    if (nodeId === undefined || seen.has(nodeId)) continue;
    seen.add(nodeId);
    const node = nodes[nodeId];
    if (node) stack.push(...outgoingEdges(node));
  }
  return seen;
}

/** Scenarios move forward in time; a cycle would let a chance loop spin forever. */
function assertAcyclic(id: string, nodes: Record<NodeId, ProcedureNode>) {
  const state = new Map<NodeId, 'visiting' | 'done'>();
  const visit = (nodeId: NodeId, trail: NodeId[]) => {
    const current = state.get(nodeId);
    if (current === 'done') return;
    if (current === 'visiting') {
      throw new Error(`${id}: cycle ${[...trail, nodeId].join(' -> ')}`);
    }
    state.set(nodeId, 'visiting');
    const node = nodes[nodeId];
    if (node) for (const next of outgoingEdges(node)) visit(next, [...trail, nodeId]);
    state.set(nodeId, 'done');
  };
  for (const nodeId of Object.keys(nodes)) visit(nodeId, []);
}

function parseNode(raw: unknown, path: string, referenceCount: number): ProcedureNode {
  const node = expectRecord(raw, path);

  if (node.type === 'chance') {
    const outcomes = expectArray(node.outcomes, `${path}.outcomes`).map((o, i) =>
      parseOutcome(o, `${path}.outcomes[${i}]`),
    );
    if (outcomes.length < 2) throw new Error(`${path}.outcomes: a chance node needs 2+ outcomes`);
    return { type: 'chance', outcomes };
  }

  const text = expectString(node.text, `${path}.text`);
  const vitals =
    node.vitals === undefined
      ? undefined
      : expectArray(node.vitals, `${path}.vitals`).map((v, i) =>
          parseVital(v, `${path}.vitals[${i}]`),
        );

  switch (node.type) {
    case 'info': {
      const cite = node.cite === undefined ? undefined : parseCite(node.cite, `${path}.cite`, referenceCount);
      return { type: 'info', text, vitals, next: expectString(node.next, `${path}.next`), ...(cite && { cite }) };
    }
    case 'decision': {
      const options = expectArray(node.options, `${path}.options`).map((option, i) =>
        parseOption(option, `${path}.options[${i}]`, referenceCount),
      );
      if (options.length < 2) throw new Error(`${path}.options: expected 2+ options`);
      return { type: 'decision', text, vitals, options };
    }
    case 'multi': {
      const options = expectArray(node.options, `${path}.options`).map((option, i) =>
        parseMultiOption(option, `${path}.options[${i}]`),
      );
      if (options.length < 3) throw new Error(`${path}.options: expected 3+ options`);
      if (!options.some((o) => o.isCorrect) || options.every((o) => o.isCorrect)) {
        throw new Error(`${path}.options: needs both correct and incorrect options`);
      }
      return {
        type: 'multi',
        text,
        vitals,
        options,
        feedback: expectString(node.feedback, `${path}.feedback`),
        cite: parseCite(node.cite, `${path}.cite`, referenceCount),
        next: expectString(node.next, `${path}.next`),
        failNext: expectString(node.failNext, `${path}.failNext`),
      };
    }
    case 'terminal': {
      if (node.status !== 'success' && node.status !== 'failure') {
        throw new Error(`${path}.status: expected "success" or "failure"`);
      }
      return { type: 'terminal', status: node.status, text, vitals };
    }
    default:
      throw new Error(`${path}.type: unknown node type ${JSON.stringify(node.type)}`);
  }
}

function parseOption(raw: unknown, path: string, referenceCount: number): DecisionOption {
  const option = expectRecord(raw, path);
  if (typeof option.isCorrect !== 'boolean') {
    throw new Error(`${path}.isCorrect: expected a boolean`);
  }
  const feedback =
    option.feedback === undefined ? undefined : expectString(option.feedback, `${path}.feedback`);
  // A rationale with no source is exactly what the content policy forbids.
  if (feedback !== undefined && option.cite === undefined) {
    throw new Error(`${path}.cite: feedback must cite at least one reference`);
  }
  const cite = option.cite === undefined ? undefined : parseCite(option.cite, `${path}.cite`, referenceCount);
  return {
    label: expectString(option.label, `${path}.label`),
    next: expectString(option.next, `${path}.next`),
    isCorrect: option.isCorrect,
    feedback,
    ...(cite && { cite }),
  };
}

/** 1-based, unique, in range, and at least one. */
function parseCite(raw: unknown, path: string, referenceCount: number): Citation {
  const list = expectArray(raw, path);
  if (list.length === 0) throw new Error(`${path}: cite at least one reference`);
  const seen = new Set<number>();
  for (const entry of list) {
    if (typeof entry !== 'number' || !Number.isInteger(entry) || entry < 1 || entry > referenceCount) {
      throw new Error(`${path}: ${JSON.stringify(entry)} is not a reference number (1–${referenceCount})`);
    }
    if (seen.has(entry)) throw new Error(`${path}: reference ${entry} is cited twice`);
    seen.add(entry);
  }
  return [...seen];
}

function parseReviewed(raw: unknown, path: string): string {
  const value = expectString(raw, path);
  const time = Date.parse(`${value}T00:00:00Z`);
  if (!ISO_DATE.test(value) || Number.isNaN(time) || new Date(time).toISOString().slice(0, 10) !== value) {
    throw new Error(`${path}: expected an ISO date (YYYY-MM-DD)`);
  }
  return value;
}

function parseMultiOption(raw: unknown, path: string): MultiOption {
  const option = expectRecord(raw, path);
  if (typeof option.isCorrect !== 'boolean') {
    throw new Error(`${path}.isCorrect: expected a boolean`);
  }
  return { label: expectString(option.label, `${path}.label`), isCorrect: option.isCorrect };
}

function parseOutcome(raw: unknown, path: string): ChanceOutcome {
  const outcome = expectRecord(raw, path);
  if (typeof outcome.weight !== 'number' || !(outcome.weight > 0)) {
    throw new Error(`${path}.weight: expected a positive number`);
  }
  return { next: expectString(outcome.next, `${path}.next`), weight: outcome.weight };
}

const VITAL_STATUSES = new Set(['normal', 'warning', 'critical']);

function parseVital(raw: unknown, path: string): Vital {
  const vital = expectRecord(raw, path);
  if (vital.status !== undefined && !VITAL_STATUSES.has(vital.status as string)) {
    throw new Error(`${path}.status: expected normal, warning, or critical`);
  }
  return {
    label: expectString(vital.label, `${path}.label`),
    value: expectString(vital.value, `${path}.value`),
    unit: vital.unit === undefined ? undefined : expectString(vital.unit, `${path}.unit`),
    status: vital.status as Vital['status'],
    ...(vital.note !== undefined && { note: expectString(vital.note, `${path}.note`) }),
  };
}

function parseReferences(raw: unknown, path: string): Reference[] {
  const list = expectArray(raw, path);
  if (list.length === 0) throw new Error(`${path}: at least one reference is required`);
  return list.map((entry, i) => {
    const at = `${path}[${i}]`;
    const reference = expectRecord(entry, at);
    const url = expectString(reference.url, `${at}.url`);
    if (!url.startsWith('https://')) throw new Error(`${at}.url: expected an https:// link to the source`);
    if (!EVIDENCE_KINDS.includes(reference.kind as EvidenceKind)) {
      throw new Error(`${at}.kind: expected one of ${EVIDENCE_KINDS.join(', ')}`);
    }
    const pmid = reference.pmid === undefined ? undefined : expectString(reference.pmid, `${at}.pmid`);
    if (pmid !== undefined && !PMID_PATTERN.test(pmid)) throw new Error(`${at}.pmid: not a PubMed ID`);
    const doi = reference.doi === undefined ? undefined : expectString(reference.doi, `${at}.doi`);
    if (doi !== undefined && !DOI_PATTERN.test(doi)) throw new Error(`${at}.doi: not a DOI`);
    return {
      citation: expectString(reference.citation, `${at}.citation`),
      url,
      kind: reference.kind as EvidenceKind,
      ...(pmid && { pmid }),
      ...(doi && { doi }),
    };
  });
}

function expectArray(value: unknown, path: string): unknown[] {
  if (!Array.isArray(value)) throw new Error(`${path}: expected an array`);
  return value;
}

function expectRecord(value: unknown, path: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(`${path}: expected an object`);
  }
  return value as Record<string, unknown>;
}

function expectString(value: unknown, path: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`${path}: expected a non-empty string`);
  }
  return value;
}
