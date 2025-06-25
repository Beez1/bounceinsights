const express = require('express');
const router = express.Router();
const { sendApodEmail, sendWeatherEmail } = require('../utils/email');

// Endpoint to send APOD email
router.post('/apod', async (req, res) => {
  const { email, apodData } = req.body;

  if (!email || !apodData) {
    return res.status(400).json({ success: false, details: 'Email and APOD data are required' });
  }

  try {
    await sendApodEmail(email, apodData);
    res.json({ success: true, message: 'APOD email sent successfully.' });
  } catch (error) {
    console.error('Error in /send-email/apod route:', error);
    res.status(500).json({ success: false, details: error.message });
  }
});

// Endpoint to send Weather summary email
router.post('/weather', async (req, res) => {
  const { email, weatherData } = req.body;

  if (!email || !weatherData) {
    return res.status(400).json({ success: false, details: 'Email and weather data are required' });
  }

  try {
    await sendWeatherEmail(email, weatherData);
    res.json({ success: true, message: 'Weather summary email sent successfully.' });
  } catch (error) {
    console.error('Error in /send-email/weather route:', error);
    res.status(500).json({ success: false, details: error.message });
  }
});

module.exports = router; 