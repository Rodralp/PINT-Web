import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';
const REQUEST_TIMEOUT_MS = 5000;

const buildUrl = (path) => {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  return `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
};

const http = axios.create({
  timeout: REQUEST_TIMEOUT_MS,
});

const request = async (path, options = {}) => {
  try {
    const response = await http({
      url: buildUrl(path),
      ...options,
    });

    return {
      data: typeof response.data === 'undefined' ? null : response.data,
      status: response.status,
    };
  } catch (error) {
    const message = error?.response?.data?.message || error?.message || 'HTTP request failed';
    throw new Error(message);
  }
};

const withJsonHeaders = {
  headers: {
    'Content-Type': 'application/json',
  },
};

const apiClient = {
  get(path) {
    return request(path, { method: 'GET' });
  },

  post(path, body) {
    return request(path, { method: 'POST', data: body ?? {}, ...withJsonHeaders });
  },

  put(path, body) {
    return request(path, { method: 'PUT', data: body ?? {}, ...withJsonHeaders });
  },

  delete(path) {
    return request(path, { method: 'DELETE' });
  },
};

export default apiClient;
