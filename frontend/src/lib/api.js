const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export class ApiError extends Error {
  constructor(status, message, fieldErrors) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

function getToken() {
  return localStorage.getItem('mci_token');
}

export function setToken(token) {
  if (token) localStorage.setItem('mci_token', token);
  else localStorage.removeItem('mci_token');
}

export function getStoredEmail() {
  return localStorage.getItem('mci_email');
}

export function setStoredEmail(email) {
  if (email) localStorage.setItem('mci_email', email);
  else localStorage.removeItem('mci_email');
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    let fieldErrors;
    try {
      const body = await res.json();
      message = body.message || message;
      fieldErrors = body.fieldErrors;
    } catch {
      // ignore parse errors on error bodies
    }
    throw new ApiError(res.status, message, fieldErrors);
  }

  if (res.status === 204) return undefined;
  return res.json();
}

// --- API calls ---
export const api = {
  register: (email, password) =>
    request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  login: (email, password) =>
    request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  search: (query, type, limit = 20) =>
    request(`/api/search?query=${encodeURIComponent(query)}&type=${type}&limit=${limit}`),

  getLibrary: () => request('/api/library'),

  addToLibrary: (item) =>
    request('/api/library', {
      method: 'POST',
      body: JSON.stringify(item),
    }),

  updateLibraryItem: (id, item) =>
    request(`/api/library/${id}`, {
      method: 'PUT',
      body: JSON.stringify(item),
    }),

  deleteLibraryItem: (id) => request(`/api/library/${id}`, { method: 'DELETE' }),

  getAnalytics: () => request('/api/analytics'),

  getAiInsights: () => request('/api/ai/insights'),
};
