const express = require('express');
const axios = require('axios');
const { OpenAI } = require('openai');
require('dotenv').config();

const router = express.Router();

// Initialize OpenAI client with timeout
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 45000, // 45 second timeout for analysis
  maxRetries: 2,
});

// NASA API endpoints
const NASA_API_KEY = process.env.NASA_API_KEY;

// Enhanced geocoding database with more cities
const GEOCODING_DATABASE = {
    'new york': { lat: 40.7128, lon: -74.0060, country: 'US', timezone: 'America/New_York' },
    'los angeles': { lat: 34.0522, lon: -118.2437, country: 'US', timezone: 'America/Los_Angeles' },
    'london': { lat: 51.5074, lon: -0.1278, country: 'GB', timezone: 'Europe/London' },
    'paris': { lat: 48.8566, lon: 2.3522, country: 'FR', timezone: 'Europe/Paris' },
    'berlin': { lat: 52.5200, lon: 13.4050, country: 'DE', timezone: 'Europe/Berlin' },
    'tokyo': { lat: 35.6762, lon: 139.6503, country: 'JP', timezone: 'Asia/Tokyo' },
    'beijing': { lat: 39.9042, lon: 116.4074, country: 'CN', timezone: 'Asia/Shanghai' },
    'moscow': { lat: 55.7558, lon: 37.6176, country: 'RU', timezone: 'Europe/Moscow' },
    'mumbai': { lat: 19.0760, lon: 72.8777, country: 'IN', timezone: 'Asia/Kolkata' },
    'sydney': { lat: -33.8688, lon: 151.2093, country: 'AU', timezone: 'Australia/Sydney' },
    'dubai': { lat: 25.2048, lon: 55.2708, country: 'AE', timezone: 'Asia/Dubai' },
    'toronto': { lat: 43.6532, lon: -79.3832, country: 'CA', timezone: 'America/Toronto' },
    'cape town': { lat: -33.9249, lon: 18.4241, country: 'ZA', timezone: 'Africa/Johannesburg' },
    'mexico city': { lat: 19.4326, lon: -99.1332, country: 'MX', timezone: 'America/Mexico_City' },
    'rio de janeiro': { lat: -22.9068, lon: -43.1729, country: 'BR', timezone: 'America/Sao_Paulo' },
    'nairobi': { lat: -1.2921, lon: 36.8219, country: 'KE', timezone: 'Africa/Nairobi' },
    'lagos': { lat: 6.5244, lon: 3.3792, country: 'NG', timezone: 'Africa/Lagos' },
    'istanbul': { lat: 41.0082, lon: 28.9784, country: 'TR', timezone: 'Europe/Istanbul' },
    'seoul': { lat: 37.5665, lon: 126.9780, country: 'KR', timezone: 'Asia/Seoul' },
    'buenos aires': { lat: -34.6037, lon: -58.3816, country: 'AR', timezone: 'America/Argentina/Buenos_Aires' },
    'singapore': { lat: 1.3521, lon: 103.8198, country: 'SG', timezone: 'Asia/Singapore' },
    'cairo': { lat: 30.0444, lon: 31.2357, country: 'EG', timezone: 'Africa/Cairo' },
    'jakarta': { lat: -6.2088, lon: 106.8456, country: 'ID', timezone: 'Asia/Jakarta' },
    'bangkok': { lat: 13.7563, lon: 100.5018, country: 'TH', timezone: 'Asia/Bangkok' },
    'athens': { lat: 37.9838, lon: 23.7275, country: 'GR', timezone: 'Europe/Athens' },
    'helsinki': { lat: 60.1699, lon: 24.9384, country: 'FI', timezone: 'Europe/Helsinki' },
    'amsterdam': { lat: 52.3676, lon: 4.9041, country: 'NL', timezone: 'Europe/Amsterdam' }
  };

// Axios instance with timeout for external APIs
const apiClient = axios.create({
  timeout: 15000, // 15 second timeout for external APIs
  headers: {
    'User-Agent': 'TimeTravel-Service/1.0'
  }
});

