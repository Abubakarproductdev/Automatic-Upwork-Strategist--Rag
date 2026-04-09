const express = require('express');
const router = express.Router();

const {
    generateProposal,
    refreshCache
} = require('../controllers/aiController');

// Main endpoint for generating proposals
router.route('/generate-proposal').post(generateProposal);

// Utility endpoint to manually refresh the cache if you update your portfolio
router.route('/refresh-cache').post(refreshCache);


module.exports = router;