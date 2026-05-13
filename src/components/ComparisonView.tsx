import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import type { AllMetrics } from '../hooks/useAutomata';
import { Activity } from 'lucide-react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface Props {
    metrics: AllMetrics;
}

export function ComparisonView({ metrics }: Props) {
    const data = {
        labels: ['NFA', 'DFA', 'Minimized DFA'],
        datasets: [
            {
                label: 'State Count',
                data: [metrics.nfa.stateCount, metrics.dfa.stateCount, metrics.minDfa.stateCount],
                backgroundColor: 'rgba(99, 102, 241, 0.5)',
                borderColor: 'rgb(99, 102, 241)',
                borderWidth: 1,
            },
            {
                label: 'Transition Count',
                data: [metrics.nfa.transitionCount, metrics.dfa.transitionCount, metrics.minDfa.transitionCount],
                backgroundColor: 'rgba(16, 185, 129, 0.5)',
                borderColor: 'rgb(16, 185, 129)',
                borderWidth: 1,
            }
        ]
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    font: {
                        family: 'Inter',
                        weight: '600'
                    }
                }
            },
            title: {
                display: false
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    display: false
                }
            },
            x: {
                grid: {
                    display: false
                }
            }
        }
    };

    return (
        <div className="h-full flex flex-col p-8 overflow-y-auto custom-scrollbar transition-colors">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-zinc-100 tracking-tight">Performance Comparison</h2>
                <p className="text-sm text-slate-500 dark:text-zinc-500 mt-1">Benchmarking state and transition efficiency across automata types.</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
                <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800 transition-all">
                    <Bar options={options} data={data} />
                </div>

                <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800 transition-all flex flex-col">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 mb-6 uppercase tracking-wider opacity-70">Metric Details</h3>
                    <div className="overflow-hidden rounded-xl border border-slate-100 dark:border-zinc-900">
                        <table className="min-w-full divide-y divide-slate-200 dark:divide-zinc-800">
                            <thead className="bg-slate-50 dark:bg-zinc-900/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest">Metric</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest">NFA</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest">DFA</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest">Minimized</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-zinc-950 divide-y divide-slate-200 dark:divide-zinc-800">
                                <tr>
                                    <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-slate-900 dark:text-zinc-200">States</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-600 dark:text-zinc-400 font-mono">{metrics.nfa.stateCount}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-600 dark:text-zinc-400 font-mono">{metrics.dfa.stateCount}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-xs text-indigo-600 dark:text-indigo-400 font-bold font-mono">{metrics.minDfa.stateCount}</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-slate-900 dark:text-zinc-200">Transitions</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-600 dark:text-zinc-400 font-mono">{metrics.nfa.transitionCount}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-600 dark:text-zinc-400 font-mono">{metrics.dfa.transitionCount}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-xs text-emerald-600 dark:text-emerald-400 font-bold font-mono">{metrics.minDfa.transitionCount}</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-slate-900 dark:text-zinc-200">Construction</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-600 dark:text-zinc-400 font-mono">{metrics.nfa.constructionTimeMs.toFixed(2)}ms</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-600 dark:text-zinc-400 font-mono">{metrics.dfa.constructionTimeMs.toFixed(2)}ms</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-600 dark:text-zinc-400 font-mono">{metrics.minDfa.constructionTimeMs.toFixed(2)}ms</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-auto pt-8">
                        <div className="p-5 bg-indigo-50/50 dark:bg-indigo-500/5 rounded-2xl border border-indigo-100/50 dark:border-indigo-500/10">
                            <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-300 mb-2 uppercase tracking-tight flex items-center gap-2">
                                <Activity className="w-3.5 h-3.5" />
                                Optimization Summary
                            </h4>
                            <p className="text-sm text-indigo-900/70 dark:text-indigo-400/80 leading-relaxed">
                                The Minimized DFA achieves a <strong className="text-indigo-900 dark:text-indigo-300 font-black">{Math.round((1 - metrics.minDfa.stateCount / metrics.nfa.stateCount) * 100)}%</strong> reduction in states compared to the NFA, 
                                maximizing processing efficiency for large datasets.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
