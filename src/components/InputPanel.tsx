import { useState } from 'react';
import { Play, RotateCcw, HelpCircle, AlertCircle } from 'lucide-react';

interface Props {
    onRunAnalysis: (regex: string, testString: string) => void;
    patterns: { name: string; regex: string }[];
    // Controlled props - parent manages the state
    regex: string;
    testString: string;
    onRegexChange: (regex: string) => void;
    onTestStringChange: (testString: string) => void;
}

export function InputPanel({
    onRunAnalysis,
    patterns,
    regex,
    testString,
    onRegexChange,
    onTestStringChange
}: Props) {
    const [selectedPattern, setSelectedPattern] = useState('');
    const [error, setError] = useState<string | null>(null);

    // When pattern selection changes, update regex
    const handlePatternChange = (value: string) => {
        setSelectedPattern(value);
        if (value) {
            onRegexChange(value);
        }
        setError(null);
    };

    // Validate regex has basic correct syntax
    const validateRegex = (r: string): boolean => {
        if (!r.trim()) return false;
        // Check for balanced parentheses
        let depth = 0;
        for (const char of r) {
            if (char === '(') depth++;
            if (char === ')') depth--;
            if (depth < 0) return false;
        }
        return depth === 0;
    };

    const handleRun = () => {
        if (!regex.trim()) {
            setError('Please enter a regular expression');
            return;
        }
        if (!validateRegex(regex)) {
            setError('Invalid regex: check parentheses');
            return;
        }
        setError(null);
        onRunAnalysis(regex, testString);
    };

    const handleReset = () => {
        onRegexChange('');
        onTestStringChange('');
        setSelectedPattern('');
        setError(null);
    };

    return (
        <div className="space-y-8">
            <div className="space-y-4">
                <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-zinc-500 mb-1.5 uppercase tracking-wider">
                        Select Pattern
                    </label>
                    <select
                        value={selectedPattern}
                        className="w-full bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 border-slate-200 dark:border-zinc-800 rounded-xl shadow-sm p-2.5 border focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all appearance-none text-sm"
                        onChange={(e) => handlePatternChange(e.target.value)}
                    >
                        <option value="">Custom Pattern</option>
                        {patterns.map((p) => (
                            <option key={p.name} value={p.regex}>
                                {p.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-zinc-500 mb-1.5 uppercase tracking-wider flex justify-between items-center">
                        <span>Regular Expression</span>
                        <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-help" />
                    </label>
                    <input
                        type="text"
                        value={regex}
                        onChange={(e) => { onRegexChange(e.target.value); setError(null); }}
                        className={`w-full bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 rounded-xl shadow-sm p-3 border font-mono text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all ${error ? 'border-red-400 dark:border-red-500/50 bg-red-50/30 dark:bg-red-500/5' : 'border-slate-200 dark:border-zinc-800'}`}
                        placeholder="e.g., (a|b)*"
                    />
                    {error && (
                        <div className="text-red-500 text-[11px] font-medium mt-1.5 flex items-center gap-1.5 px-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            {error}
                        </div>
                    )}
                </div>

                <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-zinc-500 mb-1.5 uppercase tracking-wider">
                        Test String
                    </label>
                    <input
                        type="text"
                        value={testString}
                        onChange={(e) => onTestStringChange(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 border-slate-200 dark:border-zinc-800 rounded-xl shadow-sm p-3 border font-mono text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                        placeholder="Enter string to test..."
                    />
                    {testString === '' && regex && (
                        <div className="text-slate-400 dark:text-zinc-500 text-[11px] mt-1.5 flex items-center gap-1.5 px-1">
                            <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-zinc-700" />
                            Testing ε (empty string)
                        </div>
                    )}
                </div>
            </div>

            <div className="flex gap-3 pt-2">
                <button
                    onClick={handleRun}
                    disabled={!regex.trim()}
                    className="flex-1 bg-indigo-600 text-white px-4 py-3 rounded-xl hover:bg-indigo-700 active:scale-[0.98] flex items-center justify-center gap-2 text-sm font-bold disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-600/20"
                >
                    <Play className="w-4 h-4 fill-current" />
                    Run Analysis
                </button>
                <button
                    onClick={handleReset}
                    className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-zinc-100 active:scale-[0.98] transition-all shadow-sm"
                    title="Reset all"
                >
                    <RotateCcw className="w-4 h-4" />
                </button>
            </div>

            <div className="pt-4 space-y-4">
                <div className="text-[11px] bg-slate-50/50 dark:bg-zinc-900/50 border border-slate-100 dark:border-zinc-800/50 p-4 rounded-xl space-y-2">
                    <strong className="text-slate-900 dark:text-zinc-200 uppercase tracking-tight opacity-70">Supported Operators</strong>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                        <div className="flex items-center gap-2">
                            <code className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 px-1.5 py-0.5 rounded text-[10px] font-bold text-indigo-600 dark:text-indigo-400">|</code>
                            <span className="text-slate-500 dark:text-zinc-400">Union</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <code className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 px-1.5 py-0.5 rounded text-[10px] font-bold text-indigo-600 dark:text-indigo-400">*</code>
                            <span className="text-slate-500 dark:text-zinc-400">Kleene Star</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <code className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 px-1.5 py-0.5 rounded text-[10px] font-bold text-indigo-600 dark:text-indigo-400">()</code>
                            <span className="text-slate-500 dark:text-zinc-400">Grouping</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <code className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 px-1.5 py-0.5 rounded text-[10px] font-bold text-indigo-600 dark:text-indigo-400">ab</code>
                            <span className="text-slate-500 dark:text-zinc-400">Concat</span>
                        </div>
                    </div>
                </div>

                <details className="group">
                    <summary className="flex items-center justify-between text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-100/50 dark:border-indigo-500/10 p-3 rounded-xl cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all list-none">
                        <span className="uppercase tracking-wider">Instructions</span>
                        <HelpCircle className="w-3.5 h-3.5 transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="mt-2 px-3 py-1 space-y-3 text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed">
                        <p>1. Choose a preset or enter a <strong>Regular Expression</strong> (e.g., <code className="text-indigo-600 dark:text-indigo-400 font-bold">(a|b)*abb</code>).</p>
                        <p>2. Enter a <strong>Test String</strong> to visualize how it's processed.</p>
                        <p>3. Use the tabs to compare <strong>NFA</strong>, <strong>DFA</strong>, and <strong>Minimized</strong> versions.</p>
                    </div>
                </details>
            </div>
        </div>
    );
}
