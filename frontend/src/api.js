import axios from 'axios';

const api = axios.create({
  baseURL: 'https://bounceinsights.onrender.com',
});

export default api; 