/**
 * Express Server Entry Point
 * DFA vs NFA Performance Analyzer API
 */
import express from 'express';
import cors from 'cors';
import apiRoutes from './routes/api.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// API Routes
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        name: 'DFA vs NFA Performance Analyzer API',
        version: '1.0.0',
        endpoints: [
            'GET  /api/predefined-patterns',
            'POST /api/regex-to-nfa',
            'POST /api/nfa-to-dfa',
            'POST /api/minimize-dfa',
            'POST /api/simulate-nfa',
            'POST /api/simulate-dfa',
            'POST /api/compare-performance',
            'POST /api/full-analysis',
        ],
    });
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════╗
║     DFA vs NFA Performance Analyzer API               ║
║     Server running on http://localhost:${PORT}           ║
╚═══════════════════════════════════════════════════════╝
  `);
});
