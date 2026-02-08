import { useState, useEffect } from 'react';
import { regexToNFA } from '../utils/nfa';
import { nfaToDFA } from '../utils/dfa';
import { minimizeDFA } from '../utils/minimization';
import type { Automaton, PerformanceMetrics, SimulationStep } from '../types/automata';

export interface AllMetrics {
    nfa: PerformanceMetrics;
    dfa: PerformanceMetrics;
    minDfa: PerformanceMetrics;
}

export function useAutomata(regex: string) {
    const [nfa, setNFA] = useState<Automaton | null>(null);
    const [dfa, setDFA] = useState<Automaton | null>(null);
    const [minDFA, setMinDFA] = useState<Automaton | null>(null);
    const [metrics, setMetrics] = useState<AllMetrics | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!regex) {
            setNFA(null);
            setDFA(null);
            setMinDFA(null);
            setError(null);
            return;
        }

        try {
            const start = performance.now();

            const nfaResult = regexToNFA(regex);
            const nfaTime = performance.now();

            const dfaResult = nfaToDFA(nfaResult);
            const dfaTime = performance.now();

            const minDFAResult = minimizeDFA(dfaResult);
            const minTime = performance.now();

            setNFA(nfaResult);
            setDFA(dfaResult);
            setMinDFA(minDFAResult);
            setError(null);

            setMetrics({
                nfa: {
                    stateCount: nfaResult.states.length,
                    transitionCount: nfaResult.transitions.length,
                    constructionTimeMs: nfaTime - start,
                    processingTimeMs: 0
                },
                dfa: {
                    stateCount: dfaResult.states.length,
                    transitionCount: dfaResult.transitions.length,
                    constructionTimeMs: dfaTime - nfaTime,
                    processingTimeMs: 0
                },
                minDfa: {
                    stateCount: minDFAResult.states.length,
                    transitionCount: minDFAResult.transitions.length,
                    constructionTimeMs: minTime - dfaTime,
                    processingTimeMs: 0
                }
            });

        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Invalid Regex');
            setNFA(null);
            setDFA(null);
            setMinDFA(null);
        }
    }, [regex]);

    return { nfa, dfa, minDFA, metrics, error };
}

export function useSimulation(automaton: Automaton | null, input: string) {
    const [steps, setSteps] = useState<SimulationStep[]>([]);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    // Generate steps
    useEffect(() => {
        if (!automaton) {
            setSteps([]);
            setCurrentStepIndex(0);
            return;
        }

        // If no input, just show initial state (don't clear diagram)
        if (!input) {
            setSteps([{
                stepId: 0,
                activeStateIds: [automaton.startStateId],
                processedInput: '',
                remainingInput: '',
                currentSymbol: null,
                description: 'Ready - enter a test string',
            }]);
            setCurrentStepIndex(0);
            return;
        }

        const newSteps: SimulationStep[] = [];
        let currentStates = [automaton.startStateId];

        // Initial Step
        newSteps.push({
            stepId: 0,
            activeStateIds: [...currentStates],
            processedInput: '',
            remainingInput: input,
            currentSymbol: null,
            description: 'Start',
        });

        for (let i = 0; i < input.length; i++) {
            const char = input[i];

            // Find transitions for each current state
            // For NFA, we need epsilon closure logic if not already handled?
            // Wait, my NFA simulation logic needs to handle epsilon closures if the structure uses them.
            // My regexToNFA uses epsilons.
            // So I need a helper `step` function that handles epsilon closure.

            // Helper to get epsilon closure
            const getEpsilonClosure = (ids: string[]) => {
                const stack = [...ids];
                const closure = new Set(ids);
                while (stack.length > 0) {
                    const id = stack.pop()!;
                    automaton.transitions
                        .filter(t => t.source === id && t.symbol === 'ε') // EPSILON
                        .forEach(t => {
                            if (!closure.has(t.target)) {
                                closure.add(t.target);
                                stack.push(t.target);
                            }
                        });
                }
                return Array.from(closure);
            };

            // If it's step 0, ensure we are in epsilon closure of start
            if (i === 0) {
                const closure = getEpsilonClosure(currentStates);
                if (closure.length > currentStates.length) {
                    currentStates = closure;
                    // Update step 0 or add step 0.5?
                    // Let's update step 0 active states
                    newSteps[0].activeStateIds = currentStates;
                }
            }

            const activeAfterMove: string[] = [];

            // Move - find transitions for current character
            currentStates.forEach(stateId => {
                automaton.transitions
                    .filter(t => t.source === stateId && t.symbol === char)
                    .forEach(t => {
                        activeAfterMove.push(t.target);
                    });
            });

            // Epsilon closure after move
            const nextStatesClosure = getEpsilonClosure(activeAfterMove);
            currentStates = nextStatesClosure;

            // Debug log
            console.log(`Step ${i + 1}: char='${char}', activeAfterMove=[${activeAfterMove}], nextStates=[${currentStates}]`);

            newSteps.push({
                stepId: i + 1,
                activeStateIds: [...currentStates],
                processedInput: input.slice(0, i + 1),
                remainingInput: input.slice(i + 1),
                currentSymbol: char,
                description: currentStates.length === 0
                    ? `Processed '${char}' - NO TRANSITION (Dead State)`
                    : `Processed '${char}'`,
            });
        }

        console.log('=== SIMULATION DEBUG ===');
        console.log('Input:', input);
        console.log('Total steps:', newSteps.length);
        console.log('All steps:', newSteps.map(s => ({ step: s.stepId, char: s.currentSymbol, active: s.activeStateIds })));
        const lastStep = newSteps[newSteps.length - 1];
        console.log('Last step active states:', lastStep?.activeStateIds);
        console.log('Automaton accept states:', automaton.acceptStateIds);
        const wouldAccept = lastStep?.activeStateIds.length > 0 &&
            lastStep?.activeStateIds.some(id => automaton.acceptStateIds.includes(id));
        console.log('Would accept:', wouldAccept);
        console.log('========================');

        setSteps(newSteps);
        setCurrentStepIndex(0);
        setIsPlaying(false);

    }, [automaton, input]);

    // Play controls
    useEffect(() => {
        let interval: any;
        if (isPlaying) {
            interval = setInterval(() => {
                setCurrentStepIndex(prev => {
                    if (prev < steps.length - 1) return prev + 1;
                    setIsPlaying(false);
                    return prev;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isPlaying, steps.length]);

    return {
        steps,
        currentStepIndex,
        setCurrentStepIndex,
        isPlaying,
        setIsPlaying,
        currentStep: steps[currentStepIndex],
        isAccepted: steps.length > 0 &&
            steps[steps.length - 1].activeStateIds.length > 0 &&
            steps[steps.length - 1].activeStateIds.some(id => automaton?.acceptStateIds.includes(id))
    };
}
