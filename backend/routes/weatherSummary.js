const express = require('express');
const { detectCountries } = require('../utils/vision');
const { getCapital } = require('../utils/capitals');
const { getHistoricalWeather } = require('../utils/weather');
const geocoder = require('../utils/geocoder');

const router = express.Router();

router.post('/', async (req, res) => {
  const { imageUrl, date, countries: manualCountries, location } = req.body;

  if (!imageUrl && !location && !manualCountries) {
    return res.status(400).json({ error: 'imageUrl, location, or countries is required' });
  }

  // A default date for testing, as per instructions.
  const queryDate = date || '2024-06-01';

  try {
    let detectedCountries = [];
    if (location?.lat && location?.lng) {
      const geoData = await geocoder.reverse({ lat: location.lat, lon: location.lng });
      if (geoData[0] && geoData[0].country) {
        detectedCountries = [geoData[0].country];
      }
    } else if (location?.name) {
      detectedCountries = [location.name];
    } else if (manualCountries && manualCountries.length > 0) {
        console.log('Using manually provided countries:', manualCountries);
        detectedCountries = manualCountries;
    } else if (imageUrl) {
        console.log('Detecting countries from image...');
        detectedCountries = await detectCountries(imageUrl);
    }

    if (!detectedCountries || detectedCountries.length === 0) {
      return res.status(404).json({ error: 'Could not detect any countries.' });
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
