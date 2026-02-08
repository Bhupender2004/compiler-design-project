/**
 * Predefined token patterns for lexical analysis
 */
export const PREDEFINED_PATTERNS = [
    {
        id: 1,
        name: "Identifier",
        category: "Tokens",
        regex: "(a|b|c|d|e|f|g|h|i|j|k|l|m|n|o|p|q|r|s|t|u|v|w|x|y|z)(a|b|c|d|e|f|g|h|i|j|k|l|m|n|o|p|q|r|s|t|u|v|w|x|y|z|0|1|2|3|4|5|6|7|8|9)*",
        description: "Variable names: starts with letter, followed by letters or digits",
        examples: ["abc", "variable", "x1", "test123"],
        rejects: ["123abc", "9var", "_test"]
    },
    {
        id: 2,
        name: "Integer",
        category: "Literals",
        regex: "(0|1|2|3|4|5|6|7|8|9)(0|1|2|3|4|5|6|7|8|9)*",
        description: "Whole numbers",
        examples: ["123", "0", "999", "42"],
        rejects: ["12.5", "abc", ""]
    },
    {
        id: 3,
        name: "Float",
        category: "Literals",
        regex: "(0|1|2|3|4|5|6|7|8|9)(0|1|2|3|4|5|6|7|8|9)*.(0|1|2|3|4|5|6|7|8|9)(0|1|2|3|4|5|6|7|8|9)*",
        description: "Decimal numbers",
        examples: ["3.14", "0.5", "123.456"],
        rejects: ["123", ".5", "12."]
    },
    {
        id: 4,
        name: "Keyword IF",
        category: "Keywords",
        regex: "if",
        description: "The 'if' keyword",
        examples: ["if"],
        rejects: ["IF", "iif", "i"]
    },
    {
        id: 5,
        name: "Keyword WHILE",
        category: "Keywords",
        regex: "while",
        description: "The 'while' keyword",
        examples: ["while"],
        rejects: ["While", "whil", "wwhile"]
    },
    {
        id: 6,
        name: "Simple Pattern",
        category: "Basic",
        regex: "(a|b)*",
        description: "Zero or more a's and b's",
        examples: ["", "a", "b", "ab", "aabb", "baba"],
        rejects: ["c", "abc", "1"]
    },
    {
        id: 7,
        name: "Binary String",
        category: "Basic",
        regex: "(0|1)*",
        description: "Binary strings",
        examples: ["", "0", "1", "01", "1010", "0000"],
        rejects: ["2", "a", "12"]
    }
];
