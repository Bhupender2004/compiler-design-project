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
            <div className="text-center text-gray-500 mt-10">
                Run analysis to see results
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-500" />
                    <span>Performance Metrics</span>
                </h3>
                <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 flex items-center gap-1">
                            <Box className="w-3 h-3" /> States
                        </span>
                        <span className="font-medium">{metrics.stateCount}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 flex items-center gap-1">
                            <Zap className="w-3 h-3" /> Transitions
                        </span>
                        <span className="font-medium">{metrics.transitionCount}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Construction Time</span>
                        <span className="font-medium">{metrics.constructionTimeMs.toFixed(2)} ms</span>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-800 mb-3">Simulation Result</h3>
                {simulationSteps.length > 0 ? (
                    <div className={`flex items-center gap-2 p-3 rounded-md ${isAccepted ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                        }`}>
                        {isAccepted ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                        <span className="font-medium">
                            {isAccepted ? 'String Accepted' : 'String Rejected'}
                        </span>
                    </div>
                ) : (
                    <div className="text-gray-500 text-sm">No simulation run</div>
                )}
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-800 mb-3">Execution Log</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto font-mono text-xs">
                    {simulationSteps.map((step, idx) => (
                        <div
                            key={step.stepId}
                            className={`p-2 rounded ${idx === currentStepIndex ? 'bg-blue-50 border border-blue-200' : 'border border-transparent'
                                }`}
                        >
                            <div className="text-gray-500">Step {idx}: {step.description}</div>
                            <div className="text-gray-700">
                                Active: [{step.activeStateIds.map(id => id.replace('q', '').replace('D', '')).join(', ')}]
                            </div>
                            {step.currentSymbol && (
                                <div className="text-gray-700">Input: <span className="font-bold">{step.currentSymbol}</span></div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
