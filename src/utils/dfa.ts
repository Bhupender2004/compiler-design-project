import type { Automaton, State, Transition, StateId } from '../types/automata';
import { EPSILON } from './regex';

function getEpsilonClosure(nfa: Automaton, states: StateId[]): Set<StateId> {
    const stack = [...states];
    const closure = new Set(states);

    while (stack.length > 0) {
        const currentId = stack.pop()!;
        // Find all epsilon transitions from currentId
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

function getMove(nfa: Automaton, states: Set<StateId>, symbol: string): Set<StateId> {
    const result = new Set<StateId>();
    for (const stateId of states) {
        const transitions = nfa.transitions.filter(
            (t) => t.source === stateId && t.symbol === symbol
        );
        for (const t of transitions) {
            result.add(t.target);
        }
    }
    return result;
}

export function nfaToDFA(nfa: Automaton): Automaton {
    // 1. Initial State
    const startClosure = getEpsilonClosure(nfa, [nfa.startStateId]);

    const dfaStates: State[] = [];
    const dfaTransitions: Transition[] = [];

    // Map set of NFA state IDs (stringified) to DFA State ID
    const stateMap = new Map<string, string>(); // "id1,id2" -> "D0"
    let dfaStateCounter = 0;

    function getSetKey(set: Set<StateId>): string {
        return Array.from(set).sort().join(',');
    }

    const startKey = getSetKey(startClosure);
    const startStateId = `D${dfaStateCounter++}`;
    stateMap.set(startKey, startStateId);

    // Create DFA start state logic
    // Check if it's accepting (contains any NFA accept state)
    const isStartAccept = Array.from(startClosure).some(id => nfa.acceptStateIds.includes(id));

    dfaStates.push({
        id: startStateId,
        label: `{${Array.from(startClosure).map(id => id.replace('q', '')).join(',')}}`,
        isStart: true,
        isAccept: isStartAccept,
    });

    const queue: Set<StateId>[] = [startClosure];
    const processed = new Set<string>();
    processed.add(startKey);

    // Get alphabet (all symbols except epsilon)
    const alphabet = new Set<string>();
    nfa.transitions.forEach(t => {
        if (t.symbol !== EPSILON) alphabet.add(t.symbol);
    });

    while (queue.length > 0) {
        const currentSet = queue.shift()!;
        const currentKey = getSetKey(currentSet);
        const dfaSourceId = stateMap.get(currentKey)!;

        for (const symbol of alphabet) {
            const moveResult = getMove(nfa, currentSet, symbol);
            if (moveResult.size === 0) continue; // No transition for this symbol

            const epsilonClosure = getEpsilonClosure(nfa, Array.from(moveResult));
            const targetKey = getSetKey(epsilonClosure);

            let dfaTargetId = stateMap.get(targetKey);

            if (!dfaTargetId) {
                // New DFA state
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