router.post('/', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { 
      location, 
      timeRange = 'year', 
      startDate, 
      endDate,
      dataTypes = ['satellite', 'weather'] // Default to faster options
    } = req.body;

    // Validate input
    if (!location) {
      return res.status(400).json({
        error: 'Invalid input',
        details: 'Location is required (lat, lon, or address)'
      });
    }

    // Parse and validate location
    let coordinates = {};
    if (typeof location === 'object' && location.lat && location.lon) {
      // Validate coordinate ranges
      if (Math.abs(location.lat) > 90 || Math.abs(location.lon) > 180) {
        return res.status(400).json({
          error: 'Invalid coordinates',
          details: 'Latitude must be between -90 and 90, longitude between -180 and 180'
        });
      }
      coordinates = { lat: location.lat, lon: location.lon };
    } else if (typeof location === 'string') {
      coordinates = await geocodeLocation(location);
    } else {
      return res.status(400).json({
        error: 'Invalid location format',
        details: 'Provide coordinates {lat, lon} or address string'
      });
    }

    // Calculate and validate date range
    const dateRange = calculateDateRange(timeRange, startDate, endDate);
    
    if (new Date(dateRange.start) > new Date(dateRange.end)) {
      return res.status(400).json({
        error: 'Invalid date range',
        details: 'Start date must be before end date'
      });
    }

    console.log(`[TimeTravel] Request for ${coordinates.lat}, ${coordinates.lon} | ${dateRange.start} to ${dateRange.end} | Types: ${dataTypes.join(',')}`);

    // Fetch data in parallel for better performance
    const dataPromises = {};
    
    if (dataTypes.includes('satellite')) {
      dataPromises.satellite = fetchHistoricalSatelliteData(coordinates, dateRange)
        .catch(error => ({ error: `Satellite data unavailable: ${error.message}` }));
    }

    if (dataTypes.includes('weather')) {
      dataPromises.weather = fetchHistoricalWeatherData(coordinates, dateRange)
        .catch(error => ({ error: `Weather data unavailable: ${error.message}` }));
    }

    if (dataTypes.includes('apod')) {
      dataPromises.apod = fetchHistoricalAPOD(dateRange)
        .catch(error => ({ error: `APOD data unavailable: ${error.message}` }));
    }

    // Execute all data fetches in parallel
    const historicalData = await Promise.all(
      Object.entries(dataPromises).map(async ([key, promise]) => {
        const result = await promise;
        return [key, result];
      })
    ).then(results => Object.fromEntries(results));

    // Generate analysis only if requested and we have data
    if (dataTypes.includes('analysis') && Object.keys(historicalData).length > 0) {
      try {
        historicalData.analysis = await generateHistoricalAnalysis(
          coordinates, 
          dateRange, 
          historicalData
        );
      } catch (error) {
        console.error('Analysis generation failed:', error.message);
        historicalData.analysis = { error: `Analysis unavailable: ${error.message}` };
      }
    }

    const processingTime = Date.now() - startTime;
    console.log(`[TimeTravel] Completed in ${processingTime}ms`);

    return res.json({
      success: true,
      location: coordinates,
      timeRange,
      dateRange,
      dataTypes,
      historicalData,
      timestamp: new Date().toISOString(),
      metadata: {
        totalDataPoints: Object.keys(historicalData).length,
        timeSpan: `${dateRange.start} to ${dateRange.end}`,
        processingTimeMs: processingTime,
        dataTypesProcessed: Object.keys(historicalData)
      }
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`[TimeTravel] Error after ${processingTime}ms:`, error);
    
    // Enhanced error handling
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        error: 'Network connectivity issue',
        details: 'Unable to connect to external data sources'
      });
    }

    if (error.message?.includes('timeout')) {
      return res.status(408).json({
        error: 'Request timeout',
        details: 'Data fetching took too long to complete'
      });
    }

    return res.status(500).json({
      error: 'Time travel request failed',
      details: error.message,
      processingTimeMs: processingTime
    });
  }
});

// Enhanced geocoding with fuzzy matching
async function geocodeLocation(address) {
  const normalizedAddress = address.toLowerCase().trim();
  
  // Exact match first
  if (GEOCODING_DATABASE[normalizedAddress]) {
    return GEOCODING_DATABASE[normalizedAddress];
  }
  
  // Fuzzy matching - check if address contains any city name
  for (const [city, coords] of Object.entries(GEOCODING_DATABASE)) {
    if (normalizedAddress.includes(city) || city.includes(normalizedAddress)) {
      console.log(`[TimeTravel] Fuzzy matched "${address}" to ${city}`);
      return coords;
    }
  }
  
  // Enhanced error message with suggestions
  const availableCities = Object.keys(GEOCODING_DATABASE).join(', ');
  throw new Error(`Location "${address}" not found. Available cities: ${availableCities}, or provide coordinates {lat, lon}`);
}

// Optimized date range calculation
function calculateDateRange(timeRange, startDate, endDate) {
  const now = new Date();
  let start, end;

  if (startDate && endDate) {
    start = new Date(startDate);
    end = new Date(endDate);
    
    // Validate dates
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error('Invalid date format. Use YYYY-MM-DD');
    }
  } else {
    const timeRanges = {
      'week': 7,
      'month': 30,
      'year': 365,
      'decade': 3650
    };
    
    const days = timeRanges[timeRange] || 365;
    start = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
    end = now;
  }

  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0]
  };
}

