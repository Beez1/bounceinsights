const { ImageAnnotatorClient } = require('@google-cloud/vision');
const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

let client;

if (process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64) {
  try {
    const credentialsJson = Buffer.from(process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64, 'base64').toString('utf-8');
    const credentials = JSON.parse(credentialsJson);
    client = new ImageAnnotatorClient({ credentials });
    console.log('Google Vision client initialized using base64 credentials.');
  } catch (error) {
    console.error('Failed to parse GOOGLE_APPLICATION_CREDENTIALS_BASE64:', error);
    // Fallback to default client if base64 parsing fails
    client = new ImageAnnotatorClient();
  }
} else {
  // Creates a client using the file path if base64 is not provided
  client = new ImageAnnotatorClient();
  console.log('Google Vision client initialized using file path credentials.');
}

function buildImagePayload(image) {
    if (image.startsWith('http')) {
        return { source: { imageUri: image } };
    }
    if (image.startsWith('data:')) {
        return { content: image.split(',')[1] };
    }
    return { content: image };
}

async function detectCountries(imageUrl) {
  try {
    const imagePayload = buildImagePayload(imageUrl);
    const request = {
      image: imagePayload,
      features: [
        { type: 'WEB_DETECTION' },
        { type: 'LANDMARK_DETECTION' }
      ]
    };

    const [result] = await client.annotateImage(request);
    
    const webDetection = result.webDetection;
    const countries = new Set();

    if (webDetection && webDetection.webEntities.length) {
      webDetection.webEntities.forEach(entity => {
        // Simple check if the entity description might be a country.
        // This is a basic heuristic and might need refinement.
        // We are looking for entities that are likely geographical locations.
        if (entity.description) {
            // A more robust solution would be to check against a list of known countries
            // but for now we can assume descriptions with few words are more likely to be countries.
             if(entity.score > 0.5 && !entity.description.includes(' ')){
                countries.add(entity.description);
             }
        }
      });
    }
    
    // Fallback for landmark detection if web detection yields no results
    if (countries.size === 0) {
        const landmarks = result.landmarkAnnotations;
        if (landmarks && landmarks.length) {
            landmarks.forEach(landmark => {
                if(landmark.description) countries.add(landmark.description)
            });
        }
    }

    return Array.from(countries).slice(0, 10); // Return top 10 results
  } catch (error) {
    console.error('Google Vision API Error:', error);
    const errorMessage = error.details || error.message || 'An unknown error occurred.';
    throw new Error(`Failed to analyze image with Google Vision API. Details: ${errorMessage}`);
  }
}

async function generateImageExplanation(image) {
  try {
    // Define two parallel API calls
    const gptVisionPromise = openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { 
              type: "text", 
              text: "Analyze this image and provide a detailed, engaging description. Describe what the image depicts, focusing on the main subjects, the setting, and any notable visual elements. Present the description in a clear, well-structured paragraph." 
            },
            {
              type: "image_url",
              image_url: {
                url: image, // Send the full data URL to OpenAI
              },
            },
          ],
        },
      ],
      max_tokens: 300,
    });

    const googleVisionPromise = client.annotateImage({
        image: buildImagePayload(image), // buildImagePayload handles formatting for Google Vision
        features: [
            { type: 'LABEL_DETECTION' },
            { type: 'WEB_DETECTION' }
        ]
    });

    // Await both promises to complete
    const [gptResponse, googleResponse] = await Promise.all([gptVisionPromise, googleVisionPromise]);

    // Process the description from OpenAI
    const gptDescription = gptResponse.choices[0].message.content.trim();

    // Process the labels and entities from Google Vision
    const [googleResult] = googleResponse;
    const labels = googleResult.labelAnnotations ? googleResult.labelAnnotations.map(label => label.description) : [];
    const webEntities = googleResult.webDetection && googleResult.webDetection.webEntities ? 
                        googleResult.webDetection.webEntities.map(entity => entity.description) : [];
    const cleanedEntities = [...new Set(webEntities.filter(e => !e.startsWith('/m/')))];

    // Combine the results into a final explanation
    let finalExplanation = gptDescription;

    if (labels.length > 0 || cleanedEntities.length > 0) {
      finalExplanation += "\n\n---\n\nKey Insights\n";
      if (labels.length > 0) {
        finalExplanation += `Identified Labels: ${labels.slice(0, 8).join(', ')}\n`;
      }
      if (cleanedEntities.length > 0) {
        finalExplanation += `Related Concepts: ${cleanedEntities.slice(0, 8).join(', ')}`;
      }
    }

    return finalExplanation;

  } catch (error) {
    console.error('Google Vision or OpenAI API Error for explanation:', error);
    const errorMessage = error.details || error.message || 'An unknown error occurred.';
    throw new Error(`Failed to generate explanation. Details: ${errorMessage}`);
  }
}

module.exports = { detectCountries, generateImageExplanation };
