// backend/routes/explain.js
const express = require('express');
const { getAIExplanation } = require('../utils/explanation');
const router = express.Router();

router.post('/', async (req, res) => {
  const { imageUrl } = req.body;

  if (!imageUrl) {
    return res.status(400).json({ error: 'imageUrl is required' });
  }

  try {
    const explanation = await getAIExplanation(imageUrl);
    res.json({ explanation });
  } catch (error) {
    // The utility function now handles detailed logging.
    res.status(500).json({ error: 'Failed to process your request.' });
  }
});

module.exports = router; 