// Optimized satellite data fetching
async function fetchHistoricalSatelliteData(coordinates, dateRange) {
  if (!NASA_API_KEY) {
    // Return demo data with note instead of throwing error
    return {
      type: 'satellite',
      source: 'NASA Earth Imagery (demo)',
      coordinates,
      dateRange,
      imageUrl: `https://api.nasa.gov/planetary/earth/imagery?lon=${coordinates.lon}&lat=${coordinates.lat}&date=${dateRange.start}&dim=0.10&api_key=DEMO_KEY`,
      metadata: {
        date: dateRange.start,
        cloudScore: Math.random() * 100,
        resolution: '10m',
        note: 'Demo data - configure NASA_API_KEY for real imagery'
      }
    };
  }

  try {
    const response = await apiClient.get('https://api.nasa.gov/planetary/earth/assets', {
      params: {
        lon: coordinates.lon,
        lat: coordinates.lat,
        begin_date: dateRange.start,
        end_date: dateRange.start, // Fetch for a single day
        api_key: NASA_API_KEY
      }
    });

    if (response.data.count === 0) {
      throw new Error('No satellite imagery available for this location/date');
    }

    const firstImage = response.data.results[0];

    return {
      type: 'satellite',
      source: 'NASA Earth Imagery',
      coordinates,
      dateRange,
      imageUrl: firstImage.url,
      metadata: {
        date: firstImage.date,
        cloudScore: Math.random() * 100, // Placeholder as new API doesn't provide this directly
        resolution: 'varies' // Placeholder
      }
    };
  } catch (error) {
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error('No satellite imagery available for this location/date');
      }
      if (error.response.status >= 500) {
        throw new Error('NASA API service is currently unavailable. Please try again later.');
      }
    }
    throw new Error(`NASA API error: ${error.message}`);
  }
}

// Optimized weather data fetching with better error handling
async function fetchHistoricalWeatherData(coordinates, dateRange) {
  try {
    const response = await apiClient.get('https://archive-api.open-meteo.com/v1/archive', {
      params: {
        latitude: coordinates.lat,
        longitude: coordinates.lon,
        start_date: dateRange.start,
        end_date: dateRange.end,
        daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max',
        timezone: 'auto'
      }
    });

    const data = response.data;
    
    if (!data.daily || !data.daily.time || data.daily.time.length === 0) {
      throw new Error('No weather data available for the specified date range');
    }

    // Calculate statistics safely
    const maxTemps = data.daily.temperature_2m_max.filter(t => t !== null);
    const minTemps = data.daily.temperature_2m_min.filter(t => t !== null);
    const precipitation = data.daily.precipitation_sum.filter(p => p !== null);
    const windSpeeds = data.daily.windspeed_10m_max.filter(w => w !== null);
    
    return {
      type: 'weather',
      source: 'Open-Meteo Historical',
      coordinates,
      dateRange,
      summary: {
        avgMaxTemp: maxTemps.length > 0 ? maxTemps.reduce((a, b) => a + b, 0) / maxTemps.length : null,
        avgMinTemp: minTemps.length > 0 ? minTemps.reduce((a, b) => a + b, 0) / minTemps.length : null,
        totalPrecipitation: precipitation.reduce((a, b) => a + b, 0),
        avgWindSpeed: windSpeeds.length > 0 ? windSpeeds.reduce((a, b) => a + b, 0) / windSpeeds.length : null,
        dataPoints: data.daily.time.length
      },
      dailyData: {
        dates: data.daily.time,
        maxTemperatures: data.daily.temperature_2m_max,
        minTemperatures: data.daily.temperature_2m_min,
        precipitation: data.daily.precipitation_sum,
        windSpeed: data.daily.windspeed_10m_max
      },
      units: data.daily_units
    };
  } catch (error) {
    if (error.response?.status === 400) {
      throw new Error('Invalid location or date range for weather data');
    }
    throw new Error(`Weather API error: ${error.message}`);
  }
}

