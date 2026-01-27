import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://backend-for-shop.vercel.app/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

export const IMAGE_BASE_URL = (import.meta.env.VITE_API_URL || 'https://backend-for-shop.vercel.app/api').replace('/api', '');

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
