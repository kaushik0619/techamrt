// Set this to your Render backend URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://techamrt.onrender.com';

import { apiCache, CACHE_TTL } from './api-cache';

interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// Token refresh management
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
}

export function clearAuthToken() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
}

async function refreshAuthToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem('refreshToken');
  
  if (!refreshToken) {
    console.log('No refresh token available');
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      
      // Store new tokens
      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      
      console.log('Token refreshed successfully');
      return data.token;
    } else {
      console.log('Token refresh failed with status:', response.status);
      return null;
    }
  } catch (error) {
    console.error('Token refresh error:', error);
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // Convert to milliseconds
    const now = Date.now();
    
    // Consider token expired if it expires in less than 5 minutes
    return exp - now < 5 * 60 * 1000;
  } catch (error) {
    console.error('Error parsing token:', error);
    return true;
  }
}

async function handleResponse<T>(response: Response, originalUrl: string, originalOptions: RequestInit): Promise<T> {
  // Handle 401 Unauthorized - token might be expired
  if (response.status === 401) {
    // If the request was to an auth endpoint (login/register/forgot/reset/refresh),
    // don't attempt to refresh tokens — return the server error so the UI can show it.
    const authPaths = ['/api/auth/login', '/api/auth/register', '/api/auth/forgot-password', '/api/auth/reset-password', '/api/auth/refresh'];
    const calledAuthEndpoint = authPaths.some(p => originalUrl.includes(p));
    if (calledAuthEndpoint) {
      let errorMessage = 'Unauthorized';
      try {
        const body = await response.json();
        errorMessage = body.message || body.error || errorMessage;
      } catch {
        errorMessage = response.statusText || errorMessage;
      }
      throw new ApiError(401, errorMessage);
    }
    // If we're already refreshing, wait for it
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh(async (newToken) => {
          try {
            // Retry with new token
            const newHeaders = new Headers(originalOptions.headers);
            newHeaders.set('Authorization', `Bearer ${newToken}`);
            
            const retryResponse = await fetch(originalUrl, {
              ...originalOptions,
              headers: newHeaders,
            });
            
            const result = await handleResponse<T>(retryResponse, originalUrl, originalOptions);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        });
      });
    }

    // Try to refresh the token
    isRefreshing = true;
    const newToken = await refreshAuthToken();
    isRefreshing = false;

    if (newToken) {
      // Notify all subscribers
      onRefreshed(newToken);
      
      // Retry the original request with new token
      const newHeaders = new Headers(originalOptions.headers);
      newHeaders.set('Authorization', `Bearer ${newToken}`);
      
      const retryResponse = await fetch(originalUrl, {
        ...originalOptions,
        headers: newHeaders,
      });
      
      return handleResponse<T>(retryResponse, originalUrl, originalOptions);
    } else {
      // Refresh failed, logout user
      clearAuthToken();
      window.location.href = '/login';
      throw new ApiError(401, 'Session expired. Please login again.');
    }
  }

  // Handle 403 Forbidden
  if (response.status === 403) {
    let errorMessage = 'Access forbidden';
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
      
      // If it's a token issue, clear and redirect
      if (errorMessage.toLowerCase().includes('token') || 
          errorMessage.toLowerCase().includes('expired') ||
          errorMessage.toLowerCase().includes('invalid')) {
        clearAuthToken();
        window.location.href = '/login';
        throw new ApiError(403, 'Session expired. Please login again.');
      }
    } catch (error) {
      if (error instanceof ApiError) throw error;
    }
    
    throw new ApiError(403, errorMessage);
  }

  // Handle other errors
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`;
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      errorMessage = response.statusText || errorMessage;
    }
    
    throw new ApiError(response.status, errorMessage);
  }
  
  // Handle successful response
  if (response.status === 204) {
    return {} as T;
  }
  
  try {
    return await response.json();
  } catch {
    return {} as T;
  }
}

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('authToken');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    // Check if token is expired before making request
    if (isTokenExpired(token)) {
      console.log('Token is expired or about to expire');
      // Don't block the request, let it fail and trigger refresh
    }
    headers.Authorization = `Bearer ${token}`;
  }
  
  return headers;
}

/**
 * Get cache TTL based on endpoint
 */
function getCacheTTL(endpoint: string): number | null {
  // Cache products for 30 minutes
  if (endpoint.includes('/api/products')) {
    return CACHE_TTL.LONG;
  }
  // Cache categories for 1 hour
  if (endpoint.includes('/api/categories')) {
    return CACHE_TTL.VERY_LONG;
  }
  // Cache search results for 5 minutes
  if (endpoint.includes('/api/search')) {
    return CACHE_TTL.MEDIUM;
  }
  // Don't cache user-specific endpoints
  if (endpoint.includes('/api/cart') || endpoint.includes('/api/orders') || endpoint.includes('/api/auth')) {
    return null;
  }
  // Cache misc endpoints for 5 minutes
  if (endpoint.includes('/api/misc')) {
    return CACHE_TTL.MEDIUM;
  }
  return null;
}

export const api = {
  async get<T = any>(endpoint: string, options?: { params?: Record<string, any> }): Promise<T> {
    const params = options?.params;
    let url = `${API_BASE_URL}${endpoint}`;

    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, String(v)));
        } else {
          searchParams.append(key, String(value));
        }
      });
      const qs = searchParams.toString();
      if (qs) url += `?${qs}`;
    }

    // Check cache for GET requests
    const cacheKey = `GET:${url}`;
    const cacheTTL = getCacheTTL(endpoint);
    
    if (cacheTTL !== null) {
      const cachedData = apiCache.get(cacheKey);
      if (cachedData) {
        console.log(`[Cache HIT] ${endpoint}`);
        return cachedData;
      }
    }

    const requestOptions: RequestInit = {
      method: 'GET',
      headers: getAuthHeaders(),
    };

    const response = await fetch(url, requestOptions);
    const data = await handleResponse<T>(response, url, requestOptions);
    
    // Store in cache if TTL is set
    if (cacheTTL !== null) {
      apiCache.set(cacheKey, data, cacheTTL);
      console.log(`[Cache SET] ${endpoint} for ${cacheTTL}ms`);
    }
    
    return data;
  },

  async post<T = any>(endpoint: string, data?: any): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Invalidate related caches on POST
    this.invalidateCache(endpoint);
    
    const requestOptions: RequestInit = {
      method: 'POST',
      headers: getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    };

    const response = await fetch(url, requestOptions);
    return handleResponse<T>(response, url, requestOptions);
  },

  async put<T = any>(endpoint: string, data?: any): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Invalidate related caches on PUT
    this.invalidateCache(endpoint);
    
    const requestOptions: RequestInit = {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    };

    const response = await fetch(url, requestOptions);
    return handleResponse<T>(response, url, requestOptions);
  },

  async delete<T = any>(endpoint: string): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Invalidate related caches on DELETE
    this.invalidateCache(endpoint);
    
    const requestOptions: RequestInit = {
      method: 'DELETE',
      headers: getAuthHeaders(),
    };

    const response = await fetch(url, requestOptions);
    return handleResponse<T>(response, url, requestOptions);
  },

  async patch<T = any>(endpoint: string, data?: any): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Invalidate related caches on PATCH
    this.invalidateCache(endpoint);
    
    const requestOptions: RequestInit = {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    };

    const response = await fetch(url, requestOptions);
    return handleResponse<T>(response, url, requestOptions);
  },

  /**
   * Invalidate cache for related endpoints
   */
  invalidateCache(endpoint: string): void {
    // Invalidate products cache when cart or orders change
    if (endpoint.includes('/api/cart') || endpoint.includes('/api/orders')) {
      apiCache.clearPattern('.*products.*');
    }
    // Invalidate cart cache when making cart changes
    if (endpoint.includes('/api/cart')) {
      apiCache.clear('GET:' + API_BASE_URL + '/api/cart');
    }
    // Invalidate orders cache when making order changes
    if (endpoint.includes('/api/orders')) {
      apiCache.clearPattern('.*orders.*');
    }
    // Invalidate wishlist cache when wishlist changes
    if (endpoint.includes('/api/misc/wishlist')) {
      apiCache.clear('GET:' + API_BASE_URL + '/api/misc/wishlist');
    }
  },

  /**
   * Manually clear all cached data
   */
  clearCache(): void {
    apiCache.clearAll();
  },
};

export { ApiError };