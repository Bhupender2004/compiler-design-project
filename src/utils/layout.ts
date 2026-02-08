import type { Automaton, State } from '../types/automata';

export function layoutAutomaton(automaton: Automaton, _width: number, height: number): Automaton {
    const { states, transitions, startStateId } = automaton;

    // Simple BFS Layering
    const layers = new Map<string, number>();
    const queue: { id: string; layer: number }[] = [{ id: startStateId, layer: 0 }];
    const visited = new Set<string>();
    visited.add(startStateId);
    layers.set(startStateId, 0);

    let maxLayer = 0;

    while (queue.length > 0) {
        const { id, layer } = queue.shift()!;
        maxLayer = Math.max(maxLayer, layer);

        const outTransitions = transitions.filter(t => t.source === id);
        for (const t of outTransitions) {
            if (!visited.has(t.target)) {
                visited.add(t.target);
                layers.set(t.target, layer + 1);
                queue.push({ id: t.target, layer: layer + 1 });
            }
        }
    }

    // Handle disconnected components
    states.forEach(state => {
        if (!visited.has(state.id)) {
            layers.set(state.id, 0);
        }
    });

    // Group by layer
    const layerGroups = new Map<number, State[]>();
    states.forEach(state => {
        const l = layers.get(state.id) || 0;
        if (!layerGroups.has(l)) layerGroups.set(l, []);
        layerGroups.get(l)!.push(state);
    });

    // INCREASED SPACING for cleaner layout
    const rankSep = 200; // Horizontal separation between layers
    const nodeSep = 150; // Vertical separation between nodes in same layer
    const startX = 100;  // Left margin
    const startY = 100;  // Top margin

    // Calculate positions
    const newStates = states.map(state => {
        const l = layers.get(state.id) || 0;
        const nodesInLayer = layerGroups.get(l)!;
        const indexInLayer = nodesInLayer.indexOf(state);
        const layerSize = nodesInLayer.length;

        // Center vertically based on layer size
        const totalLayerHeight = (layerSize - 1) * nodeSep;
        const yOffset = Math.max(startY, (height - totalLayerHeight) / 2);

        // Always use clean state ID as label (q0, q1 for NFA, D0, D1 for DFA, M0, M1 for MinDFA)
        // This is cleaner than showing set notation like {0,1,2}
        const shortLabel = state.id;

        return {
            ...state,
            label: shortLabel,
            x: startX + l * rankSep,
            y: yOffset + indexInLayer * nodeSep,
        };
    });

    return {
        ...automaton,
        states: newStates,
    };
}

