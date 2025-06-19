const express = require('express');
const { detectCountries } = require('../utils/vision');
const { getCapital } = require('../utils/capitals');
const { getHistoricalWeather } = require('../utils/weather');

const router = express.Router();

router.post('/', async (req, res) => {
  const { imageUrl, date, countries: manualCountries } = req.body;

  if (!imageUrl) {
    return res.status(400).json({ error: 'imageUrl is required' });
  }

  // A default date for testing, as per instructions.
  const queryDate = date || '2024-06-01';

  try {
    let detectedCountries = [];
    if (manualCountries && manualCountries.length > 0) {
        console.log('Using manually provided countries:', manualCountries);
        detectedCountries = manualCountries;
    } else {
        console.log('Detecting countries from image...');
        detectedCountries = await detectCountries(imageUrl);
    }

    if (!detectedCountries || detectedCountries.length === 0) {
      return res.status(404).json({ error: 'Could not detect any countries from the image.' });
    }
    
    console.log(`Detected countries: ${detectedCountries.join(', ')}`);

    const regionPromises = detectedCountries.map(async (country) => {
      const capitalInfo = getCapital(country);
      if (!capitalInfo) {
        console.log(`No capital found for ${country}`);
        return null; // Skip countries with no capital info
      }

      const { capital, lat, lon } = capitalInfo;
      console.log(`Fetching weather for ${capital}, ${country}...`);
      
      const weather = await getHistoricalWeather(lat, lon, queryDate);

      return {
        country,
        capital,
        lat,
        lon,
        weather,
      };
    });

    const regions = (await Promise.all(regionPromises)).filter(Boolean); // Filter out nulls

    res.json({
      imageUrl,
      date: queryDate,
      regions,
    });

  } catch (error) {
    console.error('Error in /weather-summary route:', error);
    res.status(500).json({ error: 'An internal server error occurred.' });
  }
});

module.exports = router;
