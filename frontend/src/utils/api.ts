import {
  AuthResponse,
  SignupData,
  LoginData,
  ForgotPasswordData,
  ForgotPasswordResponse,
  ResetPasswordData,
  ResetPasswordResponse,
  User,
  Item,
  ItemCreate,
  ItemUpdate,
  ItemStatsResponse,
  ItemsResponse,
  SearchParams,
} from '../types';
import { sanitizeInput, sanitizeSearchQuery } from './sanitize';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export class ApiError extends Error {
  constructor(public status: number, public detail: string) {
    super(detail);
    this.name = 'ApiError';
  }
}

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Add authorization header if token exists
  const token = localStorage.getItem('access_token');
  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`;
  }

  const config: RequestInit = {
    headers: { ...defaultHeaders, ...options.headers },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    // Handle different response types
    if (!response.ok) {
      let errorDetail = 'An error occurred';
      
      try {
        const errorData = await response.json();
        errorDetail = errorData.detail || errorDetail;
      } catch {
        errorDetail = response.statusText || errorDetail;
      }
      
      throw new ApiError(response.status, errorDetail);
    }

    // Handle no content responses
    if (response.status === 204) {
      return null as T;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Handle network errors
    throw new ApiError(0, 'Network error. Please check your connection.');
  }
}

// Authentication API
export const authApi = {
  signup: (data: SignupData): Promise<User> =>
    apiRequest('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: LoginData): Promise<AuthResponse> =>
    apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  forgotPassword: (data: ForgotPasswordData): Promise<ForgotPasswordResponse> =>
    apiRequest('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  resetPassword: (data: ResetPasswordData): Promise<ResetPasswordResponse> =>
    apiRequest('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getCurrentUser: (): Promise<User> =>
    apiRequest('/api/auth/me'),
};

// Items API
export const itemsApi = {
  getItems: (params: SearchParams): Promise<ItemsResponse> => {
    const searchParams = new URLSearchParams();
    
    searchParams.append('skip', params.skip.toString());
    searchParams.append('limit', params.limit.toString());
    
    if (params.search) searchParams.append('search', params.search);
    if (params.category) searchParams.append('category', params.category);
    if (params.sort_by) searchParams.append('sort_by', params.sort_by);
    if (params.order) searchParams.append('order', params.order);

    return apiRequest(`/api/items?${searchParams.toString()}`);
  },

  getItem: (id: number): Promise<Item> =>
    apiRequest(`/api/items/${id}`),

  createItem: (data: ItemCreate): Promise<Item> =>
    apiRequest('/api/items', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateItem: (id: number, data: ItemCreate): Promise<Item> =>
    apiRequest(`/api/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  partialUpdateItem: (id: number, data: ItemUpdate): Promise<Item> =>
    apiRequest(`/api/items/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteItem: (id: number): Promise<null> =>
    apiRequest(`/api/items/${id}`, {
      method: 'DELETE',
    }),

    getStats: (): Promise<ItemStatsResponse> =>
    apiRequest('/api/items/stats'),
};