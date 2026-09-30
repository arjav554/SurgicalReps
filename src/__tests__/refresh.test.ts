import { beforeEach, describe, expect, it } from '@jest/globals';

import { getProcedure } from '@/data/procedures';
import { useSimulationStore } from '@/store/useSimulationStore';

const sim = () => useSimulationStore.getState();
const lapChole = getProcedure('lap-chole')!;

type State = ReturnType<typeof sim>;

/** What a page refresh does: the store is written out, then rebuilt on top of a fresh, idle store. */
function saved(): Record<string, unknown> {
  return JSON.parse(JSON.stringify(useSimulationStore.persist.getOptions().partialize!(sim())));
}
function rebuild(from: Record<string, unknown>): State {
  const idle = { ...sim(), procedure: null, path: [], currentNodeId: null, complication: null };
  return useSimulationStore.persist.getOptions().merge!(from, idle) as State;
}
const refresh = () => rebuild(saved());

beforeEach(() => {
  useSimulationStore.setState({ random: Math.random, now: Date.now });
  sim().exit();
});

describe('a refresh mid-case', () => {
  it('resumes the same case at the same step, with the same option order', () => {
    sim().start(lapChole);
    sim().advance();
    const before = sim();
    const after = refresh();
    expect(after.procedure).toBe(lapChole);
    expect(after.currentNodeId).toBe(before.currentNodeId);
    expect(after.path).toEqual(before.path);
    expect(after.optionOrder).toEqual(before.optionOrder);
    expect(after.startedAt).toBe(before.startedAt);
    expect(after.attempt).toBe(before.attempt);
  });

  it('keeps a finished attempt (and its complication) on screen', () => {
    sim().start(lapChole);
    for (let guard = 0; sim().status === 'running' && guard < 100; guard++) {
      const node = sim().procedure!.nodes[sim().currentNodeId!]!;
      if (node.type === 'info') sim().advance();
      else if (node.type === 'decision') sim().choose(node.options.findIndex((o) => !o.isCorrect));
      else if (node.type === 'multi') sim().submitMulti([node.options.findIndex((o) => !o.isCorrect)]);
    }
    expect(sim().status).toBe('failure');
    const after = refresh();
    expect(after.status).toBe('failure');
    expect(after.complication?.outcomeNodeId).toBe(sim().complication?.outcomeNodeId);
  });

  it('starts fresh when nothing was in progress', () => {
    expect(refresh().procedure).toBeNull();
  });

  it('drops a run whose case is gone or whose path no longer fits the case', () => {
    sim().start(lapChole);
    const before = saved();
    const merge = (patch: object) => rebuild({ ...before, ...patch }).procedure;
    expect(merge({})).toBe(lapChole);
    expect(merge({ procedureId: 'no-such-case' })).toBeNull();
    expect(merge({ path: ['start', 'no-such-node'], currentNodeId: 'no-such-node' })).toBeNull();
    expect(merge({ optionOrder: { start: [0] } })).toBeNull();
    expect(merge({ status: 'bogus' })).toBeNull();
  });

  it('drops a run left untouched for over half an hour', () => {
    sim().start(lapChole);
    const stale = { ...saved(), nodeEnteredAt: Date.now() - 31 * 60 * 1000 };
    expect(rebuild(stale).procedure).toBeNull();
  });
});
