/**
 * Regex parsing utilities
 * Converts infix regex to postfix notation using Shunting-yard algorithm
 */

export const EPSILON = 'ε';

// Operator precedence
const precedence = {
    '*': 3,
    '+': 3,
    '?': 3,
    '.': 2, // Concatenation
    '|': 1,
    '(': 0,
    ')': 0,
};

/**
 * Inserts explicit concatenation operators '.' where needed.
 * E.g., "ab" -> "a.b", "(a|b)c" -> "(a|b).c"
 */
export function insertExplicitConcat(regex) {
    let output = '';
    for (let i = 0; i < regex.length; i++) {
        const c = regex[i];
        output += c;

        if (i + 1 < regex.length) {
            const next = regex[i + 1];
            // Insert '.' if:
            // After a literal, *, +, ?, or )
            // Before a literal or (
            const isOperand = (ch) => /[a-zA-Z0-9]/.test(ch);
            const isClosing = (ch) => ['*', '+', '?', ')'].includes(ch);
            const isOpening = (ch) => ch === '(' || isOperand(ch);

            if ((isOperand(c) || isClosing(c)) && isOpening(next)) {
                output += '.';
            }
        }
    }
    return output;
}

/**
 * Converts infix regex to postfix notation (RPN) using Shunting-yard algorithm.
 */
export function toPostfix(regex) {
    const formattedRegex = insertExplicitConcat(regex);
    let output = '';
    const stack = [];

    for (const c of formattedRegex) {
        if (/[a-zA-Z0-9]/.test(c) || c === EPSILON) {
            output += c;
        } else if (c === '(') {
            stack.push(c);
        } else if (c === ')') {
            while (stack.length > 0 && stack[stack.length - 1] !== '(') {
                output += stack.pop();
            }
            stack.pop(); // Pop '('
        } else {
            // Operator
            while (
                stack.length > 0 &&
                precedence[stack[stack.length - 1]] >= precedence[c]
            ) {
                output += stack.pop();
            }
            stack.push(c);
        }
    }

    while (stack.length > 0) {
        output += stack.pop();
    }

    return output;
}
