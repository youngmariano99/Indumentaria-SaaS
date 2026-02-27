import { apiClient } from '../../../lib/apiClient';

export interface ConfiguracionTalles {
    tallesPorTipo: Record<string, string[]>;
}

export interface AtributoDefault {
    clave: string;
    valor: string;
}

export interface ConfiguracionAtributos {
    atributosPorTipo: Record<string, AtributoDefault[]>;
}

export const ajustesApi = {
    /** Obtiene la configuración de talles del tenant. GET /api/ajustes/talles */
    obtenerTalles: async (): Promise<ConfiguracionTalles> => {
        const response = await apiClient.get<ConfiguracionTalles>('/ajustes/talles');
        return response.data;
    },

    /** Guarda la configuración de talles del tenant. PUT /api/ajustes/talles */
    guardarTalles: async (data: ConfiguracionTalles): Promise<void> => {
        await apiClient.put('/ajustes/talles', data);
    },

    /** Obtiene los atributos predefinidos por tipo del tenant. GET /api/ajustes/atributos */
    obtenerAtributos: async (): Promise<ConfiguracionAtributos> => {
        const response = await apiClient.get<ConfiguracionAtributos>('/ajustes/atributos');
        return response.data;
    },

    /** Guarda los atributos predefinidos por tipo del tenant. PUT /api/ajustes/atributos */
    guardarAtributos: async (data: ConfiguracionAtributos): Promise<void> => {
        await apiClient.put('/ajustes/atributos', data);
    },
};
