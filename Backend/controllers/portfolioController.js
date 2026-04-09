const fs = 'fs'.promises; // Use the promise-based version for cleaner async/await
const path = require('path');

// Define the path to our context file. 
// Using path.join makes it work on any operating system (Windows, Mac, Linux).
// __dirname points to the 'controllers' folder, so we go up one level ('..') and then into 'data'.
const portfolioFilePath = path.join(__dirname, '..', 'data', 'portfolioContext.txt');

/**
 * @desc    Get the current portfolio data from the file.
 * @route   GET /api/portfolio
 * @access  Private
 *
 * This function reads the portfolio file. The frontend will call this to populate
 * the "Customize my details" page. The AI service will also call this internally
 * to get context for writing proposals.
 */
exports.getPortfolio = async (req, res) => {
    try {
        // Read the file from the disk. 'utf8' encoding is important.
        const fileContent = await fs.readFile(portfolioFilePath, 'utf8');
        
        // The file stores JSON as a string, so we need to parse it back into an object.
        const portfolioData = JSON.parse(fileContent);

        res.status(200).json({
            success: true,
            data: portfolioData
        });
    } catch (error) {
        // This 'ENOENT' error happens if the file doesn't exist yet (e.g., on first run).
        // In this case, we just send back an empty object so the frontend doesn't break.
        if (error.code === 'ENOENT') {
            return res.status(200).json({ 
                success: true, 
                data: {} // Return an empty object if file not found
            });
        }
        // For any other error, it's a genuine server problem.
        console.error('Error reading portfolio file:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error: Could not read portfolio data.'
        });
    }
};

/**
 * @desc    Update the portfolio data file.
 * @route   POST /api/portfolio
 * @access  Private
 *
 * This function takes the JSON body from the frontend request and writes it to the file,
 * overwriting whatever was there before.
 */
exports.updatePortfolio = async (req, res) => {
    try {
        const newPortfolioData = req.body;

        // For better readability in the .txt file, we stringify the JSON with an
        // indent of 2 spaces. This has no effect on the data itself.
        const fileContent = JSON.stringify(newPortfolioData, null, 2);

        // Write the stringified data to our file, overwriting it completely.
        await fs.writeFile(portfolioFilePath, fileContent, 'utf8');

        res.status(200).json({
            success: true,
            message: 'Portfolio context file updated successfully.',
            data: newPortfolioData
        });

    } catch (error) {
        console.error('Error writing portfolio file:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error: Could not update portfolio data.'
        });
    }
};