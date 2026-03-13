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

// Interceptor para capturar el manifiesto del rubro enviado por el servidor
apiClient.interceptors.response.use(
    (response) => {
        const rubroId = response.headers['x-rubro-id'];
        const slug = response.headers['x-rubro-slug'];
        const manifestBase64 = response.headers['x-rubro-manifest'];

        if (rubroId && manifestBase64) {
            try {
                // Decodificar Base64 del manifiesto (UTF-8)
                const binaryString = window.atob(manifestBase64);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                const manifestJson = new TextDecoder().decode(bytes);
                
                import('../store/rubroStore').then(({ useRubroStore }) => {
                    useRubroStore.getState().setRubro(rubroId, slug || '', manifestJson);
                });
            } catch (e) {
                console.error("Error decodificando X-Rubro-Manifest", e);
            }
        }
        return response;
    },
    (error) => {
        return Promise.reject(error);
    }
);
