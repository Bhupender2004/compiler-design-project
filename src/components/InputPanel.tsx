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
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Pattern
                </label>
                <select
                    value={selectedPattern}
                    className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between">
                    <span>Regular Expression</span>
                    <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                </label>
                <input
                    type="text"
                    value={regex}
                    onChange={(e) => { onRegexChange(e.target.value); setError(null); }}
                    className={`w-full rounded-md shadow-sm p-2 border font-mono focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-400' : 'border-gray-300'}`}
                    placeholder="e.g., (a|b)*"
                />
                {error && (
                    <div className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {error}
                    </div>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Test String
                </label>
                <input
                    type="text"
                    value={testString}
                    onChange={(e) => onTestStringChange(e.target.value)}
                    className="w-full border-gray-300 rounded-md shadow-sm p-2 border font-mono focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter string to test (leave empty for ε)"
                />
                {testString === '' && regex && (
                    <div className="text-gray-500 text-xs mt-1">
                        ε (empty string) will be tested
                    </div>
                )}
            </div>

            <div className="flex gap-3">
                <button
                    onClick={handleRun}
                    disabled={!regex.trim()}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <Play className="w-4 h-4" />
                    Run Analysis
                </button>
                <button
                    onClick={handleReset}
                    className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors"
                    title="Reset all"
                >
                    <RotateCcw className="w-4 h-4" />
                </button>
            </div>

            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-md">
                <strong>Supported operators:</strong>
                <ul className="mt-1 space-y-0.5">
                    <li>• <code className="bg-gray-200 px-1 rounded">|</code> - Union (or)</li>
                    <li>• <code className="bg-gray-200 px-1 rounded">*</code> - Kleene star (zero or more)</li>
                    <li>• <code className="bg-gray-200 px-1 rounded">()</code> - Grouping</li>
                    <li>• <code className="bg-gray-200 px-1 rounded">ab</code> - Concatenation</li>
                </ul>
            </div>
        </div>
    );
}
