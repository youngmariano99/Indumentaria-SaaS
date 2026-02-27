import axios from 'axios';
import { useAuthStore } from '../features/auth/store/authStore';

// URL Base dinámica dependiendo del entorno.
// Idealmente esto viene de import.meta.env.VITE_API_URL
const BASE_URL = 'http://localhost:5063/api';

export const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para inyectar automáticamente el JWT en cada petición
apiClient.interceptors.request.use(
    (config) => {
        // Obtenemos el token directamente del estado de Zustand
        const token = useAuthStore.getState().token;

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
