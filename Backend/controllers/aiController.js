const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs').promises;
const path = require('path');

// --- Configuration ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-001' });

const portfolioFilePath = path.join(__dirname, '..', 'data', 'portfolioContext.txt');

// This will act as our simple in-memory cache holder for the backend session.
// For a single-user app, this is highly efficient.
let activeCache = {
    name: null,
    expires: 0, // Expiration time in milliseconds
};

/**
 * Helper function to manage the Gemini Cache.
 * It checks if a valid cache exists and creates a new one if not.
 */
const manageGeminiCache = async () => {
    const now = Date.now();

    // 1. Check if the current cache is still valid
    if (activeCache.name && now < activeCache.expires) {
        console.log('Using existing, valid Gemini cache.');
        return activeCache.name;
    }

    console.log('Cache expired or not found. Creating a new one...');

    // 2. Read your portfolio data (the "Static" Block)
    let systemContext;
    try {
        const fileContent = await fs.readFile(portfolioFilePath, 'utf8');
        // Your file is JSON, but the system instruction is a string.
        // We'll format it nicely for the AI.
        const portfolioJson = JSON.parse(fileContent);
        systemContext = `
            You are an expert proposal writer for a MERN stack developer named Muhammad. 
            Your response must be based on the following context about Muhammad's skills and projects.
            --- START CONTEXT ---
            ${JSON.stringify(portfolioJson, null, 2)}
            --- END CONTEXT ---
            When given a job description, write a concise, human-like proposal that directly addresses the client's problem.
        `;
    } catch (error) {
        if (error.code === 'ENOENT') {
            throw new Error("Portfolio context file not found. Please create it first.");
        }
        throw error;
    }

    // 3. Create the cache on Google's servers (The "Server" Block)
    const ttlSeconds = 7200; // 2 hours, as per your plan
    const newCachedContent = await model.createCachedContent({
        model: 'models/gemini-1.5-flash-001',
        displayName: `muhammad_portfolio_cache_${now}`, // Unique name for each cache instance
        systemInstruction: systemContext,
        ttl: { seconds: ttlSeconds },
    });
    
    // 4. Store the new cache details in our backend's memory
    activeCache.name = newCachedContent.name;
    activeCache.expires = now + ttlSeconds * 1000;

    console.log(`New Gemini cache created. Name: ${activeCache.name}`);
    return activeCache.name;
};


/**
 * @desc    Generate a proposal using the cached context.
 * @route   POST /api/ai/generate-proposal
 * @access  Private
 */
exports.generateProposal = async (req, res) => {
    const { jobDescription } = req.body;

    if (!jobDescription) {
        return res.status(400).json({ success: false, message: "Job description is required." });
    }

    try {
        // 1. Ensure we have a valid cache (The "Fast Bidding" Logic)
        const cacheName = await manageGeminiCache();
        
        // 2. Call the model, referencing the cache via the 'tools' parameter.
        // The API automatically attaches the job description to your "cached brain".
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: jobDescription }] }],
            tools: [{ cachedContent: { name: cacheName } }]
        });
        
        const responseText = result.response.text();

        // 3. Send the AI-generated proposal back to the frontend.
        res.status(200).json({
            success: true,
            proposal: responseText,
        });

    } catch (error) {
        console.error('Error generating proposal with Gemini:', error);
        res.status(500).json({ success: false, message: 'Failed to generate proposal.' });
    }
};

/**
 * @desc    Manually force the cache to be refreshed.
 * @route   POST /api/ai/refresh-cache
 * @access  Private
 */
exports.refreshCache = async (req, res) => {
    // Invalidate the current cache so the next call to manageGeminiCache will create a new one.
    activeCache.name = null;
    activeCache.expires = 0;
    
    try {
        await manageGeminiCache(); // Re-run the cache creation logic
        res.status(200).json({ success: true, message: "Gemini cache has been refreshed." });
    } catch (error) {
        console.error('Error manually refreshing cache:', error);
        res.status(500).json({ success: false, message: 'Failed to refresh cache.' });
    }
};