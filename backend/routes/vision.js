const express = require('express');
const router = express.Router();
const { detectCountries } = require('../utils/vision');

router.post('/detect-countries', async (req, res) => {
  const { imageUrl } = req.body;

  if (!imageUrl) {
    return res.status(400).json({ success: false, details: 'Image URL is required' });
  }

  try {
    const countries = await detectCountries(imageUrl);
    res.json({ success: true, countries });
  } catch (error) {
    console.error('Error in /detect-countries route:', error);
    res.status(500).json({ success: false, details: error.message });
  }
});

module.exports = router; 