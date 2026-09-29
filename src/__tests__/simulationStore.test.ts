import { beforeEach, describe, expect, it } from '@jest/globals';

import { getProcedure, procedures } from '@/data/procedures';
import { parseProcedure } from '@/lib/parseProcedure';
import { EMPTY_PROGRESS, isMastered, useProgressStore } from '@/store/useProgressStore';
import { useSimulationStore } from '@/store/useSimulationStore';
import type { Procedure } from '@/types/procedure';

const sim = () => useSimulationStore.getState();

/** Deterministic random stream that cycles through `values`. */
function sequence(...values: number[]) {
  let i = 0;
  return () => values[i++ % values.length]!;
}

let clock = 0;
beforeEach(() => {
  clock = 1_000;
  useSimulationStore.setState({ random: sequence(0), now: () => clock });
  sim().exit();
  useProgressStore.setState({ byProcedure: {} });
});

const lapChole = getProcedure('lap-chole')!;

function answerCorrectly() {
  const { procedure, currentNodeId } = sim();
  const node = procedure!.nodes[currentNodeId!]!;
  if (node.type === 'info') sim().advance();
  if (node.type === 'decision') sim().choose(node.options.findIndex((o) => o.isCorrect));
  if (node.type === 'multi') {
    sim().submitMulti(node.options.flatMap((o, i) => (o.isCorrect ? [i] : [])));
  }
}

function playToEnd(procedure: Procedure) {
  sim().start(procedure);
  for (let guard = 0; sim().status === 'running' && guard < 100; guard++) answerCorrectly();
}

