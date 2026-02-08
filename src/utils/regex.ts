// Basic Regex Parser and helper functions

// Operator precedence
const precedence: Record<string, number> = {
    '*': 3,
    '+': 3,
    '?': 3,
    '.': 2, // Concatenation (explicit or implicit)
    '|': 1,
    '(': 0,
    ')': 0,
};

export const EPSILON = 'ε';

/**
 * Inserts explicit concatenation operators '.' where needed.
 * E.g., "ab" -> "a.b", "(a|b)c" -> "(a|b).c", "a*" -> "a*"
 */
export function insertExplicitConcat(regex: string): string {
    let output = '';
    for (let i = 0; i < regex.length; i++) {
        const c = regex[i];
        output += c;

        if (i + 1 < regex.length) {
            const next = regex[i + 1];
            // Insert '.' if:
            // 1. Current is literal/)*, next is literal/(
            // Specific logic:
            // After a literal, *, +, ?, or )
            // Before a literal or (
            if (
                (c.match(/[a-zA-Z0-9]/) || ['*', '+', '?', ')'].includes(c)) &&
                (next.match(/[a-zA-Z0-9]/) || next === '(')
            ) {
                output += '.';
            }
        }
    }
    return output;
}

/**
 * Converts infix regex to postfix notation (RPN) using Shunting-yard algorithm.
 */
export function toPostfix(regex: string): string {
    const formattedRegex = insertExplicitConcat(regex);
    let output: string = '';
    const stack: string[] = [];

    for (const c of formattedRegex) {
        if (c.match(/[a-zA-Z0-9]/) || c === EPSILON) {
            output += c;
        } else if (c === '(') {
            stack.push(c);
        } else if (c === ')') {
            while (stack.length > 0 && stack[stack.length - 1] !== '(') {
                output += stack.pop()!;
            }
            stack.pop(); // Pop '('
        } else {
            // Operator
            while (
                stack.length > 0 &&
                precedence[stack[stack.length - 1]] >= precedence[c]
            ) {
                output += stack.pop()!;
            }
            stack.push(c);
        }
    }

    while (stack.length > 0) {
        output += stack.pop()!;
    }

    return output;
}
