const { ImageAnnotatorClient } = require('@google-cloud/vision');
require('dotenv').config();

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

async function detectCountries(imageUrl) {
  try {
    const [result] = await client.webDetection(imageUrl);
    const webDetection = result.webDetection;
    const countries = new Set();

    if (webDetection.webEntities.length) {
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
        const [landmarkResult] = await client.landmarkDetection(imageUrl);
        const landmarks = landmarkResult.landmarkAnnotations;
        if (landmarks.length) {
            landmarks.forEach(landmark => {
                if(landmark.description) countries.add(landmark.description)
            });
        }
    }

    return Array.from(countries).slice(0, 10); // Return top 10 results
  } catch (error) {
    console.error('Google Vision API Error:', error);
    throw new Error('Failed to analyze image with Google Vision API.');
  }
}

module.exports = { detectCountries };
