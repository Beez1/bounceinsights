import { useState, useEffect, useCallback } from 'react';
import api from '../api';

const cache = new Map();

export const useApi = (endpoint, params = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!endpoint) {
      setLoading(false);
      setData(null);
      return;
    }

    const controller = new AbortController();

    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await api.get(endpoint, {
          params,
          signal: controller.signal,
        });
        setData(response.data);
      } catch (err) {
        if (err.name !== 'CanceledError') {
          setError(err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, [endpoint, JSON.stringify(params)]);

  return { data, loading, error };
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
  const response = await api.post('/compare', { imageUrls });
  return response.data;
};

export const getWeatherSummary = async (location) => {
  const response = await api.post('/weather', { location });
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