/**
 * Simple in-memory cache for computed automata
 */
const cache = new Map();

export function getFromCache(key) {
    return cache.get(key);
}

export function setInCache(key, value) {
    // Limit cache size to prevent memory issues
    if (cache.size > 100) {
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
    }
    cache.set(key, value);
}

export function clearCache() {
    cache.clear();
}
