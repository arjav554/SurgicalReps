import { create } from 'zustand';

import {
  START_NODE_ID,
  type ChanceOutcome,
  type NodeId,
  type Procedure,
  type TerminalStatus,
  type VisibleNode,
} from '@/types/procedure';

import { useProgressStore } from './useProgressStore';

export type SimulationStatus = 'running' | TerminalStatus;

export interface SelectedOption {
  optionIndex: number;
  /** Letter the option was shown under this attempt (options are shuffled per attempt). */
  letter: string;
  label: string;
}

export interface ChoiceRecord {
  nodeId: NodeId;
  kind: 'single' | 'multi';
  selected: SelectedOption[];
  isCorrect: boolean;
  feedback: string | undefined;
  /** 1-based reference numbers supporting `feedback`. */
  cite: number[];
  /** Time from the node appearing to the answer being committed. */
  elapsedMs: number;
}

/** Raised when the resident commits an incorrect answer. */
export interface Complication {
  choice: ChoiceRecord;
  /** The node the incorrect answer leads to (normally a failure terminal). */
  outcomeNodeId: NodeId;
}

interface SimulationData {
  procedure: Procedure | null;
  currentNodeId: NodeId | null;
  /** Every node entered this attempt, in order, including resolved chance nodes. */
  path: NodeId[];
  choices: ChoiceRecord[];
  status: SimulationStatus;
  complication: Complication | null;
  /** Display order of option indices per node, shuffled once per attempt. */
  optionOrder: Record<NodeId, number[]>;
  startedAt: number | null;
  nodeEnteredAt: number | null;
  finishedAt: number | null;
  /** Increments on every (re)start so views can remount and replay entry animations. */
  attempt: number;
}

interface SimulationActions {
  start: (procedure: Procedure) => void;
  /** Leave an `info` node via its `next` pointer. */
  advance: () => void;
  /** Answer the current `decision` node with an option's original index. */
  choose: (optionIndex: number) => void;
  /** Answer the current `multi` node with the original indices of every selected option. */
  submitMulti: (optionIndices: number[]) => void;
  restart: () => void;
  exit: () => void;
}

/** Injectable so tests can make chance and shuffling deterministic. */
interface SimulationEnv {
  random: () => number;
  now: () => number;
}

type SimulationState = SimulationData & SimulationActions & SimulationEnv;

const idle: Omit<SimulationData, 'attempt'> = {
  procedure: null,
  currentNodeId: null,
  path: [],
  choices: [],
  status: 'running',
  complication: null,
  optionOrder: {},
  startedAt: null,
  nodeEnteredAt: null,
  finishedAt: null,
};

export function letterFor(position: number): string {
  return String.fromCharCode(65 + position);
}

function shuffled(count: number, random: () => number): number[] {
  const order = Array.from({ length: count }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [order[i], order[j]] = [order[j]!, order[i]!];
  }
  return order;
}

function pickOutcome(outcomes: ChanceOutcome[], random: () => number): NodeId {
  const total = outcomes.reduce((sum, o) => sum + o.weight, 0);
  let roll = random() * total;
  for (const outcome of outcomes) {
    roll -= outcome.weight;
    if (roll < 0) return outcome.next;
  }
  return outcomes[outcomes.length - 1]!.next;
}

