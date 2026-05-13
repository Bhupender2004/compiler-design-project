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
            <div className="bg-white dark:bg-zinc-950 rounded-xl shadow-sm border border-slate-200 dark:border-zinc-800 p-5 transition-all">
                <h3 className="text-[11px] font-bold text-slate-500 dark:text-zinc-500 mb-4 uppercase tracking-wider flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Performance Metrics</span>
                </h3>
                <div className="grid gap-3">
                    <div className="flex justify-between items-center bg-slate-50 dark:bg-zinc-900/50 p-2.5 rounded-lg border border-slate-100 dark:border-zinc-800/50">
                        <span className="text-xs font-medium text-slate-600 dark:text-zinc-400 flex items-center gap-2">
                            <Box className="w-3.5 h-3.5 opacity-70" /> States
                        </span>
                        <span className="text-sm font-bold text-slate-900 dark:text-zinc-100">{metrics.stateCount}</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-50 dark:bg-zinc-900/50 p-2.5 rounded-lg border border-slate-100 dark:border-zinc-800/50">
                        <span className="text-xs font-medium text-slate-600 dark:text-zinc-400 flex items-center gap-2">
                            <Zap className="w-3.5 h-3.5 opacity-70" /> Transitions
                        </span>
                        <span className="text-sm font-bold text-slate-900 dark:text-zinc-100">{metrics.transitionCount}</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-50 dark:bg-zinc-900/50 p-2.5 rounded-lg border border-slate-100 dark:border-zinc-800/50">
                        <span className="text-xs font-medium text-slate-600 dark:text-zinc-400">Construction</span>
                        <span className="text-sm font-bold text-slate-900 dark:text-zinc-100">{metrics.constructionTimeMs.toFixed(2)} ms</span>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-950 rounded-xl shadow-sm border border-slate-200 dark:border-zinc-800 p-5 transition-all">
                <h3 className="text-[11px] font-bold text-slate-500 dark:text-zinc-500 mb-4 uppercase tracking-wider">Simulation Result</h3>
                {simulationSteps.length > 0 ? (
                    <div className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${isAccepted 
                        ? 'bg-emerald-50/50 dark:bg-emerald-500/5 border-emerald-100 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400' 
                        : 'bg-rose-50/50 dark:bg-rose-500/5 border-rose-100 dark:border-rose-500/20 text-rose-700 dark:text-rose-400'
                        }`}>
                        {isAccepted ? <CheckCircle className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold uppercase tracking-tight opacity-70">Status</span>
                            <span className="text-base font-bold leading-tight">
                                {isAccepted ? 'Accepted' : 'Rejected'}
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="text-slate-400 dark:text-zinc-600 text-[11px] italic py-2">No simulation run</div>
                )}
            </div>

            <div className="bg-white dark:bg-zinc-950 rounded-xl shadow-sm border border-slate-200 dark:border-zinc-800 p-5 transition-all flex-1 overflow-hidden flex flex-col">
                <h3 className="text-[11px] font-bold text-slate-500 dark:text-zinc-500 mb-4 uppercase tracking-wider flex items-center justify-between">
                    <span>Execution Log</span>
                    <span className="text-[10px] bg-slate-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded opacity-70">{simulationSteps.length} Steps</span>
                </h3>
                <div className="space-y-2 overflow-y-auto font-mono text-[11px] pr-1 custom-scrollbar">
                    {simulationSteps.map((step, idx) => (
                        <div
                            key={step.stepId}
                            className={`p-3 rounded-lg border transition-all ${idx === currentStepIndex 
                                ? 'bg-indigo-50/50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30' 
                                : 'border-transparent hover:bg-slate-50 dark:hover:bg-zinc-900/50'
                                }`}
                        >
                            <div className="flex items-center gap-2 mb-1.5">
                                <span className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 px-1.5 py-0.5 rounded text-[9px] font-bold text-slate-500">{idx}</span>
                                <span className="text-slate-900 dark:text-zinc-200 font-medium truncate">{step.description}</span>
                            </div>
                            <div className="flex flex-wrap gap-2 items-center">
                                <div className="text-slate-500 dark:text-zinc-500 flex items-center gap-1.5">
                                    <span className="opacity-50">Active:</span>
                                    <span className="text-slate-900 dark:text-zinc-200 font-bold bg-slate-100 dark:bg-zinc-800 px-1.5 rounded-md">
                                        {step.activeStateIds.map(id => id.replace('q', '').replace('D', '')).join(', ')}
                                    </span>
                                </div>
                                {step.currentSymbol && (
                                    <div className="text-slate-500 dark:text-zinc-500 flex items-center gap-1.5">
                                        <span className="opacity-50">Input:</span>
                                        <span className="text-indigo-600 dark:text-indigo-400 font-bold px-1.5 rounded-md border border-indigo-100 dark:border-indigo-500/20">{step.currentSymbol}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
