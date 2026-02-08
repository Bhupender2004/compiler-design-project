/**
 * NFA to DFA Conversion using Subset Construction (Powerset Construction)
 */
import { EPSILON } from './regex.js';

/**
 * Compute epsilon closure of a set of states
 */
function getEpsilonClosure(nfa, stateIds) {
    const stack = [...stateIds];
    const closure = new Set(stateIds);

    while (stack.length > 0) {
        const currentId = stack.pop();
        const transitions = nfa.transitions.filter(
            (t) => t.source === currentId && t.symbol === EPSILON
        );

        for (const t of transitions) {
            if (!closure.has(t.target)) {
                closure.add(t.target);
                stack.push(t.target);
            }
        }
    }

    return closure;
}

/**
 * Compute move(states, symbol) - all states reachable by symbol
 */
function getMove(nfa, stateIds, symbol) {
    const result = new Set();
    for (const stateId of stateIds) {
        const transitions = nfa.transitions.filter(
            (t) => t.source === stateId && t.symbol === symbol
        );
        for (const t of transitions) {
            result.add(t.target);
        }
    }
    return result;
}

/**
 * Convert NFA to DFA using subset construction
 */
export function nfaToDFA(nfa) {
    // Get alphabet (all symbols except epsilon)
    const alphabet = new Set();
    nfa.transitions.forEach(t => {
        if (t.symbol !== EPSILON) alphabet.add(t.symbol);
    });

    // Initial state: epsilon closure of NFA start state
    const startClosure = getEpsilonClosure(nfa, [nfa.startStateId]);

    const dfaStates = [];
    const dfaTransitions = [];
    const stateMap = new Map(); // "id1,id2,..." -> "D0"
    let dfaStateCounter = 0;

    function getSetKey(set) {
        return Array.from(set).sort().join(',');
    }

    const startKey = getSetKey(startClosure);
    const startStateId = `D${dfaStateCounter++}`;
    stateMap.set(startKey, startStateId);

    // Check if start state is accepting
    const isStartAccept = Array.from(startClosure).some(id => nfa.acceptStateIds.includes(id));

    dfaStates.push({
        id: startStateId,
        label: `{${Array.from(startClosure).map(id => id.replace('q', '')).join(',')}}`,
        isStart: true,
        isAccept: isStartAccept,
    });

    const queue = [startClosure];
    const processed = new Set();
    processed.add(startKey);

    while (queue.length > 0) {
        const currentSet = queue.shift();
        const currentKey = getSetKey(currentSet);
        const dfaSourceId = stateMap.get(currentKey);

        for (const symbol of alphabet) {
            const moveResult = getMove(nfa, currentSet, symbol);
            if (moveResult.size === 0) continue;

            const epsilonClosure = getEpsilonClosure(nfa, Array.from(moveResult));
            const targetKey = getSetKey(epsilonClosure);

            let dfaTargetId = stateMap.get(targetKey);

            if (!dfaTargetId) {
                dfaTargetId = `D${dfaStateCounter++}`;
                stateMap.set(targetKey, dfaTargetId);

                const isAccept = Array.from(epsilonClosure).some(id => nfa.acceptStateIds.includes(id));
                dfaStates.push({
                    id: dfaTargetId,
                    label: `{${Array.from(epsilonClosure).map(id => id.replace('q', '')).join(',')}}`,
                    isStart: false,
                    isAccept: isAccept,
                });

                queue.push(epsilonClosure);
                processed.add(targetKey);
            }

            dfaTransitions.push({
                id: `t_${dfaSourceId}_${dfaTargetId}_${symbol}`,
                source: dfaSourceId,
                target: dfaTargetId,
                symbol: symbol,
            });
        }
    }

    return {
        states: dfaStates,
        transitions: dfaTransitions,
        startStateId: startStateId,
        acceptStateIds: dfaStates.filter(s => s.isAccept).map(s => s.id),
        type: 'DFA',
    };
}
