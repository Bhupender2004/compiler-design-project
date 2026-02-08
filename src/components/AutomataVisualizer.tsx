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

export function AutomataVisualizer({ automaton, activeStateIds = [] }: Props) {
    // Create a stable key based on automaton structure
    const automatonKey = useMemo(() => {
        return `${automaton.states.length}-${automaton.transitions.length}-${automaton.startStateId}`;
    }, [automaton.states.length, automaton.transitions.length, automaton.startStateId]);

    // Apply layout only when automaton structure changes
    const layoutedAutomaton = useMemo(() => {
        return layoutAutomaton(automaton, 800, 600);
    }, [automatonKey]);

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
            },
            style: { stroke: '#64748b' },
            labelStyle: { fill: '#0f172a', fontWeight: 700 },
            labelBgStyle: { fill: '#f1f5f9' },
        }));
    }, [layoutedAutomaton]);

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
                fitViewOptions={{ padding: 0.2 }}
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
