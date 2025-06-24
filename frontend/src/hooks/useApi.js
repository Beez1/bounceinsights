import { useState, useCallback } from 'react';
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (config) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api(config);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    request,
  };
};

// Feature-specific hooks
export const useApod = () => {
  const { loading, error, request } = useApi();

  const fetchApod = useCallback(async () => {
    return request({ method: 'GET', url: '/apod' });
  }, [request]);

  return { loading, error, fetchApod };
};

export const useEpic = () => {
  const { loading, error, request } = useApi();

  const fetchEpic = useCallback(async (date, lat, lon, radius) => {
    return request({
      method: 'GET',
      url: '/epic',
      params: { date, lat, lon, radius },
    });
  }, [request]);

  return { loading, error, fetchEpic };
};

export const useSearch = () => {
  const { loading, error, request } = useApi();

  const search = useCallback(async (query) => {
    return request({
      method: 'POST',
      url: '/search',
      data: { query },
    });
  }, [request]);

  return { loading, error, search };
};

export const useExplain = () => {
  const { loading, error, request } = useApi();

  const explain = useCallback(async (imageUrl) => {
    return request({
      method: 'POST',
      url: '/explain',
      data: { imageUrl },
    });
  }, [request]);

  return { loading, error, explain };
};

export const useWeatherSummary = () => {
  const { loading, error, request } = useApi();

  const getWeatherSummary = useCallback(async (imageUrl, date, countries) => {
    return request({
      method: 'POST',
      url: '/weather-summary',
      data: { imageUrl, date, countries },
    });
  }, [request]);

  return { loading, error, getWeatherSummary };
};

export const useTimeTravel = () => {
  const { loading, error, request } = useApi();

  const getTimeTravel = useCallback(async (location, range, dataTypes) => {
    return request({
      method: 'POST',
      url: '/time-travel',
      data: { location, range, dataTypes },
    });
  }, [request]);

  return { loading, error, getTimeTravel };
};

export const useComparator = () => {
  const { loading, error, request } = useApi();

  const compare = useCallback(async (images, type) => {
    return request({
      method: 'POST',
      url: '/image-comparator',
      data: { images, type },
    });
  }, [request]);

  return { loading, error, compare };
};

export const useBriefing = () => {
  const { loading, error, request } = useApi();

  const sendBriefing = useCallback(async (imageUrl, email, date, countries) => {
    return request({
      method: 'POST',
      url: '/email-briefing',
      data: { imageUrl, email, date, countries },
    });
  }, [request]);

  return { loading, error, sendBriefing };
}; 