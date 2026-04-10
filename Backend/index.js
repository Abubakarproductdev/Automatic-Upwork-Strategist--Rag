const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env'), quiet: true });

const cors = require('cors');
const colors = require('colors'); // For styled console logs
const { createRateLimiter } = require('./middleware/security');
const proposalRoutes = require('./routes/proposalRoutes');
const connectDB = require('./Config/dbConfig');
const portfolioRoutes = require('./routes/portfolioRoutes'); // <-- ADD THIS LINE
const aiRoutes = require('./routes/aiRoutes'); // <-- ADD THIS LINE

// Load environment variables from .env file

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
const aiLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 20,
    message: 'Too many AI generation requests. Please wait a moment and try again.',
});

// --- Middleware ---
app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error('CORS origin not allowed.'));
    },
}));

// 2. Body Parser
// This allows the server to accept and parse JSON data in the body of requests.
// Without this, `req.body` would be undefined.
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false, limit: '100kb' }));


// --- API Routes ---

// Mount the proposal routes.
// This tells Express that for any request starting with '/api/proposals',
// it should use the 'proposalRoutes' router we defined earlier.
app.use('/api/proposals', proposalRoutes);
app.use('/api/portfolio', portfolioRoutes); // <-- ADD THIS LINE
app.use('/api/ai', aiLimiter, aiRoutes); // <-- ADD THIS LINE


// --- Server Initialization ---

// Define the port for the server to listen on.
// It will try to use the port from your .env file, or default to 5000.
const PORT = process.env.PORT || 5000;

app.listen(
    PORT,
    console.log(
        `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
    )
);
