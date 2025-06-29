import { useState, useEffect, useCallback } from 'react';
import api from '../api';

const cache = new Map();

export const useApi = (endpoint, params = {}, trigger = true) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    const method = params.method || 'GET';
    const body = params.body || {};
    const getParams = method === 'GET' ? params : {};

    const cacheKey = `${endpoint}?${new URLSearchParams(getParams).toString()}`;
    
    if (method === 'GET' && cache.has(cacheKey)) {
      setData(cache.get(cacheKey));
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      let response;
      if (method === 'POST') {
        response = await api.post(endpoint, body);
      } else {
        response = await api.get(endpoint, { params: getParams });
      }
      
      if (method === 'GET') {
        cache.set(cacheKey, response.data);
      }
      setData(response.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [endpoint, JSON.stringify(params)]);

  useEffect(() => {
    if (trigger) {
      fetchData();
    }
  }, [fetchData, trigger]);

  return { data, loading, error, refetch: fetchData };
};

// Specific API call hooks can be defined here for cleaner use in components

export const getApod = async (params) => {
  const cacheKey = `/apod?${new URLSearchParams(params).toString()}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);
  const response = await api.get('/apod', { params });
  cache.set(cacheKey, response.data);
  return response.data;
};

export const getEpicImages = async (params) => {
  const cacheKey = `/epic?${new URLSearchParams(params).toString()}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);
  const response = await api.get('/epic', { params });
  cache.set(cacheKey, response.data);
  return response.data;
};

export const getTimeTravelImage = async (params) => {
  const cacheKey = `/time-travel?${new URLSearchParams(params).toString()}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);
  const response = await api.get('/time-travel', { params });
  cache.set(cacheKey, response.data);
  return response.data;
};

export const searchImages = async (query) => {
  const response = await api.post('/search', { query });
  return response.data;
};

export const explainImage = async (imageUrl) => {
  const response = await api.post('/explain', { imageUrl });
  return response.data;
};

export const compareImages = async (imageUrls) => {
  const response = await api.post('/image-comparator', { images: imageUrls });
  return response.data;
};

export const getWeatherSummary = async (location) => {
  const response = await api.post('/weather-summary', { location });
  return response.data;
};

export const getContextualInfo = async (location) => {
  const response = await api.post('/contextualize', { location });
  return response.data;
};

export const sendEmailBriefing = async (email, preferences) => {
  const response = await api.post('/briefing', { email, preferences });
  return response.data;
};

export const detectCountries = async (imageUrl) => {
  const response = await api.post('/vision/detect-countries', { imageUrl });
  return response.data;
};

export const sendApodEmailToUser = async (email, apodData) => {
  const response = await api.post('/send-email/apod', { email, apodData });
  return response.data;
};

export const sendWeatherEmailToUser = async (email, weatherData) => {
  const response = await api.post('/send-email/weather', { email, weatherData });
  return response.data;
}; 