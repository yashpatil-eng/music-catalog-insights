const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export class ApiError extends Error {
  status: number;
  fieldErrors?: Record<string, string>;

  constructor(status: number, message: string, fieldErrors?: Record<string, string>) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

function getToken(): string | null {
  return localStorage.getItem('mci_token');
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem('mci_token', token);
  else localStorage.removeItem('mci_token');
}

export function getStoredEmail(): string | null {
  return localStorage.getItem('mci_email');
}

export function setStoredEmail(email: string | null) {
  if (email) localStorage.setItem('mci_email', email);
  else localStorage.removeItem('mci_email');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    let fieldErrors: Record<string, string> | undefined;
    try {
      const body = await res.json();
      message = body.message || message;
      fieldErrors = body.fieldErrors;
    } catch {
      // ignore parse errors on error bodies
    }
    throw new ApiError(res.status, message, fieldErrors);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// --- Types ---
export interface AuthResponse {
  token: string;
  email: string;
}

export interface ItunesResult {
  collectionId?: number;
  trackId?: number;
  artistId?: number;
  collectionName?: string;
  trackName?: string;
  artistName: string;
  releaseDate?: string;
  primaryGenreName?: string;
  trackCount?: number;
  artworkUrl100?: string;
}

export interface ItunesSearchResponse {
  resultCount: number;
  results: ItunesResult[];
}

export interface LibraryItem {
  id: number;
  appleCatalogId: number;
  title: string;
  artistName: string;
  genre: string | null;
  releaseDate: string | null;
  trackCount: number | null;
  artworkUrl: string | null;
  userRating: number | null;
  userNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LibraryItemInput {
  appleCatalogId: number;
  title: string;
  artistName: string;
  genre?: string | null;
  releaseDate?: string | null;
  trackCount?: number | null;
  artworkUrl?: string | null;
  userRating?: number | null;
  userNotes?: string | null;
}

export interface AnalyticsResponse {
  totalItems: number;
  averageRating: number;
  genreDistribution: Record<string, number>;
  topArtists: Record<string, number>;
  releasesByYear: Record<string, number>;
  trackCountHistogramBuckets: number[];
  trackCountHistogramCounts: number[];
}

export interface AiInsightResponse {
  summary: string;
  recommendations: string[];
  source: 'llm' | 'rule-based';
}

// --- API calls ---
export const api = {
  register: (email: string, password: string) =>
    request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  login: (email: string, password: string) =>
    request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  search: (query: string, type: string, limit = 20) =>
    request<ItunesSearchResponse>(
      `/api/search?query=${encodeURIComponent(query)}&type=${type}&limit=${limit}`
    ),

  getLibrary: () => request<LibraryItem[]>('/api/library'),

  addToLibrary: (item: LibraryItemInput) =>
    request<LibraryItem>('/api/library', {
      method: 'POST',
      body: JSON.stringify(item),
    }),

  updateLibraryItem: (id: number, item: LibraryItemInput) =>
    request<LibraryItem>(`/api/library/${id}`, {
      method: 'PUT',
      body: JSON.stringify(item),
    }),

  deleteLibraryItem: (id: number) =>
    request<void>(`/api/library/${id}`, { method: 'DELETE' }),

  getAnalytics: () => request<AnalyticsResponse>('/api/analytics'),

  getAiInsights: () => request<AiInsightResponse>('/api/ai/insights'),
};
