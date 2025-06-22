const express = require('express');
const { detectCountries } = require('../utils/vision');
const { getCapital } = require('../utils/capitals');
const { getHistoricalWeather } = require('../utils/weather');
const { getNewsForCountry } = require('../utils/news');
const { getAIExplanation } = require('../utils/explanation');
const { sendBriefingEmail } = require('../utils/email');

const router = express.Router();

router.post('/', async (req, res) => {
  const { imageUrl, date, recipientEmail, countries: manualCountries } = req.body;

  if (!imageUrl || !recipientEmail) {
    return res.status(400).json({ error: 'imageUrl and recipientEmail are required' });
  }

  // Use a default date if not provided, formatted as YYYY-MM-DD
  const queryDate = date || new Date().toISOString().split('T')[0];

  try {
    // --- Step 1: Detect Countries (or use manual ones) ---
    let countries = manualCountries && manualCountries.length > 0 
      ? manualCountries 
      : await detectCountries(imageUrl);

    if (!countries || countries.length === 0) {
      return res.status(404).json({ error: 'Could not detect any countries from the image.' });
    }
    console.log(`Processing briefing for: ${countries.join(', ')}`);
    
    // --- Step 2: Fetch all data in parallel for maximum efficiency ---
    const dataPromises = [
      getAIExplanation(imageUrl),
      ...countries.map(async (country) => {
        const capitalInfo = getCapital(country);
        if (!capitalInfo || !capitalInfo.iso2) {
          console.warn(`Skipping ${country} for regional data due to missing capital or iso2 code.`);
          return null;
        }

        const [weather, news] = await Promise.all([
          getHistoricalWeather(capitalInfo.lat, capitalInfo.lon, queryDate),
          getNewsForCountry(capitalInfo.iso2)
        ]);
        
        return { country, capital: capitalInfo.capital, weather, news };
      })
    ];

    const [aiExplanation, ...contextualDataResults] = await Promise.all(dataPromises);
    const contextualData = contextualDataResults.filter(Boolean); // Filter out nulls from skipped countries

    // --- Step 3: Assemble and Send Email ---
    const briefingData = {
      imageUrl,
      date: queryDate,
      aiExplanation,
      contextualData
    };
    
    await sendBriefingEmail(recipientEmail, briefingData);

    res.json({ message: `Briefing sent successfully to ${recipientEmail}` });

  } catch (error) {
    console.error('Error in /email-briefing route:', error);
    res.status(500).json({ error: 'Failed to generate and send briefing.' });
  }
});

module.exports = router; 