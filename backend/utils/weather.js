const axios = require('axios');

const weatherCodeMap = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    56: 'Light freezing drizzle',
    57: 'Dense freezing drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Light freezing rain',
    67: 'Heavy freezing rain',
    71: 'Slight snow fall',
    73: 'Moderate snow fall',
    75: 'Heavy snow fall',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail',
};

function getWeatherDescription(code) {
    return weatherCodeMap[code] || 'Unknown weather';
}

async function getHistoricalWeather(lat, lon, date) {
  if (!lat || !lon || !date) {
    throw new Error('Latitude, longitude, and date are required.');
  }

  const apiUrl = `https://archive-api.open-meteo.com/v1/archive`;
  try {
    const response = await axios.get(apiUrl, {
      params: {
        latitude: lat,
        longitude: lon,
        start_date: date,
        end_date: date,
        daily: 'temperature_2m_max,temperature_2m_min,weathercode,uv_index_max',
        timezone: 'auto'
      }
    });

    const daily = response.data.daily;
    if (!daily || !daily.time || daily.time.length === 0) {
      return 'No weather data available';
    }

    const weatherDesc = getWeatherDescription(daily.weathercode[0]);
    const maxTemp = Math.round(daily.temperature_2m_max[0]);
    const minTemp = Math.round(daily.temperature_2m_min[0]);
    const uvIndex = Math.round(daily.uv_index_max[0]);

    return `High: ${maxTemp}°C, Low: ${minTemp}°C, ${weatherDesc}, UV Index ${uvIndex}`;
  } catch (error) {
    console.error('Open-Meteo API Error:', error.message);
    // Return a fallback message if the API call fails
    return 'Could not retrieve weather data';
  }
}

module.exports = { getHistoricalWeather };
