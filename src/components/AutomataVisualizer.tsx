import { useMemo, useEffect, useCallback } from 'react';
import ReactFlow, {
    Background,
    Controls,
    MarkerType,
    useNodesState,
    useEdgesState,
} from 'reactflow';
import type { Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';
import type { Automaton } from '../types/automata';
import { layoutAutomaton } from '../utils/layout';

interface Props {
    automaton: Automaton;
    activeStateIds?: string[];
}

/**
 * Merge transitions that share the same source & target into a single edge
 * with a combined label like "a, b". This prevents overlapping parallel edges.
 */
function mergeParallelEdges(transitions: Automaton['transitions']): {
    source: string;
    target: string;
    symbols: string[];
    id: string;
}[] {
    const edgeMap = new Map<string, { source: string; target: string; symbols: string[]; id: string }>();

    for (const t of transitions) {
        const key = `${t.source}__${t.target}`;
        if (edgeMap.has(key)) {
            edgeMap.get(key)!.symbols.push(t.symbol);
        } else {
            edgeMap.set(key, {
                source: t.source,
                target: t.target,
                symbols: [t.symbol],
                id: `merged_${t.source}_${t.target}`,
            });
        }
    }

    return Array.from(edgeMap.values());
}

export function AutomataVisualizer({ automaton, activeStateIds = [] }: Props) {
    // Create a stable key based on automaton structure
    const automatonKey = useMemo(() => {
        return `${automaton.states.length}-${automaton.transitions.length}-${automaton.startStateId}`;
    }, [automaton.states.length, automaton.transitions.length, automaton.startStateId]);

    // Apply layout only when automaton structure changes
    const layoutedAutomaton = useMemo(() => {
        return layoutAutomaton(automaton, 800, 600);
    }, [automatonKey]);

    // Build layer map for detecting back-edges
    const layerMap = useMemo(() => {
        const map = new Map<string, number>();
        for (const s of layoutedAutomaton.states) {
            map.set(s.id, s.x || 0);
        }
        return map;
    }, [layoutedAutomaton]);

    // Build initial nodes
    const buildNodes = useCallback((): Node[] => {
        return layoutedAutomaton.states.map((state) => {
            const isActive = activeStateIds.includes(state.id);
            return {
                id: state.id,
                position: { x: state.x || 0, y: state.y || 0 },
                data: { label: state.label || state.id },
                style: {
                    background: isActive
                        ? '#6366f1' // Indigo 500 for active
                        : state.isStart
                            ? '#ecfdf5' // Emerald 50 for start
                            : '#ffffff',
                    color: isActive ? '#ffffff' : '#0f172a',
                    border: `2px solid ${isActive ? '#4338ca' :
                        state.isAccept ? '#10b981' : '#e2e8f0'
                        }`,
                    borderRadius: '50%',
                    width: 45,
                    height: 45,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: '700',
                    boxShadow: state.isAccept ? '0 0 0 3px white, 0 0 0 5px #10b981' : '0 1px 2px rgba(0,0,0,0.05)',
                    cursor: 'grab',
                },
                type: 'default',
            };
        });
    }, [layoutedAutomaton, activeStateIds]);

    // Build edges with merged parallels, self-loop handling, and back-edge routing
    const buildEdges = useCallback((): Edge[] => {
        const merged = mergeParallelEdges(layoutedAutomaton.transitions);
        const edges: Edge[] = [];

        // Track how many edges exist between each unordered pair for offset calculation
        const pairCount = new Map<string, number>();
        const pairIndex = new Map<string, number>();
        for (const m of merged) {
            if (m.source === m.target) continue; // skip self-loops from pair counting
            const pairKey = [m.source, m.target].sort().join('__');
            pairCount.set(pairKey, (pairCount.get(pairKey) || 0) + 1);
        }

        for (const m of merged) {
            const label = m.symbols.join(', ');
            const isSelfLoop = m.source === m.target;

            if (isSelfLoop) {
                edges.push({
                    id: m.id,
                    source: m.source,
                    target: m.target,
                    label,
                    type: 'default',
                    markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16, color: '#6366f1' },
                    style: { stroke: '#6366f1', strokeWidth: 2, opacity: 0.8 },
                    labelStyle: { fill: '#4338ca', fontWeight: 700, fontSize: '10px', fontFamily: 'JetBrains Mono' },
                    labelBgStyle: { fill: '#ffffff', fillOpacity: 0.9, stroke: '#e0e7ff', strokeWidth: 1 },
                    labelBgPadding: [4, 2] as [number, number],
                    labelBgBorderRadius: 4,
                });
                continue;
            }

            const sourceX = layerMap.get(m.source) || 0;
            const targetX = layerMap.get(m.target) || 0;
            const isBackEdge = targetX < sourceX;
            const pairKey = [m.source, m.target].sort().join('__');
            const totalInPair = pairCount.get(pairKey) || 1;
            const currentIndex = pairIndex.get(pairKey) || 0;
            pairIndex.set(pairKey, currentIndex + 1);

            const edgeConfig: Partial<Edge> = {
                id: m.id,
                source: m.source,
                target: m.target,
                label,
                markerEnd: { type: MarkerType.ArrowClosed, width: 14, height: 14, color: '#94a3b8' },
                style: { stroke: '#94a3b8', strokeWidth: 1.5, opacity: 0.7 },
                labelStyle: { fill: '#334155', fontWeight: 700, fontSize: '10px', fontFamily: 'JetBrains Mono' },
                labelBgStyle: { fill: '#ffffff', fillOpacity: 0.9, stroke: '#f1f5f9', strokeWidth: 1 },
                labelBgPadding: [4, 2] as [number, number],
                labelBgBorderRadius: 4,
            };

            if (isBackEdge) {
                edges.push({ ...edgeConfig, type: 'default' } as Edge);
            } else if (totalInPair > 1) {
                edges.push({ ...edgeConfig, type: currentIndex === 0 ? 'smoothstep' : 'default' } as Edge);
            } else {
                edges.push({ ...edgeConfig, type: 'default' } as Edge);
            }
        }

        return edges;
    }, [layoutedAutomaton, layerMap]);

    // Use ReactFlow's state management for draggable nodes
    const [nodes, setNodes, onNodesChange] = useNodesState(buildNodes());
    const [edges, setEdges, onEdgesChange] = useEdgesState(buildEdges());

    // Update nodes when automaton changes or active states change
    useEffect(() => {
        setNodes((currentNodes) => {
            if (currentNodes.length !== layoutedAutomaton.states.length) {
                return buildNodes();
            }
            return currentNodes.map((node) => {
                const state = layoutedAutomaton.states.find(s => s.id === node.id);
                if (!state) return node;
                const isActive = activeStateIds.includes(state.id);
                return {
                    ...node,
                    data: { label: state.label || state.id },
                    style: {
                        ...node.style,
                        background: isActive
                            ? '#6366f1'
                            : state.isStart
                                ? '#ecfdf5'
                                : '#ffffff',
                        color: isActive ? '#ffffff' : '#0f172a',
                        border: `2px solid ${isActive ? '#4338ca' :
                            state.isAccept ? '#10b981' : '#e2e8f0'
                            }`,
                        boxShadow: state.isAccept ? '0 0 0 3px white, 0 0 0 5px #10b981' : '0 1px 2px rgba(0,0,0,0.05)',
                    },
                };
            });
        });
    }, [activeStateIds, layoutedAutomaton, setNodes, buildNodes]);

    // Update edges when automaton structure changes
    useEffect(() => {
        setEdges(buildEdges());
    }, [automatonKey, setEdges, buildEdges]);

    return (
        <div className="w-full h-full min-h-[400px]">
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
            >
                <Background color="#f1f5f9" gap={20} />
                <Controls showInteractive={false} className="dark:bg-zinc-900 dark:border-zinc-800" />
            </ReactFlow>
        </div>
    );
}
