import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';
import type { AuthState, LoginResponse } from '../types';

interface AuthStore extends AuthState {
    login: (data: LoginResponse) => void;
    logout: () => void;
    checkTokenValidity: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            token: null,
            user: null,

            login: (data: LoginResponse) => {
                set({
                    token: data.token,
                    user: {
                        userId: data.userId,
                        nombre: data.nombre,
                        tenantId: data.tenantId,
                        rol: data.rol,
                    },
                });
            },

            logout: () => {
                set({ token: null, user: null });
            },

            checkTokenValidity: () => {
                const token = get().token;
                if (!token) return false;

                try {
                    const decoded = jwtDecode<{ exp: number }>(token);
                    // Verificar si el token expiró (multiplicamos x1000 porque exp está en segundos y Date.now en ms)
                    if (decoded.exp * 1000 < Date.now()) {
                        get().logout();
                        return false;
                    }
                    return true;
                } catch (error) {
                    get().logout();
                    return false;
                }
            },
        }),
        {
            name: 'auth-storage', // key en localStorage
        }
    )
);
