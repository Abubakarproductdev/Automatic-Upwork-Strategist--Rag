const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const cors = require('cors');
const colors = require('colors'); // For styled console logs
const proposalRoutes = require('./routes/proposalRoutes');
const connectDB = require('./Config/dbConfig');
const portfolioRoutes = require('./routes/portfolioRoutes'); // <-- ADD THIS LINE
const aiRoutes = require('./routes/aiRoutes'); // <-- ADD THIS LINE

// Load environment variables from .env file

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// --- Middleware ---

// 1. CORS (Cross-Origin Resource Sharing)
// Your React frontend (e.g., on localhost:3000) will be on a different
// "origin" than your backend (e.g., on localhost:5000). This middleware
// allows the frontend to make API requests to the backend.
app.use(cors());

// 2. Body Parser
// This allows the server to accept and parse JSON data in the body of requests.
// Without this, `req.body` would be undefined.
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


// --- API Routes ---

// Mount the proposal routes.
// This tells Express that for any request starting with '/api/proposals',
// it should use the 'proposalRoutes' router we defined earlier.
app.use('/api/proposals', proposalRoutes);
app.use('/api/portfolio', portfolioRoutes); // <-- ADD THIS LINE
app.use('/api/ai', aiRoutes); // <-- ADD THIS LINE


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