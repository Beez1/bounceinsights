const express = require('express');
const router = express.Router();
const { generateImageExplanation } = require('../utils/vision');

router.post('/', async (req, res) => {
  const { imageUrl } = req.body;

  if (!imageUrl) {
    return res.status(400).json({ success: false, details: 'Image URL is required' });
  }

  try {
    const explanation = await generateImageExplanation(imageUrl);
    res.json({ success: true, explanation });
  } catch (error) {
    console.error('Error in /explain route:', error);
    res.status(500).json({ success: false, details: error.message });
  }
});

module.exports = router; 