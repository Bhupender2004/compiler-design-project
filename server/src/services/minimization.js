/**
 * DFA Minimization using partition refinement
 */

/**
 * Remove unreachable states from DFA
 */
function removeUnreachableStates(dfa) {
    const reachable = new Set();
    const queue = [dfa.startStateId];
    reachable.add(dfa.startStateId);

    while (queue.length > 0) {
        const stateId = queue.shift();
        const transitions = dfa.transitions.filter(t => t.source === stateId);
        for (const t of transitions) {
            if (!reachable.has(t.target)) {
                reachable.add(t.target);
                queue.push(t.target);
            }
        }
    }

    return {
        ...dfa,
        states: dfa.states.filter(s => reachable.has(s.id)),
        transitions: dfa.transitions.filter(t => reachable.has(t.source) && reachable.has(t.target)),
        acceptStateIds: dfa.acceptStateIds.filter(id => reachable.has(id)),
    };
}

/**
 * Minimize DFA using partition refinement (Hopcroft-like)
 */
export function minimizeDFA(dfa) {
    // Remove unreachable states first
    const reachableDFA = removeUnreachableStates(dfa);

    if (reachableDFA.states.length <= 1) {
        return { ...reachableDFA, type: 'MIN_DFA' };
    }

    // Get alphabet
    const alphabet = new Set();
    reachableDFA.transitions.forEach(t => alphabet.add(t.symbol));

    // Initial partition: accepting vs non-accepting
    const acceptSet = new Set(reachableDFA.acceptStateIds);
    let partitions = [
        reachableDFA.states.filter(s => acceptSet.has(s.id)).map(s => s.id),
        reachableDFA.states.filter(s => !acceptSet.has(s.id)).map(s => s.id),
    ].filter(p => p.length > 0);

    // State to partition index mapping
    function getPartitionIndex(stateId) {
        return partitions.findIndex(p => p.includes(stateId));
    }

    // Get target state for a given state and symbol
    function getTarget(stateId, symbol) {
        const t = reachableDFA.transitions.find(t => t.source === stateId && t.symbol === symbol);
        return t ? t.target : null;
    }

    // Refine partitions
    let changed = true;
    while (changed) {
        changed = false;
        const newPartitions = [];

        for (const partition of partitions) {
            if (partition.length <= 1) {
                newPartitions.push(partition);
                continue;
            }

            // Try to split this partition
            const groups = new Map();

            for (const stateId of partition) {
                // Create signature based on where transitions go
                const signature = [];
                for (const symbol of alphabet) {
                    const target = getTarget(stateId, symbol);
                    const targetPartition = target !== null ? getPartitionIndex(target) : -1;
                    signature.push(`${symbol}:${targetPartition}`);
                }
                const key = signature.join('|');

                if (!groups.has(key)) {
                    groups.set(key, []);
                }
                groups.get(key).push(stateId);
            }

            if (groups.size > 1) {
                changed = true;
            }

            for (const group of groups.values()) {
                newPartitions.push(group);
            }
        }

        partitions = newPartitions;
    }

    // Build minimized DFA
    let minStateCounter = 0;
    const partitionToState = new Map();
    const minStates = [];
    const minTransitions = [];

    // Create states for each partition
    for (let i = 0; i < partitions.length; i++) {
        const partition = partitions[i];
        const newStateId = `M${minStateCounter++}`;
        partitionToState.set(i, newStateId);

        const isStart = partition.includes(reachableDFA.startStateId);
        const isAccept = partition.some(id => acceptSet.has(id));

        minStates.push({
            id: newStateId,
            label: `{${partition.map(id => id.replace('D', '')).join(',')}}`,
            isStart,
            isAccept,
        });
    }

    // Create transitions
    const addedTransitions = new Set();
    for (let i = 0; i < partitions.length; i++) {
        const partition = partitions[i];
        const sourceId = partitionToState.get(i);
        const representativeState = partition[0];

        for (const symbol of alphabet) {
            const target = getTarget(representativeState, symbol);
            if (target !== null) {
                const targetPartitionIndex = getPartitionIndex(target);
                const targetId = partitionToState.get(targetPartitionIndex);
                const transKey = `${sourceId}_${targetId}_${symbol}`;

                if (!addedTransitions.has(transKey)) {
                    addedTransitions.add(transKey);
                    minTransitions.push({
                        id: `t_${transKey}`,
                        source: sourceId,
                        target: targetId,
                        symbol,
                    });
                }
            }
        }
    }

    const startPartitionIndex = partitions.findIndex(p => p.includes(reachableDFA.startStateId));
    const startStateId = partitionToState.get(startPartitionIndex);

    return {
        states: minStates,
        transitions: minTransitions,
        startStateId,
        acceptStateIds: minStates.filter(s => s.isAccept).map(s => s.id),
        type: 'MIN_DFA',
    };
}
