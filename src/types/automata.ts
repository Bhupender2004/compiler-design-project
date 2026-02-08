export type StateId = string;

export interface State {
    id: StateId;
    label: string;
    isStart: boolean;
    isAccept: boolean;
    x?: number; // For visualization
    y?: number;
}

export interface Transition {
    id: string;
    source: StateId;
    target: StateId;
    symbol: string; // 'ε' for epsilon transitions
}

export interface Automaton {
    states: State[];
    transitions: Transition[];
    startStateId: StateId;
    acceptStateIds: StateId[];
    type: 'NFA' | 'DFA';
}

export interface SimulationStep {
    stepId: number;
    activeStateIds: StateId[];
    processedInput: string;
    remainingInput: string;
    currentSymbol: string | null;
    description: string;
}

export interface SimulationResult {
    steps: SimulationStep[];
    accepted: boolean;
}

export interface PerformanceMetrics {
    stateCount: number;
    transitionCount: number;
    constructionTimeMs: number;
    processingTimeMs: number; // Avg time to process 1000 char string
}
