const express = require('express');
const router = express.Router();
const { getFilteredScores } = require('../../services/espnService');  // ✅ Corrected path

router.get('/', async (req, res) => {
    const { league, team, status } = req.query;
    let { limit } = req.query;

    const DEFAULT_LIMIT = 20;
    limit = parseInt(limit);
    if (isNaN(limit) || limit < 0) limit = DEFAULT_LIMIT;

    try {
        const scores = await getFilteredScores(league, team, status, limit);
        res.json(scores);
    } catch (err) {
        console.error(`[${new Date().toISOString()}] API Error:`, err);
        res.status(503).json({ message: "Live scores are temporarily unavailable. Please try again shortly." });
    }
});

module.exports = router;
