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
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                borderColor: 'rgb(59, 130, 246)',
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
            },
            title: {
                display: true,
                text: 'State & Transition Comparison',
            },
        },
    };

    return (
        <div className="h-full flex flex-col p-6 overflow-y-auto transition-colors">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200">Performance Comparison</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700 transition-colors">
                    <Bar options={options} data={data} />
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700 transition-colors">
                    <h3 className="font-semibold text-lg mb-4 text-gray-900 dark:text-gray-100">Metric Details</h3>
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Metric</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">NFA</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">DFA</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Minimized</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">States</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{metrics.nfa.stateCount}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{metrics.dfa.stateCount}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-600 dark:text-purple-400 font-bold">{metrics.minDfa.stateCount}</td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">Transitions</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{metrics.nfa.transitionCount}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{metrics.dfa.transitionCount}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{metrics.minDfa.transitionCount}</td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">Construction Time</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{metrics.nfa.constructionTimeMs.toFixed(2)} ms</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{metrics.dfa.constructionTimeMs.toFixed(2)} ms</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{metrics.minDfa.constructionTimeMs.toFixed(2)} ms</td>
                            </tr>
                        </tbody>
                    </table>

                    <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-md border border-yellow-200 dark:border-yellow-800/50">
                        <h4 className="font-semibold text-yellow-800 dark:text-yellow-500 mb-2">Analysis Analysis</h4>
                        <p className="text-sm text-yellow-700 dark:text-yellow-600/90">
                            The Minimized DFA has <strong className="text-yellow-800 dark:text-yellow-400">{Math.round((1 - metrics.minDfa.stateCount / metrics.nfa.stateCount) * 100)}%</strong> fewer states than the NFA
                            and <strong className="text-yellow-800 dark:text-yellow-400">{Math.round((1 - metrics.minDfa.stateCount / metrics.dfa.stateCount) * 100)}%</strong> fewer states than the initial DFA.
                        </p>
                    </div>
                </div>
            </div>

        </div>
    );
}
