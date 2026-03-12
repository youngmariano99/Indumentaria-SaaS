export interface LoginRequest {
    subdominio: string;
    email: string;
    password: string;
}

export interface RegisterRequest {
    nombreComercial: string;
    subdominio: string;  
    email: string;
    password: string;
    rubroId?: string;
}

export interface LoginResponse {
    token: string;
    userId: string;
    nombre: string;
    tenantId: string;
    rol: string | number;
    rubroId?: string;
    rubroSlug?: string;
    diccionarioJson?: string;
    esquemaMetadatosJson?: string;
}

export interface AuthState {
    token: string | null;
    user: {
        userId: string;
        nombre: string;
        tenantId: string;
        rol: string | number;
    } | null;
}
