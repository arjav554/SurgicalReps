import Animated, { FadeInDown } from 'react-native-reanimated';

import { useMonitorVitals, useSimulationStore } from '@/store/useSimulationStore';
import type { NodeId, Procedure, VisibleNode } from '@/types/procedure';

import { DecisionStep } from './DecisionStep';
import { InfoStep } from './InfoStep';
import { MultiStep } from './MultiStep';
import { TerminalStep } from './TerminalStep';

interface NodeRendererProps {
  procedure: Procedure;
  nodeId: NodeId;
  node: VisibleNode;
  /** Render the monitor inline (phones); off when a side monitor panel shows it. */
  showMonitor?: boolean;
}

const identity = (length: number) => Array.from({ length }, (_, i) => i);

/** Dispatches on `node.type`; the step view owns its own actions. */
export function NodeRenderer({ procedure, nodeId, node, showMonitor = true }: NodeRendererProps) {
  const advance = useSimulationStore((s) => s.advance);
  const choose = useSimulationStore((s) => s.choose);
  const submitMulti = useSimulationStore((s) => s.submitMulti);
  const restart = useSimulationStore((s) => s.restart);
  const choices = useSimulationStore((s) => s.choices);
  const order = useSimulationStore((s) => s.optionOrder[nodeId]);
  const startedAt = useSimulationStore((s) => s.startedAt);
  const finishedAt = useSimulationStore((s) => s.finishedAt);
  const latest = useMonitorVitals();
  const monitor = showMonitor ? latest : undefined;

  return (
    <Animated.View entering={FadeInDown.duration(220)} style={{ flex: 1 }}>
      {node.type === 'info' && <InfoStep node={node} vitals={monitor} onContinue={advance} />}
      {node.type === 'decision' && (
        <DecisionStep node={node} vitals={monitor} order={order ?? identity(node.options.length)} onChoose={choose} />
      )}
      {node.type === 'multi' && (
        <MultiStep
          node={node}
          vitals={monitor}
          order={order ?? identity(node.options.length)}
          onSubmit={submitMulti}
        />
      )}
      {node.type === 'terminal' && (
        <TerminalStep
          node={node}
          procedure={procedure}
          choices={choices}
          durationMs={startedAt !== null && finishedAt !== null ? finishedAt - startedAt : null}
          onRestart={restart}
        />
      )}
    </Animated.View>
  );
}
