/**
 * API Routes for NFA/DFA construction and simulation
 */
import express from 'express';
import { PREDEFINED_PATTERNS } from '../data/patterns.js';
import { regexToNFA } from '../services/nfa.js';
import { nfaToDFA } from '../services/dfa.js';
import { minimizeDFA } from '../services/minimization.js';
import { simulateNFA, simulateDFA, comparePerformance } from '../services/simulation.js';
import { getFromCache, setInCache } from '../utils/cache.js';

const router = express.Router();

/**
 * GET /api/predefined-patterns
 * Returns the list of predefined token patterns
 */
router.get('/predefined-patterns', (req, res) => {
    res.json({
        success: true,
        data: PREDEFINED_PATTERNS,
    });
});

/**
 * POST /api/regex-to-nfa
 * Converts a regular expression to NFA using Thompson's construction
 */
router.post('/regex-to-nfa', (req, res) => {
    try {
        const { pattern } = req.body;

        if (!pattern || typeof pattern !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Pattern is required and must be a string',
            });
        }

        // Check cache
        const cacheKey = `nfa:${pattern}`;
        let nfa = getFromCache(cacheKey);

        if (!nfa) {
            const startTime = performance.now();
            nfa = regexToNFA(pattern);
            nfa.constructionTimeMs = performance.now() - startTime;
            setInCache(cacheKey, nfa);
        }

        res.json({
            success: true,
            data: nfa,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message || 'Failed to convert regex to NFA',
        });
    }
});

/**
 * POST /api/nfa-to-dfa
 * Converts an NFA to DFA using subset construction
 */
router.post('/nfa-to-dfa', (req, res) => {
    try {
        const { nfa } = req.body;

        if (!nfa || !nfa.states || !nfa.transitions) {
            return res.status(400).json({
                success: false,
                error: 'Valid NFA object is required',
            });
        }

        const startTime = performance.now();
        const dfa = nfaToDFA(nfa);
        dfa.constructionTimeMs = performance.now() - startTime;

        res.json({
            success: true,
            data: dfa,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message || 'Failed to convert NFA to DFA',
        });
    }
});

/**
 * POST /api/minimize-dfa
 * Minimizes a DFA using partition refinement
 */
router.post('/minimize-dfa', (req, res) => {
    try {
        const { dfa } = req.body;

        if (!dfa || !dfa.states || !dfa.transitions) {
            return res.status(400).json({
                success: false,
                error: 'Valid DFA object is required',
            });
        }

        const startTime = performance.now();
        const minDfa = minimizeDFA(dfa);
        minDfa.constructionTimeMs = performance.now() - startTime;

        res.json({
            success: true,
            data: minDfa,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message || 'Failed to minimize DFA',
        });
    }
});

/**
 * POST /api/simulate-nfa
 * Simulates NFA execution on a test string
 */
router.post('/simulate-nfa', (req, res) => {
    try {
        const { nfa, input } = req.body;

        if (!nfa || !nfa.states || !nfa.transitions) {
            return res.status(400).json({
                success: false,
                error: 'Valid NFA object is required',
            });
        }

        if (typeof input !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Input string is required',
            });
        }

        const result = simulateNFA(nfa, input);

        res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message || 'Failed to simulate NFA',
        });
    }
});

/**
 * POST /api/simulate-dfa
 * Simulates DFA execution on a test string
 */
router.post('/simulate-dfa', (req, res) => {
    try {
        const { dfa, input } = req.body;

        if (!dfa || !dfa.states || !dfa.transitions) {
            return res.status(400).json({
                success: false,
                error: 'Valid DFA object is required',
            });
        }

        if (typeof input !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Input string is required',
            });
        }

        const result = simulateDFA(dfa, input);

        res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message || 'Failed to simulate DFA',
        });
    }
});

/**
 * POST /api/compare-performance
 * Compares NFA vs DFA vs Minimized DFA performance
 */
router.post('/compare-performance', (req, res) => {
    try {
        const { pattern, testStrings } = req.body;

        if (!pattern || typeof pattern !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Pattern is required',
            });
        }

        if (!Array.isArray(testStrings) || testStrings.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Test strings array is required',
            });
        }

        // Build automata
        const nfaStartTime = performance.now();
        const nfa = regexToNFA(pattern);
        const nfaTime = performance.now() - nfaStartTime;

        const dfaStartTime = performance.now();
        const dfa = nfaToDFA(nfa);
        const dfaTime = performance.now() - dfaStartTime;

        const minStartTime = performance.now();
        const minDfa = minimizeDFA(dfa);
        const minTime = performance.now() - minStartTime;

        // Compare performance
        const comparison = comparePerformance(nfa, dfa, minDfa, testStrings);

        // Add construction times
        comparison.constructionTimes = {
            nfa: nfaTime,
            dfa: dfaTime,
            minDfa: minTime,
        };

        res.json({
            success: true,
            data: comparison,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message || 'Failed to compare performance',
        });
    }
});

/**
 * POST /api/full-analysis
 * Complete analysis: pattern -> NFA -> DFA -> MinDFA with all metrics
 */
router.post('/full-analysis', (req, res) => {
    try {
        const { pattern } = req.body;

        if (!pattern || typeof pattern !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Pattern is required',
            });
        }

        // Build all automata with timing
        const nfaStartTime = performance.now();
        const nfa = regexToNFA(pattern);
        const nfaTime = performance.now() - nfaStartTime;

        const dfaStartTime = performance.now();
        const dfa = nfaToDFA(nfa);
        const dfaTime = performance.now() - dfaStartTime;

        const minStartTime = performance.now();
        const minDfa = minimizeDFA(dfa);
        const minTime = performance.now() - minStartTime;

        res.json({
            success: true,
            data: {
                nfa: { ...nfa, constructionTimeMs: nfaTime },
                dfa: { ...dfa, constructionTimeMs: dfaTime },
                minDfa: { ...minDfa, constructionTimeMs: minTime },
                metrics: {
                    nfa: {
                        stateCount: nfa.states.length,
                        transitionCount: nfa.transitions.length,
                        constructionTimeMs: nfaTime,
                    },
                    dfa: {
                        stateCount: dfa.states.length,
                        transitionCount: dfa.transitions.length,
                        constructionTimeMs: dfaTime,
                    },
                    minDfa: {
                        stateCount: minDfa.states.length,
                        transitionCount: minDfa.transitions.length,
                        constructionTimeMs: minTime,
                    },
                },
            },
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message || 'Failed to perform full analysis',
        });
    }
});

export default router;
