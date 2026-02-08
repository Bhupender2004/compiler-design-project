# 🔄 DFA vs NFA Performance Analyzer

A comprehensive web application for visualizing and comparing Deterministic Finite Automata (DFA) and Non-deterministic Finite Automata (NFA) performance in lexical analysis.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)
![React](https://img.shields.io/badge/react-18.3.1-61dafb.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.6.2-3178c6.svg)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Algorithms](#algorithms)
- [Project Structure](#project-structure)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

This project demonstrates the fundamental concepts of automata theory used in compiler design, specifically in the lexical analysis phase. It provides:

- **Visual comparison** between NFA and DFA representations
- **Step-by-step simulation** of string recognition
- **Performance metrics** for construction and processing times
- **Interactive diagrams** with drag-and-drop support

### Why This Matters

In compiler design, regular expressions are converted to finite automata for pattern matching. While NFAs are easier to construct from regex, DFAs provide O(n) guaranteed performance for string matching. This tool visually demonstrates this tradeoff.

## ✨ Features

### Frontend
- 📊 **Interactive Visualization** - Drag nodes, zoom, pan with React Flow
- 🔄 **Live Simulation** - Step-by-step or auto-play string processing
- 📈 **Performance Comparison** - Charts comparing NFA, DFA, and Minimized DFA
- 🖥️ **Fullscreen Mode** - Expand diagrams for detailed viewing
- 🎨 **Modern UI** - Clean, responsive design with Tailwind CSS
- 🌐 **API Status Indicator** - Shows backend connectivity

### Backend
- 🔧 **RESTful API** - 8 endpoints for automata operations
- ⚡ **In-Memory Caching** - Cached results for repeated patterns
- 📡 **CORS Enabled** - Frontend-backend communication ready
- 🚀 **No Database** - Lightweight, stateless design

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI Framework |
| TypeScript | Type Safety |
| Vite | Build Tool |
| React Flow | Diagram Visualization |
| Chart.js | Performance Charts |
| Tailwind CSS | Styling |
| Lucide React | Icons |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime |
| Express.js | Web Framework |
| ES Modules | Modern JavaScript |

## 📦 Installation

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Clone Repository
```bash
git clone https://github.com/yourusername/dfa-nfa-analyzer.git
cd dfa-nfa-analyzer
```

### Install Dependencies

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
cd server
npm install
```

## 🚀 Usage

### Development Mode

**Terminal 1 - Start Backend:**
```bash
cd server
npm start
# Server runs at http://localhost:3001
```

**Terminal 2 - Start Frontend:**
```bash
npm run dev
# App runs at http://localhost:5173
```

### Production Build
```bash
npm run build
# Output in dist/ folder
```

### Preview Production Build
```bash
npx serve dist
```

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/predefined-patterns` | Get list of predefined regex patterns |
| POST | `/api/regex-to-nfa` | Convert regex to NFA (Thompson's algorithm) |
| POST | `/api/nfa-to-dfa` | Convert NFA to DFA (Subset construction) |
| POST | `/api/minimize-dfa` | Minimize DFA (Partition refinement) |
| POST | `/api/simulate-nfa` | Simulate NFA on input string |
| POST | `/api/simulate-dfa` | Simulate DFA on input string |
| POST | `/api/compare-performance` | Compare all automata performance |
| POST | `/api/full-analysis` | Complete pipeline in one call |

### Example Request
```bash
curl -X POST http://localhost:3001/api/regex-to-nfa \
  -H "Content-Type: application/json" \
  -d '{"pattern": "(a|b)*"}'
```

## 🧮 Algorithms

### Thompson's Construction
Converts regular expressions to NFA using structural induction. Each regex operator creates NFA fragments connected with ε-transitions.

### Subset Construction (Powerset)
Converts NFA to equivalent DFA by treating each DFA state as a set of NFA states. Eliminates non-determinism.

### Partition Refinement (Hopcroft-like)
Minimizes DFA by merging equivalent states. Produces the unique minimal DFA for the language.

## 📁 Project Structure

```
dfa-nfa-analyzer/
├── src/                          # Frontend source
│   ├── components/               # React components
│   │   ├── AutomataVisualizer.tsx
│   │   ├── ComparisonView.tsx
│   │   ├── FullscreenDiagram.tsx
│   │   ├── InputPanel.tsx
│   │   └── ResultsPanel.tsx
│   ├── hooks/                    # Custom React hooks
│   │   └── useAutomata.ts
│   ├── services/                 # API client
│   │   └── api.ts
│   ├── types/                    # TypeScript interfaces
│   │   └── automata.ts
│   ├── utils/                    # Utility functions
│   │   ├── dfa.ts
│   │   ├── nfa.ts
│   │   ├── minimization.ts
│   │   ├── regex.ts
│   │   └── layout.ts
│   ├── App.tsx                   # Main application
│   └── main.tsx                  # Entry point
│
├── server/                       # Backend source
│   └── src/
│       ├── routes/
│       │   └── api.js            # API route handlers
│       ├── services/             # Core algorithms
│       │   ├── regex.js
│       │   ├── nfa.js
│       │   ├── dfa.js
│       │   ├── minimization.js
│       │   └── simulation.js
│       ├── data/
│       │   └── patterns.js       # Predefined patterns
│       ├── utils/
│       │   └── cache.js          # In-memory cache
│       └── index.js              # Server entry
│
├── dist/                         # Production build
├── package.json
├── tsconfig.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🎓 Educational Value

This project is ideal for:
- **Compiler Design courses** - Visual demonstration of lexical analysis concepts
- **Automata Theory** - Understanding NFA/DFA equivalence
- **Algorithm visualization** - Seeing algorithms in action
- **Full-stack development** - Learning React + Node.js integration

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React Flow](https://reactflow.dev/) for the diagram visualization library
- [Chart.js](https://www.chartjs.org/) for performance charts
- [Tailwind CSS](https://tailwindcss.com/) for styling utilities

---

**Made with ❤️ for Compiler Design enthusiasts**
