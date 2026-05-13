import { useState, useEffect } from 'react';
import { AutomataVisualizer } from './components/AutomataVisualizer';
import { InputPanel } from './components/InputPanel';
import { ResultsPanel } from './components/ResultsPanel';
import { ComparisonView } from './components/ComparisonView';
import { FullscreenDiagram } from './components/FullscreenDiagram';
import { useAutomata, useSimulation } from './hooks/useAutomata';
import { Play, Pause, SkipBack, SkipForward, Layout, Server, ServerOff, Maximize2, Moon, Sun } from 'lucide-react';
import { cn } from './utils/cn';
import { fetchPredefinedPatterns, checkBackendHealth } from './services/api';

// Fallback patterns if backend is unavailable
const FALLBACK_PATTERNS = [
    { name: 'Simple (a|b)*', regex: '(a|b)*' },
    { name: 'Binary (0|1)*', regex: '(0|1)*' },
    { name: 'Keyword if', regex: 'if' },
    { name: 'Keyword while', regex: 'while' },
];

function App() {
    // Input state (what user is typing - does NOT trigger analysis)
    const [inputRegex, setInputRegex] = useState('');
    const [inputTestString, setInputTestString] = useState('');
    // Analysis state (committed - triggers diagram generation)
    const [analysisRegex, setAnalysisRegex] = useState('');
    const [analysisTestString, setAnalysisTestString] = useState('');
    const [patterns, setPatterns] = useState(FALLBACK_PATTERNS);
    const [backendOnline, setBackendOnline] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const root = window.document.documentElement;
        if (isDarkMode) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [isDarkMode]);

    // Check backend and load patterns on mount
    useEffect(() => {
        async function loadPatterns() {
            try {
                const isOnline = await checkBackendHealth();
                setBackendOnline(isOnline);
                if (isOnline) {
                    const fetchedPatterns = await fetchPredefinedPatterns();
                    setPatterns(fetchedPatterns.map((p: { name: string; regex: string }) => ({
                        name: p.name,
                        regex: p.regex
                    })));
                }
            } catch (e) {
                console.warn('Backend not available, using fallback patterns');
            }
        }
        loadPatterns();
    }, []);

    const { nfa, dfa, minDFA, metrics, error } = useAutomata(analysisRegex);

    // State for active tab
    const [activeTab, setActiveTab] = useState<'NFA' | 'DFA' | 'MIN' | 'COMPARE'>('NFA');

    const activeAutomaton = activeTab === 'NFA' ? nfa : activeTab === 'DFA' ? dfa : activeTab === 'MIN' ? minDFA : null;

    const {
        steps,
        currentStepIndex,
        setCurrentStepIndex,
        isPlaying,
        setIsPlaying,
        currentStep,
        isAccepted
    } = useSimulation(activeAutomaton, analysisTestString);

    const handleRunAnalysis = (regex: string, testString: string) => {
        setAnalysisRegex(regex);
        setAnalysisTestString(testString);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] flex flex-col font-sans text-slate-900 dark:text-zinc-100 transition-colors duration-200">
            <header className="bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md sticky top-0 border-b border-slate-200 dark:border-zinc-800 px-6 py-3.5 flex items-center justify-between shadow-sm z-30 transition-colors duration-200">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-600 p-1.5 rounded-lg">
                        <Layout className="w-5 h-5 text-white" />
                    </div>
                    <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-zinc-50">
                        Automata<span className="text-indigo-600">Lab</span>
                    </h1>
                    <div className="h-4 w-px bg-slate-200 dark:bg-zinc-800 mx-1" />
                    {backendOnline ? (
                        <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-500/20">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            API Online
                        </span>
                    ) : (
                        <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-zinc-700">
                            <ServerOff className="w-3 h-3" /> Local Mode
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-4">
                    {/* Tab Navigation */}
                    <div className="flex bg-slate-100 dark:bg-zinc-900 p-1 rounded-xl border border-slate-200 dark:border-zinc-800">
                        {(['NFA', 'DFA', 'MIN', 'COMPARE'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    "px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200",
                                    activeTab === tab
                                        ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-zinc-700"
                                        : "text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200"
                                )}
                            >
                                {tab === 'MIN' ? 'Minimized' : tab === 'COMPARE' ? 'Comparison' : tab}
                            </button>
                        ))}
                    </div>
                    {/* Theme Toggle */}
                    <button
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        className="p-2 text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900 hover:text-slate-700 dark:hover:text-zinc-200 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-zinc-800 transition-all"
                        title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    >
                        {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </button>
                </div>
            </header>

            <main className="flex-1 flex overflow-hidden">
                {/* Left Sidebar: Input - Hide on Compare view if full width requested */}
                {activeTab !== 'COMPARE' && (
                    <div className="w-[300px] xl:w-[350px] bg-white dark:bg-zinc-950 border-r border-slate-200 dark:border-zinc-800 flex flex-col z-10 transition-colors duration-200">
                        <div className="px-5 py-4 border-b border-slate-100 dark:border-zinc-900 flex items-center justify-between">
                            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100 tracking-tight uppercase opacity-70">Configuration</h2>
                        </div>
                        <div className="p-5 overflow-y-auto flex-1 custom-scrollbar">
                            <InputPanel
                                onRunAnalysis={handleRunAnalysis}
                                patterns={patterns}
                                regex={inputRegex}
                                testString={inputTestString}
                                onRegexChange={setInputRegex}
                                onTestStringChange={setInputTestString}
                            />
                            {error && (
                                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-md text-sm border border-red-200 dark:border-red-900/50">
                                    Error: {error}
                                </div>
                            )}

                            {/* Show test string selector if needed here or just rely on InputPanel */}
                        </div>
                    </div>
                )}

                {/* Center: Visualization or Comparison */}
                <div className={cn("bg-slate-50 dark:bg-[#0c0c0e] relative flex flex-col transition-colors duration-200", activeTab === 'COMPARE' ? "w-full" : "flex-1")}>
                    <div className="absolute inset-0 overflow-hidden flex items-center justify-center p-8">
                        {activeTab === 'COMPARE' ? (
                            metrics ? <ComparisonView metrics={metrics} /> : (
                                <div className="flex flex-col items-center gap-3 text-slate-400 dark:text-zinc-600">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-zinc-900 flex items-center justify-center">
                                        <Layout className="w-6 h-6 opacity-40" />
                                    </div>
                                    <p className="text-sm font-medium">Run analysis to see comparison</p>
                                </div>
                            )
                        ) : activeAutomaton ? (
                            <AutomataVisualizer
                                automaton={activeAutomaton}
                                activeStateIds={currentStep?.activeStateIds}
                            />
                        ) : (
                            <div className="flex flex-col items-center gap-3 text-slate-400 dark:text-zinc-600">
                                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-zinc-900 flex items-center justify-center">
                                    <Layout className="w-6 h-6 opacity-40" />
                                </div>
                                <p className="text-sm font-medium">Select a pattern and run analysis to visualize</p>
                            </div>
                        )}
                    </div>

                    {/* Simulation Controls Overlay */}
                    {activeAutomaton && activeTab !== 'COMPARE' && (
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 glass px-5 py-2.5 rounded-2xl shadow-2xl flex items-center gap-5 z-20 border border-white/20 dark:border-zinc-700/30 transition-all duration-300">
                            <button
                                onClick={() => setCurrentStepIndex(Math.max(0, currentStepIndex - 1))}
                                disabled={currentStepIndex === 0}
                                className="p-1.5 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl disabled:opacity-30 text-slate-700 dark:text-zinc-300 transition-all"
                            >
                                <SkipBack className="w-5 h-5" />
                            </button>

                            <button
                                onClick={() => setIsPlaying(!isPlaying)}
                                className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                            >
                                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current pl-0.5" />}
                            </button>

                            <button
                                onClick={() => setCurrentStepIndex(Math.min(steps.length - 1, currentStepIndex + 1))}
                                disabled={currentStepIndex >= steps.length - 1}
                                className="p-1.5 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl disabled:opacity-30 text-slate-700 dark:text-zinc-300 transition-all"
                            >
                                <SkipForward className="w-5 h-5" />
                            </button>

                            <div className="h-6 w-px bg-slate-200 dark:bg-zinc-800" />

                            <div className="text-[13px] font-mono font-bold text-slate-600 dark:text-zinc-400 min-w-[4ch] text-center bg-slate-100 dark:bg-zinc-800 px-2 py-1 rounded-lg">
                                {currentStepIndex}<span className="opacity-30 mx-0.5">/</span>{Math.max(0, steps.length - 1)}
                            </div>

                            <div className="h-6 w-px bg-slate-200 dark:bg-zinc-800" />

                            <button
                                onClick={() => setIsFullscreen(true)}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl text-slate-700 dark:text-zinc-300 transition-all"
                                title="Open fullscreen"
                            >
                                <Maximize2 className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Right Sidebar: Results */}
                {activeTab !== 'COMPARE' && (
                    <div className="w-[320px] xl:w-[380px] bg-white dark:bg-zinc-950 border-l border-slate-200 dark:border-zinc-800 flex flex-col z-10 transition-colors duration-200">
                        <div className="px-5 py-4 border-b border-slate-100 dark:border-zinc-900 flex items-center justify-between">
                            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100 tracking-tight uppercase opacity-70">Analysis Results</h2>
                        </div>
                        <div className="p-5 overflow-y-auto flex-1 custom-scrollbar">
                            <ResultsPanel
                                metrics={metrics ? (
                                    activeTab === 'NFA' ? metrics.nfa :
                                        activeTab === 'DFA' ? metrics.dfa :
                                            metrics.minDfa
                                ) : null}
                                simulationSteps={steps}
                                currentStepIndex={currentStepIndex}
                                isAccepted={isAccepted}
                            />
                        </div>
                    </div>
                )}
            </main>

            {/* Fullscreen Diagram Overlay */}
            {isFullscreen && activeAutomaton && (
                <FullscreenDiagram
                    automaton={activeAutomaton}
                    title={`${activeTab === 'NFA' ? 'NFA' : activeTab === 'DFA' ? 'DFA' : 'Minimized DFA'} - ${analysisRegex}`}
                    onClose={() => setIsFullscreen(false)}
                />
            )}
        </div>
    );
}

export default App;
