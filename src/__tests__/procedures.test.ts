import { createHash } from 'crypto';

import { describe, expect, it } from '@jest/globals';

import lapCholeRaw from '@/data/lap-chole.json';
import { procedures } from '@/data/procedures';
import { outgoingEdges } from '@/lib/parseProcedure';
import { START_NODE_ID, type NodeId, type Procedure, type ProcedureNode } from '@/types/procedure';

const isFailure = (node: ProcedureNode | undefined) =>
  node?.type === 'terminal' && node.status === 'failure';

/** Every route through the graph that takes only correct answers, across every chance outcome. */
function correctPaths(procedure: Procedure): NodeId[][] {
  const paths: NodeId[][] = [];
  const walk = (nodeId: NodeId, trail: NodeId[]) => {
    const node = procedure.nodes[nodeId]!;
    const here = [...trail, nodeId];
    switch (node.type) {
      case 'terminal':
        paths.push(here);
        return;
      case 'info':
        return walk(node.next, here);
      case 'multi':
        return walk(node.next, here);
      case 'chance':
        return node.outcomes.forEach((o) => walk(o.next, here));
      case 'decision':
        return node.options.filter((o) => o.isCorrect).forEach((o) => walk(o.next, here));
    }
  };
  walk(START_NODE_ID, []);
  return paths;
}

describe('procedure catalogue', () => {
  it('has unique ids', () => {
    const ids = procedures.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('keeps lap-chole.json exactly as specified', () => {
    const hash = createHash('sha256').update(JSON.stringify(lapCholeRaw)).digest('hex');
    expect(hash).toBe('25c4e0bd9961f32a436f4963fb5e6dc2f62c5f0299d70dfc7a8a53806ce33fb5');
  });
});

describe.each(procedures.map((p) => [p.id, p] as const))('%s', (_id, procedure) => {
  const entries = Object.entries(procedure.nodes);

  it('cites linked evidence and states objectives', () => {
    expect(procedure.category).toBeTruthy();
    expect(procedure.objectives.length).toBeGreaterThan(0);
    expect(procedure.references.length).toBeGreaterThan(0);
    for (const reference of procedure.references) {
      expect(reference.url).toMatch(/^https:\/\//);
    }
  });

  it('gives every single-answer decision exactly one correct option, all explained', () => {
    // lap-chole.json is kept verbatim from its spec, which gives rationale only for wrong options.
    const rationaleRequired = procedure.id !== 'lap-chole';
    for (const [nodeId, node] of entries) {
      if (node.type !== 'decision') continue;
      expect([nodeId, node.options.filter((o) => o.isCorrect).length]).toEqual([nodeId, 1]);
      const labels = node.options.map((o) => o.label);
      expect(new Set(labels).size).toBe(labels.length);
      for (const option of node.options) {
        if (option.isCorrect && !rationaleRequired) continue;
        expect([nodeId, option.label, !!option.feedback]).toEqual([nodeId, option.label, true]);
      }
    }
  });

  it('routes wrong answers to failure terminals and right answers away from them', () => {
    for (const [nodeId, node] of entries) {
      if (node.type === 'decision') {
        for (const option of node.options) {
          const target = procedure.nodes[option.next];
          expect([nodeId, option.label, isFailure(target)]).toEqual([
            nodeId,
            option.label,
            !option.isCorrect,
          ]);
        }
      }
      if (node.type === 'multi') {
        expect([nodeId, isFailure(procedure.nodes[node.failNext])]).toEqual([nodeId, true]);
        expect([nodeId, isFailure(procedure.nodes[node.next])]).toEqual([nodeId, false]);
      }
      if (node.type === 'info' || node.type === 'chance') {
        for (const next of outgoingEdges(node)) {
          expect([nodeId, isFailure(procedure.nodes[next])]).toEqual([nodeId, false]);
        }
      }
    }
  });

  it('reaches a success terminal on every correct path through every case variant', () => {
    const paths = correctPaths(procedure);
    expect(paths.length).toBeGreaterThan(0);
    for (const path of paths) {
      const last = procedure.nodes[path[path.length - 1]!];
      expect([path.join(' > '), last?.type === 'terminal' && last.status]).toEqual([
        path.join(' > '),
        'success',
      ]);
      const decisions = path.filter((id) => {
        const type = procedure.nodes[id]?.type;
        return type === 'decision' || type === 'multi';
      });
      expect(decisions.length).toBeGreaterThan(0);
    }
  });

  it('uses every failure terminal', () => {
    const targets = new Set(entries.flatMap(([, node]) => outgoingEdges(node)));
    for (const [nodeId, node] of entries) {
      if (node.type === 'terminal') expect([nodeId, targets.has(nodeId)]).toEqual([nodeId, true]);
    }
  });
});
