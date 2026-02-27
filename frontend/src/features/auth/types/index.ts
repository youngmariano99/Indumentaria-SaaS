export interface LoginRequest {
    subdominio: string;
    email: string;
    password: string;
}

export interface RegisterRequest {
    subdominio: string;  // El nombre del local (se usa como subdominio identificador del tenant)
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    userId: string;
    nombre: string;
    tenantId: string;
    rol: number;
}

export interface AuthState {
    token: string | null;
    user: {
        userId: string;
        nombre: string;
        tenantId: string;
        rol: number;
    } | null;
}
