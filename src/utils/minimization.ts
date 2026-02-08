import type { Automaton, State, Transition, StateId } from '../types/automata';

export function minimizeDFA(dfa: Automaton): Automaton {
    // 1. Remove unreachable states (DFS from start)
    const reachable = new Set<StateId>();
    const stack = [dfa.startStateId];
    reachable.add(dfa.startStateId);

    while (stack.length > 0) {
        const current = stack.pop()!;
        const transitions = dfa.transitions.filter(t => t.source === current);
        for (const t of transitions) {
            if (!reachable.has(t.target)) {
                reachable.add(t.target);
                stack.push(t.target);
            }
        }
    }

    const reachableStates = dfa.states.filter(s => reachable.has(s.id));
    const reachableTransitions = dfa.transitions.filter(t => reachable.has(t.source) && reachable.has(t.target));

    // 2. Partition states into Accepting and Non-Accepting
    let partitions: Set<StateId>[] = [];
    const acceptingIds = new Set(dfa.acceptStateIds.filter(id => reachable.has(id)));
    const nonAcceptingIds = new Set(reachableStates.map(s => s.id).filter(id => !acceptingIds.has(id)));

    if (acceptingIds.size > 0) partitions.push(acceptingIds);
    if (nonAcceptingIds.size > 0) partitions.push(nonAcceptingIds);

    // Get alphabet
    const alphabet = new Set<string>();
    reachableTransitions.forEach(t => alphabet.add(t.symbol));

    let changed = true;
    while (changed) {
        changed = false;
        const newPartitions: Set<StateId>[] = [];

        for (const partition of partitions) {
            if (partition.size <= 1) {
                newPartitions.push(partition);
                continue;
            }

            // Try to split this partition
            // Two states u, v are equivalent if for all symbols a, transition(u, a) and transition(v, a) land in the same partition
            const subPartitions = new Map<string, Set<StateId>>();

            for (const stateId of partition) {
                // Generate signature for this state based on which partition each symbol leads to
                const signature = Array.from(alphabet).sort().map(symbol => {
                    const target = reachableTransitions.find(t => t.source === stateId && t.symbol === symbol)?.target;
                    if (!target) return 'none'; // Dead state implicit
                    // Find which partition target belongs to
                    const targetPartitionIdx = partitions.findIndex(p => p.has(target));
                    return `${symbol}:${targetPartitionIdx}`;
                }).join('|');

                if (!subPartitions.has(signature)) {
                    subPartitions.set(signature, new Set());
                }
                subPartitions.get(signature)!.add(stateId);
            }

            if (subPartitions.size > 1) {
                changed = true;
                subPartitions.forEach(set => newPartitions.push(set));
            } else {
                newPartitions.push(partition);
            }
        }

        partitions = newPartitions;
    }

    // Construct Minimized DFA
    // Each partition becomes a new state
    const minStates: State[] = [];
    const minTransitions: Transition[] = [];

    const oldToNewMap = new Map<StateId, StateId>();

    partitions.forEach((partition, index) => {
        const newId = `M${index}`;
        // Find if this partition contains original start state
        const containsStart = partition.has(dfa.startStateId);
        // Find if this partition contains any accepting state
        const containsAccept = Array.from(partition).some(id => acceptingIds.has(id));

        // Label can be representative or combined
        const label = `{${Array.from(partition).map(id => id.replace('D', 'q')).join(',')}}`;

        minStates.push({
            id: newId,
            label,
            isStart: containsStart,
            isAccept: containsAccept,
        });

        partition.forEach(oldId => oldToNewMap.set(oldId, newId));
    });

    // Create transitions
    // For each partition, pick a representative and see where it goes
    partitions.forEach((partition) => {
        const rep = Array.from(partition)[0]; // Representative
        const sourceNewId = oldToNewMap.get(rep)!;

        alphabet.forEach(symbol => {
            const targetOld = reachableTransitions.find(t => t.source === rep && t.symbol === symbol)?.target;
            if (targetOld && oldToNewMap.has(targetOld)) {
                const targetNewId = oldToNewMap.get(targetOld)!;

                // Avoid duplicate transitions between same two states with same symbol
                if (!minTransitions.some(t => t.source === sourceNewId && t.target === targetNewId && t.symbol === symbol)) {
                    minTransitions.push({
                        id: `t_${sourceNewId}_${targetNewId}_${symbol}`,
                        source: sourceNewId,
                        target: targetNewId,
                        symbol,
                    });
                }
            }
        });
    });

    const minStartState = minStates.find(s => s.isStart)!;

    return {
        states: minStates,
        transitions: minTransitions,
        startStateId: minStartState.id,
        acceptStateIds: minStates.filter(s => s.isAccept).map(s => s.id),
        type: 'DFA',
    };
}
