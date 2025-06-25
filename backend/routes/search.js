const express = require('express');
const { OpenAI } = require('openai');
const axios = require('axios');
const { getCapital } = require('../utils/capitals');
const { getHistoricalWeather } = require('../utils/weather');
const { getNewsForCountry } = require('../utils/news');
require('dotenv').config();

const router = express.Router();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 60000, // 60 second timeout for complex analysis
  maxRetries: 3,
});

const NASA_API_KEY = process.env.NASA_API_KEY;

// Enhanced location database for better geocoding
const ENHANCED_LOCATIONS = {
  // Continents
  'europe': { lat: 54.5260, lon: 15.2551, region: 'continent', countries: ['Germany', 'France', 'Italy', 'Spain', 'United Kingdom', 'Poland', 'Netherlands', 'Belgium', 'Greece', 'Portugal'] },
  'africa': { lat: -8.7832, lon: 34.5085, region: 'continent', countries: ['Nigeria', 'Egypt', 'South Africa', 'Kenya', 'Morocco', 'Ethiopia', 'Ghana', 'Algeria', 'Sudan', 'Tanzania'] },
  'asia': { lat: 34.0479, lon: 100.6197, region: 'continent', countries: ['China', 'India', 'Japan', 'South Korea', 'Thailand', 'Vietnam', 'Malaysia', 'Indonesia', 'Philippines', 'Singapore'] },
  'north america': { lat: 45.0000, lon: -100.0000, region: 'continent', countries: ['United States', 'Canada', 'Mexico'] },
  'south america': { lat: -8.7832, lon: -55.4915, region: 'continent', countries: ['Brazil', 'Argentina', 'Chile', 'Peru', 'Colombia', 'Venezuela', 'Ecuador', 'Bolivia', 'Uruguay', 'Paraguay'] },
  
  // Major countries
  'nigeria': { lat: 9.0820, lon: 8.6753, region: 'country', iso2: 'NG' },
  'united states': { lat: 39.8283, lon: -98.5795, region: 'country', iso2: 'US' },
  'china': { lat: 35.8617, lon: 104.1954, region: 'country', iso2: 'CN' },
  'india': { lat: 20.5937, lon: 78.9629, region: 'country', iso2: 'IN' },
  'brazil': { lat: -14.2350, lon: -51.9253, region: 'country', iso2: 'BR' },
  'russia': { lat: 61.5240, lon: 105.3188, region: 'country', iso2: 'RU' },
  'australia': { lat: -25.2744, lon: 133.7751, region: 'country', iso2: 'AU' },
  'germany': { lat: 51.1657, lon: 10.4515, region: 'country', iso2: 'DE' },
  'france': { lat: 46.6034, lon: 1.8883, region: 'country', iso2: 'FR' },
  'united kingdom': { lat: 55.3781, lon: -3.4360, region: 'country', iso2: 'GB' },
  'japan': { lat: 36.2048, lon: 138.2529, region: 'country', iso2: 'JP' },
  'canada': { lat: 56.1304, lon: -106.3468, region: 'country', iso2: 'CA' },
  'mexico': { lat: 23.6345, lon: -102.5528, region: 'country', iso2: 'MX' },
  'south africa': { lat: -30.5595, lon: 22.9375, region: 'country', iso2: 'ZA' },
  'egypt': { lat: 26.8206, lon: 30.8025, region: 'country', iso2: 'EG' },
  'kenya': { lat: -0.0236, lon: 37.9062, region: 'country', iso2: 'KE' },
  'ethiopia': { lat: 9.1450, lon: 40.4897, region: 'country', iso2: 'ET' },
  'argentina': { lat: -38.4161, lon: -63.6167, region: 'country', iso2: 'AR' },
  'chile': { lat: -35.6751, lon: -71.5430, region: 'country', iso2: 'CL' }
};

