import axios from 'axios';

// Instance Axios configurée pour l'API backend
// En production : utilise la variable d'env Vite, sinon l'URL de production, sinon localhost
const PROD_API_URL = 'https://api-boutique-backend.vercel.app/api';
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? PROD_API_URL : 'http://localhost:5000/api'),
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Injecte automatiquement le token JWT dans chaque requête
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Redirige vers /admin/login si le token est invalide/expiré
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      const isAdminRoute = window.location.pathname.startsWith('/admin');
      if (isAdminRoute) {
        localStorage.removeItem('token');
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
