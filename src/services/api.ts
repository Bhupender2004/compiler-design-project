/**
 * API Client for DFA/NFA Performance Analyzer Backend
 */

const API_BASE_URL = 'http://localhost:3001/api';

/**
 * Fetch predefined patterns from backend
 */
export async function fetchPredefinedPatterns() {
    const response = await fetch(`${API_BASE_URL}/predefined-patterns`);
    const data = await response.json();
    if (!data.success) throw new Error(data.error);
    return data.data;
}

/**
 * Convert regex to NFA
 */
export async function regexToNFA(pattern: string) {
    const response = await fetch(`${API_BASE_URL}/regex-to-nfa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pattern }),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.error);
    return data.data;
}

/**
 * Convert NFA to DFA
 */
export async function nfaToDFA(nfa: any) {
    const response = await fetch(`${API_BASE_URL}/nfa-to-dfa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nfa }),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.error);
    return data.data;
}

/**
 * Minimize DFA
 */
export async function minimizeDFA(dfa: any) {
    const response = await fetch(`${API_BASE_URL}/minimize-dfa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dfa }),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.error);
    return data.data;
}

/**
 * Simulate NFA
 */
export async function simulateNFA(nfa: any, input: string) {
    const response = await fetch(`${API_BASE_URL}/simulate-nfa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nfa, input }),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.error);
    return data.data;
}

/**
 * Simulate DFA
 */
export async function simulateDFA(dfa: any, input: string) {
    const response = await fetch(`${API_BASE_URL}/simulate-dfa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dfa, input }),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.error);
    return data.data;
}

/**
 * Compare performance
 */
export async function comparePerformance(pattern: string, testStrings: string[]) {
    const response = await fetch(`${API_BASE_URL}/compare-performance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pattern, testStrings }),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.error);
    return data.data;
}

/**
 * Full analysis - get all automata at once
 */
export async function fullAnalysis(pattern: string) {
    const response = await fetch(`${API_BASE_URL}/full-analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pattern }),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.error);
    return data.data;
}

/**
 * Check if backend is available
 */
export async function checkBackendHealth() {
    try {
        const response = await fetch('http://localhost:3001/health');
        const data = await response.json();
        return data.status === 'ok';
    } catch {
        return false;
    }
}
