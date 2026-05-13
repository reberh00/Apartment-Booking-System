const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

async function request(path, options = {}, token) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.error || 'Došlo je do greške pri API pozivu.');
  }

  return data;
}

export const api = {
  get: (path, token) => request(path, { method: 'GET' }, token),
  post: (path, body, token) => request(path, { method: 'POST', body: JSON.stringify(body) }, token),
  patch: (path, body, token) => request(path, { method: 'PATCH', body: JSON.stringify(body) }, token),
  put: (path, body, token) => request(path, { method: 'PUT', body: JSON.stringify(body) }, token),
  del: (path, token) => request(path, { method: 'DELETE' }, token),
};
