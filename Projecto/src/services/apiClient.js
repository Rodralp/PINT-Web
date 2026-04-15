const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';
const REQUEST_TIMEOUT_MS = 5000;

const buildUrl = (path) => {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  return `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
};

const readResponseBody = async (response) => {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }

  return response.text();
};

const request = async (path, options = {}) => {
  const controller = new AbortController();
  const timeoutId = globalThis.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(buildUrl(path), {
      ...options,
      signal: controller.signal,
    });

    const data = await readResponseBody(response);

    if (!response.ok) {
      const message = typeof data === 'object' && data?.message ? data.message : `HTTP ${response.status}`;
      throw new Error(message);
    }

    return {
      data,
      status: response.status,
    };
  } finally {
    globalThis.clearTimeout(timeoutId);
  }
};

const apiClient = {
  get(path) {
    return request(path, { method: 'GET' });
  },

  post(path, body) {
    return request(path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body ?? {}),
    });
  },

  put(path, body) {
    return request(path, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body ?? {}),
    });
  },

  delete(path) {
    return request(path, { method: 'DELETE' });
  },
};

export default apiClient;
