import type { Automaton, State, Transition } from '../types/automata';
import { EPSILON, toPostfix } from './regex';

let stateIdCounter = 0;

function generateStateId(): string {
    return `q${stateIdCounter++}`;
}

export function resetStateCounter() {
    stateIdCounter = 0;
}

interface NFAFragment {
    startState: State;
    endState: State;
    states: State[];
    transitions: Transition[];
}

function createBasicNFA(symbol: string): NFAFragment {
    const start = { id: generateStateId(), label: '', isStart: false, isAccept: false };
    const end = { id: generateStateId(), label: '', isStart: false, isAccept: false };
    const transition: Transition = {
        id: `t_${start.id}_${end.id}`,
        source: start.id,
        target: end.id,
        symbol,
    };
    return {
        startState: start,
        endState: end,
        states: [start, end],
        transitions: [transition],
    };
}

function concatNFA(first: NFAFragment, second: NFAFragment): NFAFragment {
    // Connect first.end to second.start with epsilon
    const transition: Transition = {
        id: `t_${first.endState.id}_${second.startState.id}`,
        source: first.endState.id,
        target: second.startState.id,
        symbol: EPSILON,
    };

    // To simplify, we can merge end of first and start of second if we want to minimize epsilon transitions,
    // but standard Thompson's construction adds an epsilon.
    // Actually, standard Thompson construction for concatenation usually merges the states OR adds epsilon.
    // Let's add epsilon for distinctness.

    return {
        startState: first.startState,
        endState: second.endState,
        states: [...first.states, ...second.states],
        transitions: [...first.transitions, ...second.transitions, transition],
    };
}

function unionNFA(first: NFAFragment, second: NFAFragment): NFAFragment {
    const start = { id: generateStateId(), label: '', isStart: false, isAccept: false };
    const end = { id: generateStateId(), label: '', isStart: false, isAccept: false };

    const t1: Transition = { id: `t_${start.id}_${first.startState.id}`, source: start.id, target: first.startState.id, symbol: EPSILON };
    const t2: Transition = { id: `t_${start.id}_${second.startState.id}`, source: start.id, target: second.startState.id, symbol: EPSILON };
    const t3: Transition = { id: `t_${first.endState.id}_${end.id}`, source: first.endState.id, target: end.id, symbol: EPSILON };
    const t4: Transition = { id: `t_${second.endState.id}_${end.id}`, source: second.endState.id, target: end.id, symbol: EPSILON };

    return {
        startState: start,
        endState: end,
        states: [start, ...first.states, ...second.states, end],
        transitions: [t1, t2, ...first.transitions, ...second.transitions, t3, t4],
    };
}

function starNFA(nfa: NFAFragment): NFAFragment {
    const start = { id: generateStateId(), label: '', isStart: false, isAccept: false };
    const end = { id: generateStateId(), label: '', isStart: false, isAccept: false };

    const t1: Transition = { id: `t_${start.id}_${nfa.startState.id}`, source: start.id, target: nfa.startState.id, symbol: EPSILON };
    const t2: Transition = { id: `t_${start.id}_${end.id}`, source: start.id, target: end.id, symbol: EPSILON }; // Skip
    const t3: Transition = { id: `t_${nfa.endState.id}_${nfa.startState.id}`, source: nfa.endState.id, target: nfa.startState.id, symbol: EPSILON }; // Loop back
    const t4: Transition = { id: `t_${nfa.endState.id}_${end.id}`, source: nfa.endState.id, target: end.id, symbol: EPSILON };

    return {
        startState: start,
        endState: end,
        states: [start, ...nfa.states, end],
        transitions: [t1, t2, t3, t4, ...nfa.transitions],
    };
}

export function regexToNFA(regex: string): Automaton {
    resetStateCounter();
    const postfix = toPostfix(regex);
    const stack: NFAFragment[] = [];

    for (const char of postfix) {
        if (char === '.') {
            const second = stack.pop()!;
            const first = stack.pop()!;
            stack.push(concatNFA(first, second));
        } else if (char === '|') {
            const second = stack.pop()!;
            const first = stack.pop()!;
            stack.push(unionNFA(first, second));
        } else if (char === '*') {
            const nfa = stack.pop()!;
            stack.push(starNFA(nfa));
        } else if (char === '+') {
            // a+ = a.a*
            const nfa = stack.pop()!;
            // We need to clone regular nfa logic or just implement logic for +
            // Easier: a+ is one instance followed by star of instance.
            // But we can implement direct structure:
            // Like star but no skip from start to end.
            // Or: push(startNFA(nfa)) then concat with original? No.
            // Let's treat + as sugar if possible, or implement specific structure.
            // Specific structure for +:
            // start -> nfa.start, nfa.end -> end
            // nfa.end -> nfa.start (loop)
            // BUT we need a new start/end to encapsulate.

            // Reusing star logic but removing the skip (t2)
            const start = { id: generateStateId(), label: '', isStart: false, isAccept: false };
            const end = { id: generateStateId(), label: '', isStart: false, isAccept: false };

            const t1: Transition = { id: `t_${start.id}_${nfa.startState.id}`, source: start.id, target: nfa.startState.id, symbol: EPSILON };
            // Removed skip
            const t3: Transition = { id: `t_${nfa.endState.id}_${nfa.startState.id}`, source: nfa.endState.id, target: nfa.startState.id, symbol: EPSILON }; // Loop back
            const t4: Transition = { id: `t_${nfa.endState.id}_${end.id}`, source: nfa.endState.id, target: end.id, symbol: EPSILON };

            stack.push({
                startState: start,
                endState: end,
                states: [start, ...nfa.states, end],
                transitions: [t1, t3, t4, ...nfa.transitions],
            });

        } else if (char === '?') {
            // a? = a|ε
            const nfa = stack.pop()!;
            const eps = createBasicNFA(EPSILON);
            stack.push(unionNFA(nfa, eps));
        } else {
            // Literal
            stack.push(createBasicNFA(char));
        }
    }

    if (stack.length === 0) {
        // Empty regex
        const start = { id: generateStateId(), label: 'start', isStart: true, isAccept: true };
        return {
            states: [start],
            transitions: [],
            startStateId: start.id,
            acceptStateIds: [start.id],
            type: 'NFA'
        };
    }

    const result = stack.pop()!;

    // Mark start and accept
    result.startState.isStart = true;
    result.endState.isAccept = true;

    // Update the objects in states array (references should hold, but let's be safe)
    // Our states array contains references to start/end objects.

    return {
        states: result.states,
        transitions: result.transitions,
        startStateId: result.startState.id,
        acceptStateIds: [result.endState.id],
        type: 'NFA',
    };
}
