/**
 * Automata Simulation
 * Simulates NFA and DFA execution on input strings
 */
import { EPSILON } from './regex.js';

/**
 * Get epsilon closure for NFA states
 */
function getEpsilonClosure(automaton, stateIds) {
    const stack = [...stateIds];
    const closure = new Set(stateIds);

    while (stack.length > 0) {
        const currentId = stack.pop();
        const transitions = automaton.transitions.filter(
            t => t.source === currentId && t.symbol === EPSILON
        );

        for (const t of transitions) {
            if (!closure.has(t.target)) {
                closure.add(t.target);
                stack.push(t.target);
            }
        }
    }

    return Array.from(closure);
}

/**
 * Simulate NFA on input string
 */
export function simulateNFA(nfa, input) {
    const startTime = performance.now();
    const steps = [];
    let transitionCount = 0;

    // Initial state: epsilon closure of start state
    let currentStates = getEpsilonClosure(nfa, [nfa.startStateId]);

    steps.push({
        stepId: 0,
        activeStateIds: [...currentStates],
        processedInput: '',
        remainingInput: input,
        currentSymbol: null,
        description: 'Start (epsilon closure)',
    });

    for (let i = 0; i < input.length; i++) {
        const char = input[i];
        const nextStates = new Set();

        // Move on symbol
        for (const stateId of currentStates) {
            const transitions = nfa.transitions.filter(
                t => t.source === stateId && t.symbol === char
            );
            for (const t of transitions) {
                nextStates.add(t.target);
                transitionCount++;
            }
        }

        // Epsilon closure after move
        currentStates = getEpsilonClosure(nfa, Array.from(nextStates));

        steps.push({
            stepId: i + 1,
            activeStateIds: [...currentStates],
            processedInput: input.slice(0, i + 1),
            remainingInput: input.slice(i + 1),
            currentSymbol: char,
            description: `Processed '${char}'`,
        });
    }

    const endTime = performance.now();
    const accepted = currentStates.some(id => nfa.acceptStateIds.includes(id));

    return {
        input,
        accepted,
        steps,
        metrics: {
            executionTimeMs: endTime - startTime,
            transitionsTaken: transitionCount,
            statesVisited: new Set(steps.flatMap(s => s.activeStateIds)).size,
            totalSteps: steps.length,
        },
    };
}

/**
 * Simulate DFA on input string
 */
export function simulateDFA(dfa, input) {
    const startTime = performance.now();
    const steps = [];
    let transitionCount = 0;

    let currentState = dfa.startStateId;

    steps.push({
        stepId: 0,
        activeStateIds: [currentState],
        processedInput: '',
        remainingInput: input,
        currentSymbol: null,
        description: 'Start',
    });

    for (let i = 0; i < input.length; i++) {
        const char = input[i];

        // Find transition
        const transition = dfa.transitions.find(
            t => t.source === currentState && t.symbol === char
        );

        if (transition) {
            currentState = transition.target;
            transitionCount++;
        } else {
            // Dead state - no transition found
            currentState = null;
        }

        steps.push({
            stepId: i + 1,
            activeStateIds: currentState ? [currentState] : [],
            processedInput: input.slice(0, i + 1),
            remainingInput: input.slice(i + 1),
            currentSymbol: char,
            description: currentState ? `Processed '${char}'` : `No transition for '${char}' - rejected`,
        });

        if (!currentState) break;
    }

    const endTime = performance.now();
    const accepted = currentState !== null && dfa.acceptStateIds.includes(currentState);

    return {
        input,
        accepted,
        steps,
        metrics: {
            executionTimeMs: endTime - startTime,
            transitionsTaken: transitionCount,
            statesVisited: new Set(steps.flatMap(s => s.activeStateIds)).size,
            totalSteps: steps.length,
        },
    };
}

/**
 * Compare performance of NFA vs DFA vs Minimized DFA
 */
export function comparePerformance(nfa, dfa, minDfa, testStrings) {
    const results = {
        testStrings: [],
        summary: {
            nfa: { totalTime: 0, totalTransitions: 0 },
            dfa: { totalTime: 0, totalTransitions: 0 },
            minDfa: { totalTime: 0, totalTransitions: 0 },
        },
        automataStats: {
            nfa: { stateCount: nfa.states.length, transitionCount: nfa.transitions.length },
            dfa: { stateCount: dfa.states.length, transitionCount: dfa.transitions.length },
            minDfa: { stateCount: minDfa.states.length, transitionCount: minDfa.transitions.length },
        },
    };

    for (const testString of testStrings) {
        const nfaResult = simulateNFA(nfa, testString);
        const dfaResult = simulateDFA(dfa, testString);
        const minDfaResult = simulateDFA(minDfa, testString);

        results.testStrings.push({
            input: testString,
            nfa: { accepted: nfaResult.accepted, ...nfaResult.metrics },
            dfa: { accepted: dfaResult.accepted, ...dfaResult.metrics },
            minDfa: { accepted: minDfaResult.accepted, ...minDfaResult.metrics },
        });

        results.summary.nfa.totalTime += nfaResult.metrics.executionTimeMs;
        results.summary.nfa.totalTransitions += nfaResult.metrics.transitionsTaken;
        results.summary.dfa.totalTime += dfaResult.metrics.executionTimeMs;
        results.summary.dfa.totalTransitions += dfaResult.metrics.transitionsTaken;
        results.summary.minDfa.totalTime += minDfaResult.metrics.executionTimeMs;
        results.summary.minDfa.totalTransitions += minDfaResult.metrics.transitionsTaken;
    }

    return results;
}
