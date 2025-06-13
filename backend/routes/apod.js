// routes/apod.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

const NASA_API_KEY = process.env.NASA_API_KEY;

router.get('/', async (req, res) => {
  try {
    const { data } = await axios.get(`https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch APOD', details: error.message });
  }
});

module.exports = router;
