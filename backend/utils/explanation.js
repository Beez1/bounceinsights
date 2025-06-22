const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const PROMPT = 
  "You are a NASA Earth scientist and satellite imagery analyst. Based only on what is visible in this image, identify whether the photo shows any parts of Earth. If so, describe what continents and countries might be visible, using natural landforms and coastline patterns for reference. If possible, identify and list up to 10 major cities that can be seen in the photo. Analyze the atmospheric features too — such as clouds, their shapes, and their densities. Comment on what the cloud formations might indicate: clear skies, light clouds, storm systems, or heavy cloud cover. If visible, describe ocean currents, snow, deserts, or mountain ranges. The goal is to educate a general audience about what this satellite image likely reveals about Earth's geography and weather, without using any external metadata or assumptions.";

/**
 * Generates an AI-powered explanation for a given image URL.
 * @param {string} imageUrl - The URL of the image to analyze.
 * @returns {Promise<string>} - A promise that resolves to the AI-generated text explanation.
 */
async function getAIExplanation(imageUrl) {
  if (!process.env.OPENAI_API_KEY) {
    console.warn('OPENAI_API_KEY is not set. Skipping AI explanation.');
    return "AI explanation is unavailable because the API key is not configured.";
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: PROMPT },
            { type: 'image_url', image_url: { url: imageUrl } },
          ],
        },
      ],
      max_tokens: 400,
    });

    if (response.choices && response.choices.length > 0) {
      return response.choices[0].message.content;
    }
    return "Could not generate an AI explanation.";
  } catch (error) {
    console.error('OpenAI API Error in utility:', error);
    // Return a user-friendly error message
    return 'Failed to get explanation from AI service.';
  }
}

module.exports = { getAIExplanation }; 