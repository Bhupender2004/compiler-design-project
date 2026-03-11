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
        return layoutedAutomaton.states.map((state) => ({
            id: state.id,
            position: { x: state.x || 0, y: state.y || 0 },
            data: { label: state.label || state.id },
            style: {
                background: activeStateIds.includes(state.id)
                    ? '#fb923c' // Orange for active
                    : state.isStart
                        ? '#f0fdf4' // Light green for start
                        : '#fff',
                border: `2px solid ${activeStateIds.includes(state.id) ? '#ea580c' :
                    state.isAccept ? '#fbbf24' : '#94a3b8'
                    }`,
                borderRadius: '50%',
                width: 50,
                height: 50,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 'bold',
                boxShadow: state.isAccept ? '0 0 0 4px white, 0 0 0 6px #fbbf24' : 'none',
                cursor: 'grab',
            },
            type: 'default',
        }));
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
                // Self-loop: use default bezier type for a clean loop arc
                edges.push({
                    id: m.id,
                    source: m.source,
                    target: m.target,
                    label,
                    type: 'default',
                    markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
                    style: { stroke: '#8b5cf6', strokeWidth: 1.5 },
                    labelStyle: { fill: '#5b21b6', fontWeight: 700, fontSize: '11px' },
                    labelBgStyle: { fill: '#f5f3ff', stroke: '#c4b5fd', strokeWidth: 0.5 },
                    labelBgPadding: [4, 3] as [number, number],
                });
                continue;
            }

            // Detect back-edges (target is to the left of source)
            const sourceX = layerMap.get(m.source) || 0;
            const targetX = layerMap.get(m.target) || 0;
            const isBackEdge = targetX < sourceX;

            // Detect bidirectional edges (A→B and B→A both exist)
            const pairKey = [m.source, m.target].sort().join('__');
            const totalInPair = pairCount.get(pairKey) || 1;
            const currentIndex = pairIndex.get(pairKey) || 0;
            pairIndex.set(pairKey, currentIndex + 1);

            if (isBackEdge) {
                // Back-edge: use bezier curve for cleaner routing
                edges.push({
                    id: m.id,
                    source: m.source,
                    target: m.target,
                    label,
                    type: 'default', // bezier curve for smooth routing
                    markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
                    style: { stroke: '#64748b', strokeWidth: 1.5 },
                    labelStyle: { fill: '#0f172a', fontWeight: 700, fontSize: '11px' },
                    labelBgStyle: { fill: '#f1f5f9', stroke: '#cbd5e1', strokeWidth: 0.5 },
                    labelBgPadding: [4, 3] as [number, number],
                });
            } else if (totalInPair > 1) {
                // Bidirectional: use different edge types for visual offset
                const edgeType = currentIndex === 0 ? 'smoothstep' : 'default';
                edges.push({
                    id: m.id,
                    source: m.source,
                    target: m.target,
                    label,
                    type: edgeType,
                    markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
                    style: { stroke: '#64748b', strokeWidth: 1.5 },
                    labelStyle: { fill: '#0f172a', fontWeight: 700, fontSize: '11px' },
                    labelBgStyle: { fill: '#f1f5f9', stroke: '#cbd5e1', strokeWidth: 0.5 },
                    labelBgPadding: [4, 3] as [number, number],
                });
            } else {
                // Normal forward edge
                edges.push({
                    id: m.id,
                    source: m.source,
                    target: m.target,
                    label,
                    type: 'default',
                    markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
                    style: { stroke: '#64748b', strokeWidth: 1.5 },
                    labelStyle: { fill: '#0f172a', fontWeight: 700, fontSize: '11px' },
                    labelBgStyle: { fill: '#f1f5f9', stroke: '#cbd5e1', strokeWidth: 0.5 },
                    labelBgPadding: [4, 3] as [number, number],
                });
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
            // If structure changed, rebuild completely
            if (currentNodes.length !== layoutedAutomaton.states.length) {
                return buildNodes();
            }
            // Otherwise just update styles (keep positions user may have dragged)
            return currentNodes.map((node) => {
                const state = layoutedAutomaton.states.find(s => s.id === node.id);
                if (!state) return node;
                return {
                    ...node,
                    data: { label: state.label || state.id },
                    style: {
                        ...node.style,
                        background: activeStateIds.includes(state.id)
                            ? '#fb923c'
                            : state.isStart
                                ? '#f0fdf4'
                                : '#fff',
                        border: `2px solid ${activeStateIds.includes(state.id) ? '#ea580c' :
                            state.isAccept ? '#fbbf24' : '#94a3b8'
                            }`,
                        boxShadow: state.isAccept ? '0 0 0 4px white, 0 0 0 6px #fbbf24' : 'none',
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
                <Background />
                <Controls />
            </ReactFlow>
        </div>
    );
}
