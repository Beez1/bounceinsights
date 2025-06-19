// backend/routes/explain.js
const express = require('express');
const OpenAI = require('openai');
require('dotenv').config();

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post('/', async (req, res) => {
  const { imageUrl } = req.body;

  if (!imageUrl) {
    return res.status(400).json({ error: 'imageUrl is required' });
  }

  const finalPrompt =
    "You are a NASA Earth scientist and satellite imagery analyst. Based only on what is visible in this image, identify whether the photo shows any parts of Earth. If so, describe what continents and countries might be visible, using natural landforms and coastline patterns for reference. If possible, identify and list up to 10 major cities that can be seen in the photo. Analyze the atmospheric features too — such as clouds, their shapes, and their densities. Comment on what the cloud formations might indicate: clear skies, light clouds, storm systems, or heavy cloud cover. If visible, describe ocean currents, snow, deserts, or mountain ranges. The goal is to educate a general audience about what this satellite image likely reveals about Earth's geography and weather, without using any external metadata or assumptions.";

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: finalPrompt },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
      max_tokens: 300,
    });

    res.json(response.choices[0]);
  } catch (error) {
    console.error('OpenAI API Error:', error);
    res.status(500).json({ error: 'Failed to get explanation from OpenAI' });
  }
});

module.exports = router; 