const express = require('express');
const { detectCountries } = require('../utils/vision');
const { getCapital } = require('../utils/capitals');
const { getHistoricalWeather } = require('../utils/weather');
const { getNewsForCountry } = require('../utils/news');
const geocoder = require('../utils/geocoder');

const router = express.Router();

router.post('/', async (req, res) => {
  const { imageUrl, date, countries: manualCountries, location } = req.body;

  if (!imageUrl && !location && !manualCountries) {
    return res.status(400).json({ error: 'imageUrl, location, or countries is required' });
  }

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

    console.log(`Detected countries for contextualization: ${detectedCountries.join(', ')}`);

    const contextualPromises = detectedCountries.map(async (country) => {
      const capitalInfo = getCapital(country);
      if (!capitalInfo || !capitalInfo.iso2) {
        console.warn(`Skipping ${country} due to missing capital or iso2 code.`);
        return null;
      }

      // Fetch weather and news in parallel
      const [weather, news] = await Promise.all([
        getHistoricalWeather(capitalInfo.lat, capitalInfo.lon, queryDate),
        getNewsForCountry(capitalInfo.iso2)
      ]);

      return {
        country,
        capital: capitalInfo.capital,
        lat: capitalInfo.lat,
        lon: capitalInfo.lon,
        weather,
        news, // Add the news headlines to the response
      };
    });

    const contextualData = (await Promise.all(contextualPromises)).filter(Boolean);

    res.json({
      imageUrl,
      date: queryDate,
      contextualData,
    });

  } catch (error) {
    console.error('Error in /contextualize route:', error);
    res.status(500).json({ error: 'An internal server error occurred.' });
  }
});

module.exports = router; 