export const useSimulationStore = create<SimulationState>()((set, get) => {
  /**
   * State patch for moving into `nodeId`. Chance nodes are resolved on the spot
   * (graphs are acyclic, so this terminates), decision options get their
   * per-attempt order, and reaching a terminal settles and records the run.
   */
  function enter(nodeId: NodeId, from: Pick<SimulationData, 'path' | 'optionOrder'>) {
    const { procedure, random, now, startedAt } = get();
    if (!procedure) throw new Error('No procedure loaded');
    const path = [...from.path];
    let optionOrder = from.optionOrder;
    let id = nodeId;

    for (;;) {
      const node = procedure.nodes[id];
      if (!node) throw new Error(`${procedure.id}: unknown node "${id}"`);
      path.push(id);
      if (node.type === 'chance') {
        id = pickOutcome(node.outcomes, random);
        continue;
      }
      if ((node.type === 'decision' || node.type === 'multi') && !optionOrder[id]) {
        optionOrder = { ...optionOrder, [id]: shuffled(node.options.length, random) };
      }
      const at = now();
      const status: SimulationStatus = node.type === 'terminal' ? node.status : 'running';
      return {
        currentNodeId: id,
        path,
        optionOrder,
        status,
        nodeEnteredAt: at,
        finishedAt: status === 'running' ? null : at,
        durationMs: at - (startedAt ?? at),
      };
    }
  }

  function recordIfFinished(status: SimulationStatus, durationMs: number) {
    const { procedure, now } = get();
    if (procedure && status !== 'running') {
      useProgressStore.getState().recordRun(procedure.id, status, durationMs, now());
    }
  }

  /** The current node, but only while the simulation is accepting input. */
  function activeNode(): { nodeId: NodeId; node: VisibleNode } | null {
    const { procedure, currentNodeId, status } = get();
    if (!procedure || currentNodeId === null || status !== 'running') return null;
    const node = procedure.nodes[currentNodeId];
    return node && node.type !== 'chance' ? { nodeId: currentNodeId, node } : null;
  }

  function selection(nodeId: NodeId, optionIndex: number, label: string): SelectedOption {
    const position = get().optionOrder[nodeId]?.indexOf(optionIndex) ?? optionIndex;
    return { optionIndex, letter: letterFor(position), label };
  }

  function commit(choice: ChoiceRecord, next: NodeId) {
    const { path, optionOrder, choices } = get();
    const { durationMs, ...patch } = enter(next, { path, optionOrder });
    if (choice.isCorrect) {
      set({ ...patch, choices: [...choices, choice] });
      recordIfFinished(patch.status, durationMs);
      return;
    }
    // A wrong call ends the attempt wherever its edge leads: the complication
    // overlay blocks all input until the resident restarts the procedure.
    set({
      ...patch,
      choices: [...choices, choice],
      status: 'failure',
      finishedAt: patch.nodeEnteredAt,
      complication: { choice, outcomeNodeId: next },
    });
    recordIfFinished('failure', durationMs);
  }

  return {
    ...idle,
    attempt: 0,
    random: Math.random,
    now: Date.now,

    start: (procedure) => {
      set((state) => ({ ...idle, procedure, attempt: state.attempt + 1, startedAt: get().now() }));
      const { durationMs, ...patch } = enter(START_NODE_ID, { path: [], optionOrder: {} });
      set(patch);
      recordIfFinished(patch.status, durationMs);
    },

    advance: () => {
      const active = activeNode();
      if (active?.node.type !== 'info') return;
      const { path, optionOrder } = get();
      const { durationMs, ...patch } = enter(active.node.next, { path, optionOrder });
      set(patch);
      recordIfFinished(patch.status, durationMs);
    },

    choose: (optionIndex) => {
      const active = activeNode();
      if (active?.node.type !== 'decision') return;
      const option = active.node.options[optionIndex];
      if (!option) return;
      const { now, nodeEnteredAt } = get();
      commit(
        {
          nodeId: active.nodeId,
          kind: 'single',
          selected: [selection(active.nodeId, optionIndex, option.label)],
          isCorrect: option.isCorrect,
          feedback: option.feedback,
          cite: option.cite ?? [],
          elapsedMs: now() - (nodeEnteredAt ?? now()),
        },
        option.next,
      );
    },

    submitMulti: (optionIndices) => {
      const active = activeNode();
      if (active?.node.type !== 'multi') return;
      const { node, nodeId } = active;
      const chosen = [...new Set(optionIndices)].filter((i) => node.options[i] !== undefined);
      if (chosen.length === 0) return;
      const isCorrect = node.options.every((o, i) => o.isCorrect === chosen.includes(i));
      const order = get().optionOrder[nodeId] ?? [];
      chosen.sort((a, b) => order.indexOf(a) - order.indexOf(b));
      const { now, nodeEnteredAt } = get();
      commit(
        {
          nodeId,
          kind: 'multi',
          selected: chosen.map((i) => selection(nodeId, i, node.options[i]!.label)),
          isCorrect,
          feedback: node.feedback,
          cite: node.cite,
          elapsedMs: now() - (nodeEnteredAt ?? now()),
        },
        isCorrect ? node.next : node.failNext,
      );
    },

    restart: () => {
      const { procedure, start } = get();
      if (procedure) start(procedure);
    },

    exit: () => set(idle),
  };
});

export function useCurrentNode(): VisibleNode | undefined {
  return useSimulationStore((state) => {
    const node =
      state.procedure && state.currentNodeId !== null
        ? state.procedure.nodes[state.currentNodeId]
        : undefined;
    return node && node.type !== 'chance' ? node : undefined;
  });
}

/** Latest monitor readings seen this attempt: the monitor stays up between steps. */
export function useMonitorVitals() {
  return useSimulationStore((state) => {
    for (let i = state.path.length - 1; i >= 0; i--) {
      const seen = state.procedure?.nodes[state.path[i]!];
      if (seen && seen.type !== 'chance' && seen.vitals) return seen.vitals;
    }
    return undefined;
  });
}