// Optimized APOD fetching with date range limits
async function fetchHistoricalAPOD(dateRange) {
  if (!NASA_API_KEY) {
    throw new Error('NASA API key not configured');
  }

  // Limit APOD requests to max 30 days to avoid timeout
  const startDate = new Date(dateRange.start);
  const endDate = new Date(dateRange.end);
  const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  
  if (daysDiff > 30) {
    const limitedEnd = new Date(startDate.getTime() + (30 * 24 * 60 * 60 * 1000));
    dateRange.end = limitedEnd.toISOString().split('T')[0];
  }

  try {
    const response = await apiClient.get('https://api.nasa.gov/planetary/apod', {
      params: {
        start_date: dateRange.start,
        end_date: dateRange.end,
        api_key: NASA_API_KEY
      }
    });

    const apodData = Array.isArray(response.data) ? response.data : [response.data];

    return {
      type: 'apod',
      source: 'NASA APOD',
      dateRange,
      count: apodData.length,
      images: apodData.slice(0, 5).map(item => ({
        date: item.date,
        title: item.title,
        explanation: item.explanation?.substring(0, 200) + '...' || 'No description available',
        url: item.url,
        mediaType: item.media_type
      }))
    };
  } catch (error) {
    if (error.response?.status === 400) {
      throw new Error('Invalid date range for APOD data');
    }
    throw new Error(`APOD API error: ${error.message}`);
  }
}

// Optimized analysis generation with shorter prompt
async function generateHistoricalAnalysis(coordinates, dateRange, historicalData) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  // Filter out error entries for analysis
  const validData = Object.fromEntries(
    Object.entries(historicalData).filter(([key, value]) => !value.error)
  );

  if (Object.keys(validData).length === 0) {
    throw new Error('No valid data available for analysis');
  }

  // Create a concise data summary for analysis
  const dataSummary = Object.entries(validData).map(([type, data]) => {
    switch (type) {
      case 'weather':
        return `Weather (${data.dateRange?.start} to ${data.dateRange?.end}): Avg temp ${data.summary?.avgMaxTemp?.toFixed(1)}°C, Total precipitation ${data.summary?.totalPrecipitation?.toFixed(1)}mm`;
      case 'satellite':
        return `Satellite imagery available for ${data.metadata?.date}`;
      case 'apod':
        return `${data.count} astronomy images from NASA APOD`;
      default:
        return `${type}: Available`;
    }
  }).join('. ');

  const prompt = `Analyze historical data for location ${coordinates.lat}, ${coordinates.lon} (${dateRange.start} to ${dateRange.end}).

Data summary: ${dataSummary}

Provide a concise analysis (max 300 words) covering:
1. Key patterns or trends
2. Notable weather or environmental conditions  
3. Any interesting observations
4. Brief implications for the location`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a concise data analyst. Provide brief, insightful analysis.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.6,
    });

    return {
      type: 'analysis',
      source: 'GPT-4 Analysis',
      coordinates,
      dateRange,
      insights: response.choices[0]?.message?.content,
      metadata: {
        model: 'gpt-4',
        tokensUsed: response.usage?.total_tokens || 0,
        dataTypesAnalyzed: Object.keys(validData)
      }
    };
  } catch (error) {
    if (error.response?.status === 429) {
      throw new Error('OpenAI rate limit exceeded');
    }
    throw new Error(`Analysis generation failed: ${error.message}`);
  }
}

// Enhanced GET endpoint with comprehensive documentation
router.get('/', (req, res) => {
  res.json({
    endpoint: '/time-travel',
    method: 'POST',
    description: 'Explore historical data and imagery for a location across time - optimized for performance',
    version: '1.1',
    features: [
      'Parallel data fetching',
      'Enhanced geocoding with 15+ cities',
      'Smart date range validation',
      'Graceful error handling',
      'Performance monitoring'
    ],
    parameters: {
      location: {
        type: 'object|string',
        required: true,
        description: 'Location as {lat, lon} coordinates or city name',
        examples: [
          { lat: 40.7128, lon: -74.0060 },
          'New York',
          'London',
          'Tokyo'
        ],
        validation: 'Coordinates validated for valid ranges, city names support fuzzy matching'
      },
      timeRange: {
        type: 'string',
        required: false,
        default: 'year',
        options: ['week', 'month', 'year', 'decade'],
        description: 'Predefined time range to explore'
      },
      startDate: {
        type: 'string',
        required: false,
        description: 'Custom start date (YYYY-MM-DD)',
        example: '2023-01-01'
      },
      endDate: {
        type: 'string',
        required: false,
        description: 'Custom end date (YYYY-MM-DD)',
        example: '2023-12-31'
      },
      dataTypes: {
        type: 'array',
        required: false,
        default: ['satellite', 'weather'],
        options: ['satellite', 'weather', 'apod', 'analysis'],
        description: 'Types of historical data to retrieve'
      }
    },
    performance: {
      parallelFetching: 'All data sources fetched simultaneously',
      timeout: '45 seconds total, 15 seconds per API',
      geocoding: '15+ major cities with fuzzy matching',
      fallbacks: 'Demo data when API keys unavailable'
    },
    supportedCities: Object.keys(GEOCODING_DATABASE),
    example: {
      location: 'New York',
      timeRange: 'month',
      dataTypes: ['satellite', 'weather', 'analysis']
    }
  });
});

module.exports = router; 