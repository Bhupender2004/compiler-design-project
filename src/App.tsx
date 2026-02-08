import { useState, useEffect } from 'react';
import { AutomataVisualizer } from './components/AutomataVisualizer';
import { InputPanel } from './components/InputPanel';
import { ResultsPanel } from './components/ResultsPanel';
import { ComparisonView } from './components/ComparisonView';
import { FullscreenDiagram } from './components/FullscreenDiagram';
import { useAutomata, useSimulation } from './hooks/useAutomata';
import { Play, Pause, SkipBack, SkipForward, Layout, Server, ServerOff, Maximize2 } from 'lucide-react';
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
    const [currentRegex, setCurrentRegex] = useState('');
    const [currentTestString, setCurrentTestString] = useState('');
    const [patterns, setPatterns] = useState(FALLBACK_PATTERNS);
    const [backendOnline, setBackendOnline] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

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

    const { nfa, dfa, minDFA, metrics, error } = useAutomata(currentRegex);

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
    } = useSimulation(activeAutomaton, currentTestString);

    const handleRunAnalysis = (regex: string, testString: string) => {
        setCurrentRegex(regex);
        setCurrentTestString(testString);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
            <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm z-10">
                <div className="flex items-center gap-3">
                    <Layout className="w-6 h-6 text-blue-600" />
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                        DFA vs NFA Analyzer
                    </h1>
                    {backendOnline ? (
                        <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                            <Server className="w-3 h-3" /> API Online
                        </span>
                    ) : (
                        <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            <ServerOff className="w-3 h-3" /> Local Mode
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {/* Tab Navigation */}
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        {(['NFA', 'DFA', 'MIN', 'COMPARE'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                                    activeTab === tab
                                        ? "bg-white text-blue-600 shadow-sm"
                                        : "text-gray-500 hover:text-gray-700"
                                )}
                            >
                                {tab === 'MIN' ? 'Minimized' : tab === 'COMPARE' ? 'Comparison' : tab}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <main className="flex-1 flex overflow-hidden">
                {/* Left Sidebar: Input - Hide on Compare view if full width requested */}
                {activeTab !== 'COMPARE' && (
                    <div className="w-1/4 bg-white border-r border-gray-200 flex flex-col z-10 shadow-sm">
                        <div className="p-4 border-b border-gray-100">
                            <h2 className="font-semibold text-gray-800">Configuration</h2>
                        </div>
                        <div className="p-4 overflow-y-auto flex-1">
                            <InputPanel
                                onRunAnalysis={handleRunAnalysis}
                                patterns={patterns}
                                regex={currentRegex}
                                testString={currentTestString}
                                onRegexChange={setCurrentRegex}
                                onTestStringChange={setCurrentTestString}
                            />
                            {error && (
                                <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-sm border border-red-200">
                                    Error: {error}
                                </div>
                            )}

                            {/* Show test string selector if needed here or just rely on InputPanel */}
                        </div>
                    </div>
                )}

                {/* Center: Visualization or Comparison */}
                <div className={cn("bg-gray-50 relative flex flex-col", activeTab === 'COMPARE' ? "w-full" : "w-1/2")}>
                    <div className="absolute inset-0 overflow-hidden">
                        {activeTab === 'COMPARE' ? (
                            metrics ? <ComparisonView metrics={metrics} /> : (
                                <div className="flex items-center justify-center h-full text-gray-400">
                                    Run analysis to see comparison
                                </div>
                            )
                        ) : activeAutomaton ? (
                            <AutomataVisualizer
                                automaton={activeAutomaton}
                                activeStateIds={currentStep?.activeStateIds}
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                                Select a pattern and run analysis to visualize
                            </div>
                        )}
                    </div>

                    {/* Simulation Controls Overlay */}
                    {activeAutomaton && activeTab !== 'COMPARE' && (
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm border border-gray-200 px-4 py-2 rounded-full shadow-lg flex items-center gap-4 z-20">
                            <button
                                onClick={() => setCurrentStepIndex(Math.max(0, currentStepIndex - 1))}
                                disabled={currentStepIndex === 0}
                                className="p-1 hover:bg-gray-100 rounded-full disabled:opacity-50"
                            >
                                <SkipBack className="w-5 h-5 text-gray-700" />
                            </button>

                            <button
                                onClick={() => setIsPlaying(!isPlaying)}
                                className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-md"
                            >
                                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 pl-0.5" />}
                            </button>

                            <button
                                onClick={() => setCurrentStepIndex(Math.min(steps.length - 1, currentStepIndex + 1))}
                                disabled={currentStepIndex >= steps.length - 1}
                                className="p-1 hover:bg-gray-100 rounded-full disabled:opacity-50"
                            >
                                <SkipForward className="w-5 h-5 text-gray-700" />
                            </button>

                            <div className="h-4 w-px bg-gray-300 mx-2" />

                            <div className="text-xs font-mono text-gray-600 min-w-[3ch] text-center">
                                {currentStepIndex}/{Math.max(0, steps.length - 1)}
                            </div>

                            <div className="h-4 w-px bg-gray-300 mx-2" />

                            <button
                                onClick={() => setIsFullscreen(true)}
                                className="p-1.5 hover:bg-gray-100 rounded-full"
                                title="Open fullscreen"
                            >
                                <Maximize2 className="w-4 h-4 text-gray-700" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Right Sidebar: Results */}
                {activeTab !== 'COMPARE' && (
                    <div className="w-1/4 bg-white border-l border-gray-200 flex flex-col z-10 shadow-sm">
                        <div className="p-4 border-b border-gray-100">
                            <h2 className="font-semibold text-gray-800">Analysis Results</h2>
                        </div>
                        <div className="p-4 overflow-y-auto flex-1">
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
                    title={`${activeTab === 'NFA' ? 'NFA' : activeTab === 'DFA' ? 'DFA' : 'Minimized DFA'} - ${currentRegex}`}
                    onClose={() => setIsFullscreen(false)}
                />
            )}
        </div>
    );
}

export default App;
