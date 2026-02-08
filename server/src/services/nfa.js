/**
 * NFA Construction using Thompson's Algorithm
 */
import { EPSILON, toPostfix } from './regex.js';

let stateIdCounter = 0;

function generateStateId() {
    return `q${stateIdCounter++}`;
}

function resetStateCounter() {
    stateIdCounter = 0;
}

/**
 * Create a basic NFA for a single symbol
 */
function createBasicNFA(symbol) {
    const start = { id: generateStateId(), label: '', isStart: false, isAccept: false };
    const end = { id: generateStateId(), label: '', isStart: false, isAccept: false };
    const transition = {
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

/**
 * Concatenate two NFA fragments
 */
function concatNFA(first, second) {
    const transition = {
        id: `t_${first.endState.id}_${second.startState.id}`,
        source: first.endState.id,
        target: second.startState.id,
        symbol: EPSILON,
    };

    return {
        startState: first.startState,
        endState: second.endState,
        states: [...first.states, ...second.states],
        transitions: [...first.transitions, ...second.transitions, transition],
    };
}

/**
 * Union of two NFA fragments (a|b)
 */
function unionNFA(first, second) {
    const start = { id: generateStateId(), label: '', isStart: false, isAccept: false };
    const end = { id: generateStateId(), label: '', isStart: false, isAccept: false };

    const t1 = { id: `t_${start.id}_${first.startState.id}`, source: start.id, target: first.startState.id, symbol: EPSILON };
    const t2 = { id: `t_${start.id}_${second.startState.id}`, source: start.id, target: second.startState.id, symbol: EPSILON };
    const t3 = { id: `t_${first.endState.id}_${end.id}`, source: first.endState.id, target: end.id, symbol: EPSILON };
    const t4 = { id: `t_${second.endState.id}_${end.id}`, source: second.endState.id, target: end.id, symbol: EPSILON };

    return {
        startState: start,
        endState: end,
        states: [start, ...first.states, ...second.states, end],
        transitions: [t1, t2, ...first.transitions, ...second.transitions, t3, t4],
    };
}

/**
 * Kleene star of an NFA fragment (a*)
 */
function starNFA(nfa) {
    const start = { id: generateStateId(), label: '', isStart: false, isAccept: false };
    const end = { id: generateStateId(), label: '', isStart: false, isAccept: false };

    const t1 = { id: `t_${start.id}_${nfa.startState.id}`, source: start.id, target: nfa.startState.id, symbol: EPSILON };
    const t2 = { id: `t_${start.id}_${end.id}`, source: start.id, target: end.id, symbol: EPSILON }; // Skip
    const t3 = { id: `t_${nfa.endState.id}_${nfa.startState.id}`, source: nfa.endState.id, target: nfa.startState.id, symbol: EPSILON }; // Loop back
    const t4 = { id: `t_${nfa.endState.id}_${end.id}`, source: nfa.endState.id, target: end.id, symbol: EPSILON };

    return {
        startState: start,
        endState: end,
        states: [start, ...nfa.states, end],
        transitions: [t1, t2, t3, t4, ...nfa.transitions],
    };
}

/**
 * One or more (a+)
 */
function plusNFA(nfa) {
    const start = { id: generateStateId(), label: '', isStart: false, isAccept: false };
    const end = { id: generateStateId(), label: '', isStart: false, isAccept: false };

    const t1 = { id: `t_${start.id}_${nfa.startState.id}`, source: start.id, target: nfa.startState.id, symbol: EPSILON };
    const t3 = { id: `t_${nfa.endState.id}_${nfa.startState.id}`, source: nfa.endState.id, target: nfa.startState.id, symbol: EPSILON }; // Loop back
    const t4 = { id: `t_${nfa.endState.id}_${end.id}`, source: nfa.endState.id, target: end.id, symbol: EPSILON };

    return {
        startState: start,
        endState: end,
        states: [start, ...nfa.states, end],
        transitions: [t1, t3, t4, ...nfa.transitions],
    };
}

/**
 * Optional (a?)
 */
function optionalNFA(nfa) {
    const eps = createBasicNFA(EPSILON);
    return unionNFA(nfa, eps);
}

/**
 * Convert regex to NFA using Thompson's construction
 */
export function regexToNFA(regex) {
    resetStateCounter();
    const postfix = toPostfix(regex);
    const stack = [];

    for (const char of postfix) {
        if (char === '.') {
            const second = stack.pop();
            const first = stack.pop();
            stack.push(concatNFA(first, second));
        } else if (char === '|') {
            const second = stack.pop();
            const first = stack.pop();
            stack.push(unionNFA(first, second));
        } else if (char === '*') {
            const nfa = stack.pop();
            stack.push(starNFA(nfa));
        } else if (char === '+') {
            const nfa = stack.pop();
            stack.push(plusNFA(nfa));
        } else if (char === '?') {
            const nfa = stack.pop();
            stack.push(optionalNFA(nfa));
        } else {
            // Literal character
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

    const result = stack.pop();

    // Mark start and accept
    result.startState.isStart = true;
    result.endState.isAccept = true;

    return {
        states: result.states,
        transitions: result.transitions,
        startStateId: result.startState.id,
        acceptStateIds: [result.endState.id],
        type: 'NFA',
    };
}
