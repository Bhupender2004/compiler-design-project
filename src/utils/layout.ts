import type { Automaton, State } from '../types/automata';

/**
 * Improved automata layout algorithm.
 * Uses BFS layering with barycenter ordering to minimize edge crossings,
 * and wider spacing to prevent edge overlap.
 */
export function layoutAutomaton(automaton: Automaton, _width: number, _height: number): Automaton {
    const { states, transitions, startStateId } = automaton;

    if (states.length === 0) {
        return automaton;
    }

    // ── Step 1: Build adjacency lists ──
    const outEdges = new Map<string, string[]>();
    const inEdges = new Map<string, string[]>();
    for (const s of states) {
        outEdges.set(s.id, []);
        inEdges.set(s.id, []);
    }
    for (const t of transitions) {
        if (t.source !== t.target) { // skip self-loops for layering
            outEdges.get(t.source)?.push(t.target);
            inEdges.get(t.target)?.push(t.source);
        }
    }

    // ── Step 2: BFS layering from start state ──
    const layers = new Map<string, number>();
    const queue: { id: string; layer: number }[] = [{ id: startStateId, layer: 0 }];
    const visited = new Set<string>();
    visited.add(startStateId);
    layers.set(startStateId, 0);

    while (queue.length > 0) {
        const { id, layer } = queue.shift()!;
        const neighbors = outEdges.get(id) || [];
        for (const target of neighbors) {
            if (!visited.has(target)) {
                visited.add(target);
                layers.set(target, layer + 1);
                queue.push({ id: target, layer: layer + 1 });
            }
        }
    }

    // Handle disconnected states — place them in layer 0
    for (const state of states) {
        if (!visited.has(state.id)) {
            layers.set(state.id, 0);
        }
    }

    // ── Step 3: Group states by layer ──
    const layerGroups = new Map<number, State[]>();
    let maxLayer = 0;
    for (const state of states) {
        const l = layers.get(state.id) || 0;
        maxLayer = Math.max(maxLayer, l);
        if (!layerGroups.has(l)) layerGroups.set(l, []);
        layerGroups.get(l)!.push(state);
    }

    // ── Step 4: Barycenter ordering to reduce edge crossings ──
    // For each layer (except layer 0), order nodes by the average position
    // of their neighbors in the previous layer.
    // Run multiple passes for better results.
    for (let pass = 0; pass < 4; pass++) {
        for (let l = 1; l <= maxLayer; l++) {
            const nodesInLayer = layerGroups.get(l);
            if (!nodesInLayer || nodesInLayer.length <= 1) continue;

            const prevLayer = layerGroups.get(l - 1) || [];
            const prevPositions = new Map<string, number>();
            prevLayer.forEach((s, idx) => prevPositions.set(s.id, idx));

            // Compute barycenter for each node
            const barycenters = nodesInLayer.map(state => {
                const predecessors = (inEdges.get(state.id) || []).filter(id => {
                    return layers.get(id) === l - 1;
                });
                if (predecessors.length === 0) return { state, bc: Infinity };
                const sum = predecessors.reduce((acc, id) => acc + (prevPositions.get(id) || 0), 0);
                return { state, bc: sum / predecessors.length };
            });

            barycenters.sort((a, b) => a.bc - b.bc);
            layerGroups.set(l, barycenters.map(b => b.state));
        }
    }

    // ── Step 5: Position calculation with generous spacing ──
    const rankSep = 220;  // Horizontal distance between layers
    const nodeSep = 160;  // Vertical distance between nodes in same layer
    const startX = 80;
    const startY = 80;

    // Find the tallest layer for vertical centering
    let maxLayerSize = 0;
    for (let l = 0; l <= maxLayer; l++) {
        const count = (layerGroups.get(l) || []).length;
        maxLayerSize = Math.max(maxLayerSize, count);
    }

    const newStates = states.map(state => {
        const l = layers.get(state.id) || 0;
        const nodesInLayer = layerGroups.get(l)!;
        const indexInLayer = nodesInLayer.indexOf(state);
        const layerSize = nodesInLayer.length;

        // Center this layer vertically relative to available height
        const totalLayerHeight = (layerSize - 1) * nodeSep;
        const maxTotalHeight = (maxLayerSize - 1) * nodeSep;
        const yOffset = startY + (maxTotalHeight - totalLayerHeight) / 2;

        return {
            ...state,
            label: state.id,
            x: startX + l * rankSep,
            y: yOffset + indexInLayer * nodeSep,
        };
    });

    return {
        ...automaton,
        states: newStates,
    };
}
