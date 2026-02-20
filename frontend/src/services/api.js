import axios from 'axios';
import { isTokenExpired, useAuthStore } from '../store/authStore';

const resolveApiBaseUrl = () => {
  const configuredUrl = process.env.REACT_APP_API_URL;

  const normalizeConfiguredApiUrl = (value) => {
    const trimmed = String(value || '').trim().replace(/\/+$/, '');
    if (!trimmed) return trimmed;

    try {
      const parsedUrl = new URL(trimmed);
      const originOnly = parsedUrl.origin;

      if (/\/api(\/v\d+)?$/i.test(parsedUrl.pathname.replace(/\/+$/, ''))) {
        return `${originOnly}${parsedUrl.pathname.replace(/\/+$/, '')}`;
      }

      return `${originOnly}/api/v1`;
    } catch (error) {
      // segue o fluxo abaixo para urls relativas
    }

    if (/\/api(\/v\d+)?$/i.test(trimmed)) {
      return trimmed;
    }

    return `${trimmed}/api/v1`;
  };

  if (!configuredUrl) {
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      const host = window.location.hostname || 'localhost';
      return `http://${host}:3001/api/v1`;
    }

    return '/api';
  }

  if (typeof window === 'undefined') {
    return normalizeConfiguredApiUrl(configuredUrl);
  }

  const currentHost = window.location.hostname;
  const isLanAccess = !['localhost', '127.0.0.1'].includes(currentHost);
  const normalizedConfiguredUrl = normalizeConfiguredApiUrl(configuredUrl);
  const isLocalhostApi = /localhost|127\.0\.0\.1/i.test(normalizedConfiguredUrl);

  if (isLanAccess && isLocalhostApi) {
    return normalizedConfiguredUrl
      .replace(/localhost/gi, currentHost)
      .replace(/127\.0\.0\.1/gi, currentHost);
  }

  return normalizedConfiguredUrl;
};

const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRedirectingToLogin = false;

const redirectToLoginOnce = () => {
  if (typeof window === 'undefined') return;
  if (window.location.pathname === '/login') return;
  if (isRedirectingToLogin) return;

  isRedirectingToLogin = true;
  window.location.assign('/login');
};

// Interceptor para adicionar token
api.interceptors.request.use(
  (config) => {
    const baseUrl = String(config.baseURL || api.defaults.baseURL || '').replace(/\/+$/, '');
    const requestUrl = String(config.url || '');
    const getRequestPath = (url) => {
      if (!url) return '';

      if (/^https?:\/\//i.test(url)) {
        try {
          return new URL(url).pathname || '';
        } catch (error) {
          return '';
        }
      }

      return url;
    };

    const requestPath = getRequestPath(requestUrl);
    const isBackendApiPath = /^\/?(auth|home|ocorrencias|inventario|clientes|admin|conhecimento|external)(\/|$)/i.test(requestPath);
    const hasApiPrefixInBase = /\/api(\/v\d+)?$/i.test(baseUrl);
    const hasApiPrefixInRequest = /^\/?api(\/v\d+)?\//i.test(requestPath);

    if (isBackendApiPath && !hasApiPrefixInBase && !hasApiPrefixInRequest) {
      const normalizedPath = requestPath.startsWith('/') ? requestPath : `/${requestPath}`;
      const correctedPath = `/api/v1${normalizedPath}`;

      if (/^https?:\/\//i.test(requestUrl)) {
        try {
          const absoluteRequest = new URL(requestUrl);
          absoluteRequest.pathname = correctedPath;
          config.url = absoluteRequest.toString();
        } catch (error) {
          config.url = correctedPath;
        }
      } else {
        config.url = correctedPath;
      }
    }

    const token = useAuthStore.getState().token;

    if (token && isTokenExpired(token)) {
      useAuthStore.getState().logout();
      redirectToLoginOnce();
      return Promise.reject(new axios.Cancel('Sessão expirada'));
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para lidar com erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || '';
    const isLoginRequest = requestUrl.includes('/auth/login');
    const hasToken = Boolean(useAuthStore.getState().token);

    if (status === 401 && hasToken && !isLoginRequest) {
      useAuthStore.getState().logout();
      redirectToLoginOnce();
    }

    return Promise.reject(error);
  }
);

export default api;