// Common natural disaster and event keywords
const EVENT_KEYWORDS = {
  'heatwave': { type: 'weather', weather_focus: 'temperature', season_hint: 'summer' },
  'heat wave': { type: 'weather', weather_focus: 'temperature', season_hint: 'summer' },
  'drought': { type: 'weather', weather_focus: 'precipitation', condition: 'dry' },
  'flood': { type: 'weather', weather_focus: 'precipitation', condition: 'wet' },
  'flooding': { type: 'weather', weather_focus: 'precipitation', condition: 'wet' },
  'hurricane': { type: 'weather', weather_focus: 'wind_precipitation', season_hint: 'hurricane_season' },
  'typhoon': { type: 'weather', weather_focus: 'wind_precipitation', season_hint: 'typhoon_season' },
  'wildfire': { type: 'environmental', weather_focus: 'temperature', condition: 'dry' },
  'fire': { type: 'environmental', weather_focus: 'temperature', condition: 'dry' },
  'earthquake': { type: 'geological', news_relevant: true },
  'volcano': { type: 'geological', news_relevant: true },
  'eruption': { type: 'geological', news_relevant: true },
  'pandemic': { type: 'health', news_relevant: true },
  'covid': { type: 'health', news_relevant: true, year_hint: '2020-2022' },
  'war': { type: 'conflict', news_relevant: true },
  'conflict': { type: 'conflict', news_relevant: true },
  'election': { type: 'political', news_relevant: true },
  'olympics': { type: 'sports', news_relevant: true },
  'world cup': { type: 'sports', news_relevant: true }
};