describe('simulation store', () => {
  it('starts at the entry node and counts attempts', () => {
    const before = sim().attempt;
    sim().start(lapChole);
    expect(sim().currentNodeId).toBe('start');
    expect(sim().status).toBe('running');
    expect(sim().attempt).toBe(before + 1);
    expect(sim().startedAt).toBe(1_000);
  });

  it('ignores actions that do not match the current node', () => {
    sim().start(lapChole);
    sim().choose(0);
    sim().submitMulti([0]);
    expect(sim().currentNodeId).toBe('start');
    sim().advance();
    sim().advance();
    expect(sim().currentNodeId).toBe('dissection_start');
    sim().choose(9);
    expect(sim().currentNodeId).toBe('dissection_start');
  });

  it('turns a wrong answer into a locked complication and records the failure', () => {
    sim().start(lapChole);
    sim().advance();
    clock = 4_500;
    sim().choose(1);
    const { status, complication, currentNodeId, path } = sim();
    expect(status).toBe('failure');
    expect(currentNodeId).toBe('fail_cbd_injury');
    expect(path).toEqual(['start', 'dissection_start', 'fail_cbd_injury']);
    expect(complication?.outcomeNodeId).toBe('fail_cbd_injury');
    expect(complication?.choice.feedback).toMatch(/Catastrophic error/);
    expect(complication?.choice.elapsedMs).toBe(3_500);
    sim().advance();
    sim().choose(0);
    expect(sim().currentNodeId).toBe('fail_cbd_injury');
    expect(useProgressStore.getState().byProcedure['lap-chole']).toMatchObject({
      attempts: 1,
      successes: 0,
      lastOutcome: 'failure',
    });
  });

  it('restarts cleanly', () => {
    sim().start(lapChole);
    const firstAttempt = sim().attempt;
    sim().advance();
    sim().choose(1);
    sim().restart();
    expect(sim()).toMatchObject({
      attempt: firstAttempt + 1,
      complication: null,
      choices: [],
      path: ['start'],
      status: 'running',
    });
  });

  it('shuffles options per attempt and reports the letter shown', () => {
    // A random of 0 swaps every position with index 0: [0,1] becomes [1,0].
    sim().start(lapChole);
    sim().advance();
    expect(sim().optionOrder.dissection_start).toEqual([1, 0]);
    sim().choose(0);
    expect(sim().choices[0]?.selected[0]).toMatchObject({ optionIndex: 0, letter: 'B' });
  });

  it('resolves chance nodes by weight and records them in the path', () => {
    const acute = getProcedure('acute-cholecystitis')!;
    for (const [roll, expected] of [
      [0.1, 'cvs_dissection'],
      [0.9, 'fused_triangle'],
    ] as const) {
      useSimulationStore.setState({ random: sequence(roll) });
      sim().start(acute);
      for (let guard = 0; guard < 20 && !sim().path.includes('difficulty'); guard++) answerCorrectly();
      expect(sim().path).toContain('difficulty');
      expect(sim().path[sim().path.indexOf('difficulty') + 1]).toBe(expected);
    }
  });

  it('scores multi-select answers on the exact set', () => {
    const multi = parseProcedure({
      id: 'm',
      title: 'M',
      description: 'M',
      reviewed: '2026-01-01',
      references: [{ citation: 'Test source. J Test. 2020;1:1.', url: 'https://doi.org/10.1000/test', kind: 'trial', doi: '10.1000/test' }],
      nodes: {
        start: {
          type: 'multi',
          text: 'Pick',
          options: [
            { label: 'A', isCorrect: true },
            { label: 'B', isCorrect: true },
            { label: 'C', isCorrect: false },
          ],
          feedback: 'A and B',
          cite: [1],
          next: 'win',
          failNext: 'lose',
        },
        win: { type: 'terminal', status: 'success', text: 'Won' },
        lose: { type: 'terminal', status: 'failure', text: 'Lost' },
      },
    });
    for (const [picked, outcome] of [
      [[0, 1], 'win'],
      [[1, 0, 0], 'win'],
      [[0], 'lose'],
      [[0, 1, 2], 'lose'],
    ] as const) {
      sim().start(multi);
      sim().submitMulti([...picked]);
      expect([picked, sim().currentNodeId]).toEqual([picked, outcome]);
      expect(sim().choices[0]?.selected.length).toBe(new Set(picked).size);
    }
    sim().start(multi);
    sim().submitMulti([]);
    expect(sim().currentNodeId).toBe('start');
  });

  it('completes every procedure on every case variant when answered correctly', () => {
    for (const procedure of procedures) {
      for (const roll of [0, 0.35, 0.7, 0.99]) {
        useSimulationStore.setState({ random: sequence(roll) });
        playToEnd(procedure);
        expect([procedure.id, roll, sim().status]).toEqual([procedure.id, roll, 'success']);
        expect(sim().choices.every((c) => c.isCorrect)).toBe(true);
        if (procedure.id !== 'lap-chole') {
          expect(sim().choices.every((c) => c.feedback)).toBe(true);
        }
      }
    }
  });
});

describe('progress store', () => {
  it('tracks streaks, best time, and mastery', () => {
    const record = useProgressStore.getState().recordRun;
    record('x', 'success', 90_000, 1);
    record('x', 'success', 60_000, 2);
    record('x', 'failure', 10_000, 3);
    record('x', 'success', 75_000, 4);
    let p = useProgressStore.getState().byProcedure.x ?? EMPTY_PROGRESS;
    expect(p).toMatchObject({ attempts: 4, successes: 3, currentStreak: 1, bestStreak: 2, bestTimeMs: 60_000 });
    expect(isMastered(p)).toBe(false);
    record('x', 'success', 80_000, 5);
    record('x', 'success', 70_000, 6);
    p = useProgressStore.getState().byProcedure.x ?? EMPTY_PROGRESS;
    expect(p.currentStreak).toBe(3);
    expect(isMastered(p)).toBe(true);
  });

  it('records one run per completed attempt with its duration', () => {
    sim().start(lapChole);
    clock = 61_000;
    for (let guard = 0; sim().status === 'running' && guard < 20; guard++) answerCorrectly();
    expect(sim().status).toBe('success');
    expect(useProgressStore.getState().byProcedure['lap-chole']).toMatchObject({
      attempts: 1,
      successes: 1,
      currentStreak: 1,
      bestTimeMs: 60_000,
    });
  });
});
