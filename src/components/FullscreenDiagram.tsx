import { useEffect, useMemo, useCallback } from 'react';
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    MarkerType,
    useNodesState,
    useEdgesState,
} from 'reactflow';
import type { Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';
import type { Automaton } from '../types/automata';
import { layoutAutomaton } from '../utils/layout';
import { X, Maximize2 } from 'lucide-react';

interface Props {
    automaton: Automaton;
    title: string;
    onClose: () => void;
}

export function FullscreenDiagram({ automaton, title, onClose }: Props) {
    // Apply layout with larger dimensions for fullscreen
    const layoutedAutomaton = useMemo(() => {
        return layoutAutomaton(automaton, 1600, 900);
    }, [automaton]);

    // Build nodes
    const buildNodes = useCallback((): Node[] => {
        return layoutedAutomaton.states.map((state) => ({
            id: state.id,
            position: { x: state.x || 0, y: state.y || 0 },
            data: { label: state.label || state.id },
            style: {
                background: state.isStart ? '#f0fdf4' : '#fff',
                border: `3px solid ${state.isAccept ? '#fbbf24' : '#64748b'}`,
                borderRadius: '50%',
                width: 70,
                height: 70,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: 'bold',
                boxShadow: state.isAccept ? '0 0 0 5px white, 0 0 0 8px #fbbf24' : '0 4px 6px rgba(0,0,0,0.1)',
                cursor: 'grab',
            },
            type: 'default',
        }));
    }, [layoutedAutomaton]);

    // Build edges
    const buildEdges = useCallback((): Edge[] => {
        return layoutedAutomaton.transitions.map((t) => ({
            id: t.id,
            source: t.source,
            target: t.target,
            label: t.symbol,
            type: 'smoothstep',
            markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 20,
                height: 20,
            },
            style: { stroke: '#64748b', strokeWidth: 2 },
            labelStyle: { fill: '#0f172a', fontWeight: 700, fontSize: 14 },
            labelBgStyle: { fill: '#f1f5f9' },
            labelBgPadding: [8, 4] as [number, number],
        }));
    }, [layoutedAutomaton]);

    const [nodes, , onNodesChange] = useNodesState(buildNodes());
    const [edges, , onEdgesChange] = useEdgesState(buildEdges());

    // Handle escape key to close
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-50 bg-white">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-between px-6 z-10 shadow-lg">
                <div className="flex items-center gap-3">
                    <Maximize2 className="w-5 h-5 text-white" />
                    <h1 className="text-lg font-bold text-white">{title}</h1>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-white/80 text-sm">
                        {automaton.states.length} states · {automaton.transitions.length} transitions
                    </span>
                    <button
                        onClick={onClose}
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all"
                    >
                        <X className="w-4 h-4" />
                        Close (ESC)
                    </button>
                </div>
            </div>

            {/* Diagram */}
            <div className="absolute top-14 left-0 right-0 bottom-0">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    fitView
                    fitViewOptions={{ padding: 0.3 }}
                    nodesDraggable={true}
                    nodesConnectable={false}
                    elementsSelectable={true}
                    minZoom={0.1}
                    maxZoom={4}
                >
                    <Background color="#e2e8f0" gap={20} />
                    <Controls />
                    <MiniMap
                        nodeColor={(node) => {
                            const state = automaton.states.find(s => s.id === node.id);
                            return state?.isAccept ? '#fbbf24' : state?.isStart ? '#86efac' : '#94a3b8';
                        }}
                        maskColor="rgba(0,0,0,0.1)"
                    />
                </ReactFlow>
            </div>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-gray-200 z-10">
                <h3 className="text-sm font-semibold mb-2 text-gray-700">Legend</h3>
                <div className="flex flex-col gap-2 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-green-100 border-2 border-gray-400"></div>
                        <span>Start State</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-white border-2 border-yellow-400" style={{ boxShadow: '0 0 0 2px white, 0 0 0 4px #fbbf24' }}></div>
                        <span>Accept State</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-white border-2 border-gray-400"></div>
                        <span>Regular State</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
