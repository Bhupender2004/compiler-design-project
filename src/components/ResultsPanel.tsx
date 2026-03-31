import type { PerformanceMetrics, SimulationStep } from '../types/automata';
import { CheckCircle, XCircle, Activity, Box, Zap } from 'lucide-react';

interface Props {
    metrics: PerformanceMetrics | null;
    simulationSteps: SimulationStep[];
    currentStepIndex: number;
    isAccepted: boolean | null;
}

export function ResultsPanel({ metrics, simulationSteps, currentStepIndex, isAccepted }: Props) {
    if (!metrics) {
        return (
            <div className="text-center text-gray-500 dark:text-gray-400 mt-10">
                Run analysis to see results
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 transition-colors">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-500" />
                    <span>Performance Metrics</span>
                </h3>
                <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                            <Box className="w-3 h-3" /> States
                        </span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{metrics.stateCount}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                            <Zap className="w-3 h-3" /> Transitions
                        </span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{metrics.transitionCount}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Construction Time</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{metrics.constructionTimeMs.toFixed(2)} ms</span>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 transition-colors">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Simulation Result</h3>
                {simulationSteps.length > 0 ? (
                    <div className={`flex items-center gap-2 p-3 rounded-md transition-colors ${isAccepted ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                        }`}>
                        {isAccepted ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                        <span className="font-medium">
                            {isAccepted ? 'String Accepted' : 'String Rejected'}
                        </span>
                    </div>
                ) : (
                    <div className="text-gray-500 dark:text-gray-400 text-sm">No simulation run</div>
                )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 transition-colors">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Execution Log</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto font-mono text-xs pr-2">
                    {simulationSteps.map((step, idx) => (
                        <div
                            key={step.stepId}
                            className={`p-2 rounded transition-colors ${idx === currentStepIndex ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800/50' : 'border border-transparent'
                                }`}
                        >
                            <div className="text-gray-500 dark:text-gray-400">Step {idx}: {step.description}</div>
                            <div className="text-gray-700 dark:text-gray-300">
                                Active: [{step.activeStateIds.map(id => id.replace('q', '').replace('D', '')).join(', ')}]
                            </div>
                            {step.currentSymbol && (
                                <div className="text-gray-700 dark:text-gray-300">Input: <span className="font-bold text-gray-900 dark:text-gray-100">{step.currentSymbol}</span></div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
