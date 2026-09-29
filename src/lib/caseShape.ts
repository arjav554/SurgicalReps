import type { NodeId, Procedure } from '@/types/procedure';

const remainingCache = new WeakMap<Procedure, Map<NodeId, number>>();

/**
 * Expected number of visible steps still ahead of `nodeId` on the correct path
 * (chance branches weighted by probability). Terminals count as 0, so a case
 * reads 100% complete the moment it resolves.
 */
export function remainingSteps(procedure: Procedure, nodeId: NodeId): number {
  let memo = remainingCache.get(procedure);
  if (!memo) remainingCache.set(procedure, (memo = new Map()));
  const cached = memo.get(nodeId);
  if (cached !== undefined) return cached;

  const node = procedure.nodes[nodeId];
  let steps = 0;
  if (node) {
    switch (node.type) {
      case 'terminal':
        steps = 0;
        break;
      case 'info':
      case 'multi':
        steps = 1 + remainingSteps(procedure, node.next);
        break;
      case 'decision': {
        const correct = node.options.find((o) => o.isCorrect);
        steps = 1 + (correct ? remainingSteps(procedure, correct.next) : 0);
        break;
      }
      case 'chance': {
        const total = node.outcomes.reduce((sum, o) => sum + o.weight, 0);
        steps = node.outcomes.reduce(
          (sum, o) => sum + (o.weight / total) * remainingSteps(procedure, o.next),
          0,
        );
        break;
      }
    }
  }
  memo.set(nodeId, steps);
  return steps;
}

/** Number of distinct case variants a resident can meet (distinct chance-outcome combinations). */
export function caseVariants(procedure: Procedure): number {
  const count = (nodeId: NodeId): number => {
    const node = procedure.nodes[nodeId];
    if (!node || node.type === 'terminal') return 1;
    switch (node.type) {
      case 'info':
      case 'multi':
        return count(node.next);
      case 'decision': {
        const correct = node.options.find((o) => o.isCorrect);
        return correct ? count(correct.next) : 1;
      }
      case 'chance':
        return node.outcomes.reduce((sum, o) => sum + count(o.next), 0);
    }
  };
  return count('start');
}

/** Most decisions a resident can face in one run (the longest correct path). */
export function callsPerCase(procedure: Procedure): number {
  const memo = new Map<NodeId, number>();
  const calls = (nodeId: NodeId): number => {
    const cached = memo.get(nodeId);
    if (cached !== undefined) return cached;
    const node = procedure.nodes[nodeId];
    let result = 0;
    if (node) {
      switch (node.type) {
        case 'terminal':
          break;
        case 'info':
          result = calls(node.next);
          break;
        case 'multi':
          result = 1 + calls(node.next);
          break;
        case 'decision': {
          const correct = node.options.find((o) => o.isCorrect);
          result = 1 + (correct ? calls(correct.next) : 0);
          break;
        }
        case 'chance':
          result = Math.max(...node.outcomes.map((o) => calls(o.next)));
          break;
      }
    }
    memo.set(nodeId, result);
    return result;
  };
  return calls('start');
}
