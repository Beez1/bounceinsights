// routes/apod.js
const express = require('express');
const axios = require('axios');
require('dotenv').config();

const router = express.Router();

// Validate NASA API key
const NASA_API_KEY = process.env.NASA_API_KEY;
if (!NASA_API_KEY) {
  console.error('NASA_API_KEY is not set in environment variables');
}

router.get('/', async (_req, res) => {
  try {
    if (!NASA_API_KEY) {
      return res.status(500).json({ 
        error: 'Server configuration error', 
        details: 'NASA API key is not configured' 
      });
    }
    // Log the request URL for debugging
    const requestUrl = `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`;
    console.log('Making request to:', requestUrl);

    const response = await axios.get(requestUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'NASA APOD App'
      }
    });
    console.log(response.data);
    return res.json(response.data);
  } catch (error) {
    // Detailed error logging
    console.error('APOD API Error Details:');
    console.error('Error Message:', error.message);
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error Response Status:', error.response.status);
      console.error('Error Response Headers:', error.response.headers);
      console.error('Error Response Data:', error.response.data);
      
      return res.status(error.response.status).json({
        error: 'NASA API Error',
        status: error.response.status,
        details: error.response.data
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from NASA API');
      return res.status(503).json({
        error: 'NASA API Connection Error',
        details: 'No response received from NASA API'
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error setting up request:', error.message);
      return res.status(500).json({
        error: 'Internal Server Error',
        details: error.message
      });
    }
  }
});

module.exports = router;