// Main search endpoint
router.post('/', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { query, maxResults = 10, includeAnalysis = true } = req.body;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        error: 'Invalid input',
        details: 'A natural language query string is required'
      });
    }

    console.log(`[NL Search] Processing query: "${query}"`);

    // Step 1: Parse the natural language query using GPT-4
    const queryAnalysis = await parseNaturalLanguageQuery(query);
    
    if (!queryAnalysis.success) {
      return res.status(400).json({
        error: 'Query parsing failed',
        details: queryAnalysis.details || queryAnalysis.error,
        suggestions: [
          'Try including a specific location (e.g., "Europe", "Nigeria", "New York")',
          'Mention a time period (e.g., "2023", "last summer", "during 2020")',
          'Include event keywords (e.g., "heatwave", "floods", "drought")'
        ]
      });
    }

    console.log(`[NL Search] Parsed query:`, JSON.stringify(queryAnalysis, null, 2));

    // Step 2: Gather data from multiple sources in parallel
    const searchResults = await gatherSearchData(queryAnalysis, maxResults);

    // Step 3: Generate comprehensive analysis if requested
    let overallAnalysis = null;
    if (includeAnalysis && searchResults.some(result => !result.error)) {
      try {
        overallAnalysis = await generateOverallAnalysis(query, queryAnalysis, searchResults);
      } catch (error) {
        console.error('[NL Search] Analysis generation failed:', error.message);
        overallAnalysis = { error: `Analysis unavailable: ${error.message}` };
      }
    }

    const processingTime = Date.now() - startTime;
    
    return res.json({
      success: true,
      originalQuery: query,
      queryAnalysis,
      results: searchResults,
      overallAnalysis,
      metadata: {
        totalResults: searchResults.length,
        successfulSources: searchResults.filter(r => !r.error).length,
        processingTimeMs: processingTime,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('[NL Search] Fatal error:', error);
    return res.status(500).json({
      error: 'Search failed',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Parse natural language query using GPT-4
async function parseNaturalLanguageQuery(query) {
  if (!process.env.OPENAI_API_KEY) {
    console.error('[Query Parser] Error: OPENAI_API_KEY is not configured.');
    return {
      success: false,
      error: 'Service Configuration Error',
      details: 'The OpenAI API key is missing from the backend environment. Please ensure the OPENAI_API_KEY is set in your .env file.'
    };
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an expert at parsing natural language queries for satellite imagery, weather, and geographical data searches. 

Extract structured information from user queries and return ONLY valid JSON in this exact format:
{
  "locations": [{"name": "string", "type": "country|continent|city", "coordinates": {"lat": number, "lon": number}, "region": "string"}],
  "timeframe": {"start": "YYYY-MM-DD", "end": "YYYY-MM-DD", "period": "string", "confidence": "high|medium|low"},
  "events": [{"type": "string", "keywords": ["string"], "severity": "high|medium|low"}],
  "dataTypes": ["satellite", "weather", "news", "historical"],
  "intent": "string describing what user wants to find",
  "confidence": "high|medium|low"
}

Key guidelines:
- For timeframes: If year mentioned, use full year range. If season mentioned, estimate months.
- For locations: Include coordinates if you can reasonably estimate them
- For events: Extract weather events, disasters, political events, etc.
- Set confidence based on clarity of the query
- ALWAYS include multiple relevant dataTypes - most queries should include ["satellite", "weather", "news"] at minimum
- Include "historical" dataType for space/astronomy related queries
- Prioritize comprehensive data gathering over narrow focus

Examples:
"Show me Europe during 2023 heatwave" → dataTypes: ["satellite", "weather", "news"], events: heatwave
"What did Nigeria look like during 2020 floods?" → dataTypes: ["satellite", "weather", "news"], events: flooding
"Find images of California wildfires" → dataTypes: ["satellite", "weather", "news"], events: wildfire`
        },
        {
          role: "user",
          content: query
        }
      ],
      temperature: 0.1,
      max_tokens: 1000
    });

    let content = response.choices[0].message.content;

    // The model can sometimes wrap the JSON in markdown or add other text.
    // This regex will find the JSON block.
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch && jsonMatch[0]) {
      content = jsonMatch[0];
    }

    const parsed = JSON.parse(content);
    
    // Enhance locations with our database
    if (parsed.locations) {
      parsed.locations = parsed.locations.map(location => {
        const enhanced = ENHANCED_LOCATIONS[location.name.toLowerCase()];
        if (enhanced) {
          return { ...location, ...enhanced };
        }
        return location;
      });
    }

    return { success: true, ...parsed };
    
  } catch (error) {
    console.error('[Query Parser] Error:', error);
    return {
      success: false,
      error: 'Failed to parse natural language query',
      details: error.message
    };
  }
}

// Gather data from multiple sources
async function gatherSearchData(queryAnalysis, maxResults) {
  const dataPromises = [];
  
  // Satellite imagery (NASA EPIC)
  if (queryAnalysis.dataTypes.includes('satellite') && queryAnalysis.locations.length > 0) {
    dataPromises.push(
      fetchSatelliteData(queryAnalysis)
        .then(data => ({ source: 'satellite', ...data }))
        .catch(error => ({ source: 'satellite', error: error.message }))
    );
  }

  // Weather data
  if (queryAnalysis.dataTypes.includes('weather') && queryAnalysis.locations.length > 0) {
    dataPromises.push(
      fetchWeatherData(queryAnalysis)
        .then(data => ({ source: 'weather', ...data }))
        .catch(error => ({ source: 'weather', error: error.message }))
    );
  }

  // News data
  if (queryAnalysis.dataTypes.includes('news') && queryAnalysis.locations.length > 0) {
    dataPromises.push(
      fetchNewsData(queryAnalysis)
        .then(data => ({ source: 'news', ...data }))
        .catch(error => ({ source: 'news', error: error.message }))
    );
  }

  // Historical/APOD data
  if (queryAnalysis.dataTypes.includes('historical')) {
    dataPromises.push(
      fetchHistoricalData(queryAnalysis)
        .then(data => ({ source: 'historical', ...data }))
        .catch(error => ({ source: 'historical', error: error.message }))
    );
  }

  return await Promise.all(dataPromises);
}

// Fetch satellite data from NASA EPIC
async function fetchSatelliteData(queryAnalysis) {
  const location = queryAnalysis.locations[0];
  const timeframe = queryAnalysis.timeframe;
  
  if (!NASA_API_KEY) {
    console.log('[Satellite] NASA API key not configured, using demo data');
    return createDemoSatelliteData(location, timeframe);
  }

  // Try multiple dates in the timeframe to find available images
  const datesToTry = generateDateRange(timeframe.start, timeframe.end, 10); // Try up to 10 dates
  
  for (const date of datesToTry) {
    try {
      console.log(`[Satellite] Trying date: ${date}`);
      const epicUrl = `https://api.nasa.gov/EPIC/api/natural/date/${date}`;
      
      const response = await axios.get(epicUrl, {
        params: { api_key: NASA_API_KEY },
        timeout: 10000
      });

      if (response.data && response.data.length > 0) {
        const images = response.data.slice(0, 5); // Limit to 5 most recent
        
        console.log(`[Satellite] Found ${images.length} images for date ${date}`);
        
        return {
          type: 'satellite_imagery',
          location: location.name,
          date: date,
          images: images.map(img => ({
            identifier: img.identifier,
            caption: img.caption || `EPIC view of Earth - ${date}`,
            date: img.date,
            imageUrl: `https://api.nasa.gov/EPIC/archive/natural/${date.replace(/-/g, '/')}/png/${img.image}.png?api_key=${NASA_API_KEY}`,
            thumbnailUrl: `https://api.nasa.gov/EPIC/archive/natural/${date.replace(/-/g, '/')}/thumbs/${img.image}.jpg?api_key=${NASA_API_KEY}`,
            coordinates: {
              lat: img.centroid_coordinates?.lat || location.lat,
              lon: img.centroid_coordinates?.lon || location.lon
            }
          })),
          metadata: {
            totalImages: images.length,
            satellite: 'DSCOVR EPIC',
            resolution: 'Full Earth disk (2048x2048)',
            actualDate: date,
            queryTimeframe: timeframe
          }
        };
      }
    } catch (error) {
      console.log(`[Satellite] No data for date ${date}:`, error.message);
      continue; // Try next date
    }
  }

  // If no EPIC data found, try to get recent satellite imagery from other sources
  console.log('[Satellite] No EPIC data found, using fallback satellite data');
  return createFallbackSatelliteData(location, timeframe);
}

// Generate a range of dates to try
function generateDateRange(startDate, endDate, maxDates) {
  const dates = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  
  // If timeframe is too long, sample dates evenly
  const step = Math.max(1, Math.floor(totalDays / maxDates));
  
  for (let i = 0; i < totalDays && dates.length < maxDates; i += step) {
    const date = new Date(start);
    date.setDate(date.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }
  
  // Always include the end date if not already included
  const endDateStr = end.toISOString().split('T')[0];
  if (!dates.includes(endDateStr)) {
    dates.push(endDateStr);
  }
  
  return dates.reverse(); // Try most recent dates first
}

// Create demo satellite data with better placeholder images
function createDemoSatelliteData(location, timeframe) {
  // Use more realistic Earth imagery URLs for demo
  const earthImageUrls = [
    `https://earthobservatory.nasa.gov/ContentWOC/images/decadal/land_shallow_topo_2048.jpg`,
    `https://earthobservatory.nasa.gov/ContentWOC/images/decadal/land_ocean_ice_cloud_2048.jpg`,
    `https://earthobservatory.nasa.gov/ContentWOC/images/decadal/temperature_3d_2048.jpg`
  ];

  // Generate location-specific imagery
  const locationHash = location.name.toLowerCase().replace(/\s+/g, '');
  const imageIndex = locationHash.charCodeAt(0) % earthImageUrls.length;
  
  const demoImages = [
    {
      identifier: `demo_satellite_${locationHash}_1`,
      caption: `Satellite view of ${location.name} - True color composite (${timeframe.start})`,
      date: timeframe.start,
      imageUrl: earthImageUrls[imageIndex],
      thumbnailUrl: earthImageUrls[imageIndex],
      coordinates: { lat: location.lat, lon: location.lon },
      metadata: {
        sensor: 'Demo Earth Observation',
        resolution: '2048x2048',
        bands: 'RGB composite'
      }
    },
    {
      identifier: `demo_satellite_${locationHash}_2`, 
      caption: `${location.name} region - Multi-spectral satellite imagery (${timeframe.start})`,
      date: timeframe.start,
      imageUrl: earthImageUrls[(imageIndex + 1) % earthImageUrls.length],
      thumbnailUrl: earthImageUrls[(imageIndex + 1) % earthImageUrls.length],
      coordinates: { lat: location.lat, lon: location.lon },
      metadata: {
        sensor: 'Demo Multi-spectral',
        resolution: '2048x2048',
        bands: 'False color composite'
      }
    }
  ];

  return {
    type: 'satellite_imagery',
    location: location.name,
    date: timeframe.start,
    images: demoImages,
    metadata: {
      note: 'Demo satellite imagery using NASA Earth Observatory data - Configure NASA_API_KEY for real-time EPIC data',
      totalImages: demoImages.length,
      satellite: 'Demo Earth Observatory',
      resolution: '2048x2048 (NASA Earth Observatory)',
      source: 'https://earthobservatory.nasa.gov/',
      disclaimer: 'These are sample Earth observation images, not specific to the queried timeframe'
    }
  };
}

// Create fallback satellite data from other NASA sources
async function createFallbackSatelliteData(location, timeframe) {
  // Try multiple fallback strategies in sequence
  
  // 1. get Earth-related APOD imagery
  try {
    const apodResponse = await axios.get('https://api.nasa.gov/planetary/apod', {
      params: {
        api_key: NASA_API_KEY,
        date: timeframe.start
      },
      timeout: 10000
    });

    if (apodResponse.data && apodResponse.data.media_type === 'image') {
      // Check if it's Earth-related imagery
      const earthKeywords = ['earth', 'planet', 'blue marble', 'satellite', 'iss', 'space station'];
      const isEarthRelated = earthKeywords.some(keyword => 
        apodResponse.data.title.toLowerCase().includes(keyword) ||
        apodResponse.data.explanation.toLowerCase().includes(keyword)
      );

      if (isEarthRelated) {
        return {
          type: 'satellite_imagery',
          location: location.name,
          date: timeframe.start,
          images: [{
            identifier: 'nasa_apod_earth_fallback',
            caption: `NASA Earth View: ${apodResponse.data.title}`,
            date: apodResponse.data.date,
            imageUrl: apodResponse.data.url,
            thumbnailUrl: apodResponse.data.url,
            coordinates: { lat: location.lat, lon: location.lon },
            explanation: apodResponse.data.explanation
          }],
          metadata: {
            note: 'NASA APOD Earth imagery - EPIC satellite data not available for this date',
            totalImages: 1,
            satellite: 'NASA APOD',
            resolution: 'High resolution',
            type: 'Earth observation from space'
          }
        };
      }
    }
  } catch (error) {
    console.log('[Satellite] APOD fallback failed:', error.message);
  }

  // 2. get recent EPIC imagery (last 30 days)
  try {
    const recentDate = new Date();
    for (let i = 0; i < 30; i++) {
      recentDate.setDate(recentDate.getDate() - 1);
      const dateStr = recentDate.toISOString().split('T')[0];
      
      try {
        const epicResponse = await axios.get(`https://api.nasa.gov/EPIC/api/natural/date/${dateStr}`, {
          params: { api_key: NASA_API_KEY },
          timeout: 5000
        });

        if (epicResponse.data && epicResponse.data.length > 0) {
          const recentImage = epicResponse.data[0];
          return {
            type: 'satellite_imagery',
            location: location.name,
            date: dateStr,
            images: [{
              identifier: `epic_recent_${dateStr}`,
              caption: `Recent EPIC view of Earth (closest available to ${timeframe.start})`,
              date: recentImage.date,
              imageUrl: `https://api.nasa.gov/EPIC/archive/natural/${dateStr.replace(/-/g, '/')}/png/${recentImage.image}.png?api_key=${NASA_API_KEY}`,
              thumbnailUrl: `https://api.nasa.gov/EPIC/archive/natural/${dateStr.replace(/-/g, '/')}/thumbs/${recentImage.image}.jpg?api_key=${NASA_API_KEY}`,
              coordinates: { lat: location.lat, lon: location.lon }
            }],
            metadata: {
              note: `Recent EPIC imagery from ${dateStr} - No data available for requested timeframe ${timeframe.start}`,
              totalImages: 1,
              satellite: 'DSCOVR EPIC',
              resolution: 'Full Earth disk (2048x2048)',
              actualDate: dateStr,
              requestedDate: timeframe.start
            }
          };
        }
      } catch (err) {
        continue; // next date
      }
    }
  } catch (error) {
    console.log('[Satellite] Recent EPIC fallback failed:', error.message);
  }

  // 3. Final fallback to demo data with real Earth imagery
  console.log('[Satellite] All fallbacks failed, using demo Earth Observatory data');
  return createDemoSatelliteData(location, timeframe);
}

// Fetch weather data
async function fetchWeatherData(queryAnalysis) {
  const results = [];
  
  for (const location of queryAnalysis.locations) {
    try {
      const weatherData = await getHistoricalWeather(
        location.lat || location.coordinates?.lat, 
        location.lon || location.coordinates?.lon, 
        queryAnalysis.timeframe.start
      );
      
      results.push({
        location: location.name,
        coordinates: { lat: location.lat, lon: location.lon },
        weather: weatherData,
        relevance: calculateWeatherRelevance(weatherData, queryAnalysis.events)
      });
    } catch (error) {
      console.error(`Weather fetch failed for ${location.name}:`, error.message);
    }
  }

  return {
    type: 'weather_data',
    timeframe: queryAnalysis.timeframe,
    locations: results,
    eventContext: queryAnalysis.events
  };
}

// Fetch news data
async function fetchNewsData(queryAnalysis) {
  const results = [];
  
  for (const location of queryAnalysis.locations) {
    if (location.iso2) {
      try {
        const newsData = await getNewsForCountry(location.iso2);
        results.push({
          location: location.name,
          iso2: location.iso2,
          news: newsData,
          relevance: calculateNewsRelevance(newsData, queryAnalysis.events, queryAnalysis.timeframe)
        });
      } catch (error) {
        console.error(`News fetch failed for ${location.name}:`, error.message);
      }
    }
  }

  return {
    type: 'news_data',
    timeframe: queryAnalysis.timeframe,
    locations: results,
    eventContext: queryAnalysis.events
  };
}

// Fetch historical/APOD data
async function fetchHistoricalData(queryAnalysis) {
  if (!NASA_API_KEY) {
    throw new Error('NASA API key not configured');
  }

  try {
    const response = await axios.get('https://api.nasa.gov/planetary/apod', {
      params: {
        api_key: NASA_API_KEY,
        start_date: queryAnalysis.timeframe.start,
        end_date: queryAnalysis.timeframe.end
      },
      timeout: 15000
    });

    const apodData = Array.isArray(response.data) ? response.data : [response.data];
    
    return {
      type: 'astronomical_data',
      timeframe: queryAnalysis.timeframe,
      images: apodData.slice(0, 5).map(item => ({
        title: item.title,
        date: item.date,
        explanation: item.explanation,
        imageUrl: item.url,
        mediaType: item.media_type
      })),
      metadata: {
        source: 'NASA APOD',
        totalImages: apodData.length
      }
    };
  } catch (error) {
    throw new Error(`APOD data fetch failed: ${error.message}`);
  }
}

// Calculate weather relevance to events
function calculateWeatherRelevance(weatherData, events) {
  if (!events || events.length === 0) return 'medium';
  
  for (const event of events) {
    if (event.type === 'weather') {
      // Add logic to match weather data to event type
      return 'high';
    }
  }
  return 'low';
}

// Calculate news relevance to events and timeframe
function calculateNewsRelevance(newsData, events, timeframe) {
  if (!events || events.length === 0) return 'medium';
  
  for (const event of events) {
    if (event.type === 'political' || event.type === 'conflict' || event.type === 'health') {
      return 'high';
    }
  }
  return 'medium';
}

// Generate overall analysis
async function generateOverallAnalysis(originalQuery, queryAnalysis, searchResults) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const validResults = searchResults.filter(result => !result.error);
  
  if (validResults.length === 0) {
    throw new Error('No valid data available for analysis');
  }

  // Create a comprehensive summary
  const dataSummary = validResults.map(result => {
    switch (result.source) {
      case 'satellite':
        return `Satellite imagery: ${result.images?.length || 0} images from ${result.date || 'various dates'}`;
      case 'weather':
        return `Weather data: Historical weather available for ${result.locations?.length || 0} locations.`;
      case 'news':
        return `News data: Found news articles for ${result.locations?.length || 0} regions.`;
      case 'historical':
        return `Historical data: ${result.images?.length || 0} astronomical images from NASA's APOD.`;
      default:
        return `${result.source}: Data is available.`;
    }
  }).join('\\n- ');

  const primaryEvent = queryAnalysis.events && queryAnalysis.events.length > 0
    ? queryAnalysis.events[0].keywords.join(', ')
    : 'general conditions';

  const prompt = `
**Objective:** Provide an expert analysis for the search query, synthesizing the provided data into a coherent narrative.

**Original Query:** "${originalQuery}"

**Parsed Query Context:**
\`\`\`json
${JSON.stringify(queryAnalysis, null, 2)}
\`\`\`
*The key event to focus on is "${primaryEvent}".*

**Available Data Summary:**
- ${dataSummary}

---

**Analysis Task (400-500 words):**

As a world-class data analyst, synthesize the available data to address the original query's intent. Structure your response as plain text. Do not use any markdown formatting like '###' or '**'.

Key Insights
Begin with a 2-3 sentence executive summary. What are the most critical, non-obvious conclusions you can draw from the intersection of the satellite, weather, and news data regarding the specified event?

Event Breakdown
1.  Event Context: Based on the query, describe the event in detail.
2.  Satellite Evidence: What do the satellite images reveal about the event's impact on the landscape? (e.g., visible floodwaters, fire scars, changes in vegetation).
3.  Weather Corroboration: How does the historical weather data confirm or add context to the event? (e.g., extreme temperatures during a heatwave, heavy precipitation during a flood).
4.  On-the-Ground Perspective: What do the news headlines and articles tell us about the human and societal impact of the event?

Cause & Effect Analysis
Based on the combined data, analyze the likely causal chain. What factors likely led to the event? What were the primary environmental and societal effects observed in the data?

Conclusion & Further Questions
Summarize the findings and pose 2-3 insightful follow-up questions for deeper investigation.
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "You are a world-class data analyst and synthesist. Your expertise is in connecting disparate sources of information—satellite imagery, weather patterns, and geopolitical news—and inferring causal relationships to form a single, coherent narrative. Your tone is that of a confident expert providing a briefing: analytical, insightful, and direct. You NEVER refer to the 'user' or the person asking the question. You generate plain text only, without any markdown formatting like '###' or '**'."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.4,
    max_tokens: 800
  });

  return {
    analysis: response.choices[0].message.content,
    confidence: queryAnalysis.confidence,
    dataSourcesUsed: validResults.map(r => r.source),
    generatedAt: new Date().toISOString()
  };
}

// GET endpoint with documentation
router.get('/', (req, res) => {
  res.json({
    endpoint: '/search',
    method: 'POST',
    description: 'Natural Language Search Across Time and Space - Ask complex questions about satellite imagery, weather, and world events',
    version: '1.0',
    features: [
      'GPT-4 powered natural language parsing',
      'Multi-source data aggregation',
      'Satellite imagery from NASA EPIC',
      'Historical weather data',
      'News and event correlation',
      'Comprehensive AI analysis',
      'Intelligent query understanding'
    ],
    examples: [
      {
        query: "Show me Europe during 2023 heatwave",
        expectedSources: ['satellite', 'weather', 'news']
      },
      {
        query: "What did Nigeria look like during 2020 floods?",
        expectedSources: ['satellite', 'weather', 'news']
      },
      {
        query: "Find images of Asia during the pandemic in 2020",
        expectedSources: ['satellite', 'news', 'historical']
      },
      {
        query: "Show me drought conditions in Australia last summer",
        expectedSources: ['satellite', 'weather', 'news']
      }
    ],
    parameters: {
      query: {
        type: 'string',
        required: true,
        description: 'Natural language question about time, location, and events',
        examples: [
          "Show me Europe during 2023 heatwave",
          "What did Nigeria look like during floods?",
          "Find satellite images of California wildfires"
        ]
      },
      maxResults: {
        type: 'number',
        required: false,
        default: 10,
        description: 'Maximum number of results per data source'
      },
      includeAnalysis: {
        type: 'boolean',
        required: false,
        default: true,
        description: 'Whether to generate comprehensive AI analysis'
      }
    },
    supportedEntities: {
      locations: ['Countries', 'Continents', 'Major cities', 'Regions'],
      timeframes: ['Specific years', 'Seasons', 'Date ranges', 'Relative periods'],
      events: ['Natural disasters', 'Weather events', 'Political events', 'Health crises'],
      dataTypes: ['Satellite imagery', 'Weather data', 'News', 'Historical records']
    },
    dataSources: {
      satellite: 'NASA EPIC (Earth Polychromatic Imaging Camera)',
      weather: 'Open-Meteo Historical Weather API',
      news: 'Various news aggregation services',
      historical: 'NASA Astronomy Picture of the Day (APOD)'
    }
  });
});

module.exports = router;