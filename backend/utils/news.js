const axios = require('axios');
require('dotenv').config();

const GNEWS_API_KEY = process.env.GNEWS_API_KEY;

/**
 * Fetches the top news headlines for a specific country.
 * @param {string} countryCode - The two-letter ISO code for the country (e.g., "gb").
 * @returns {Promise<Array<object>>} - A promise that resolves to an array of article objects.
 */
async function getNewsForCountry(countryCode) {
  if (!GNEWS_API_KEY) {
    console.warn('GNEWS_API_KEY is not set. Skipping news fetch.');
    return []; // Return empty array if key is not configured
  }

  // Note: The GNews free plan fetches *current* top headlines for a country.
  // Historical search by date is a premium feature.
  const url = `https://gnews.io/api/v4/top-headlines?country=${countryCode}&lang=en&apikey=${GNEWS_API_KEY}`;

  try {
    const response = await axios.get(url);
    // Return the top 3 articles
    return response.data.articles.slice(0, 3).map(article => ({
      title: article.title,
      source: article.source.name,
      url: article.url,
    }));
  } catch (error) {
    console.error(`GNews API Error for ${countryCode}:`, error.response?.data?.errors || error.message);
    // Don't throw an error, just return empty so the main request doesn't fail
    return [];
  }
}

module.exports = { getNewsForCountry }; 