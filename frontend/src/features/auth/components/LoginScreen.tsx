import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api/authApi';

export const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [subdominio, setSubdominio] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const loginAuth = useAuthStore((state) => state.login);

    useEffect(() => {
        // Magia PWA: extraemos el subdominio de forma automática
        // Ejemplo: si la URL es "zara.tusaas.com", extrae "zara"
        const host = window.location.hostname;
        const parts = host.split('.');

        // Si estamos en localhost para dev, lo dejamos manualmente editable
        if (host === 'localhost' || host === '127.0.0.1') {
            // Dejamos que el usuario lo escriba, o usamos un default
            setSubdominio('');
        } else if (parts.length >= 3) {
            // Tomamos el primer segmento "zara"
            setSubdominio(parts[0]);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const resp = await authApi.login({ subdominio, email, password });
            loginAuth(resp);
            // Redirigir al inicio POS
            window.location.href = '/pos';
        } catch (err: any) {
            setError(err.response?.data?.mensaje || 'Error al iniciar sesión');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                        Ingreso Seguro
                    </h2>
                    <p className="text-gray-500 text-sm mt-2">
                        Tu sucursal a un clic de distancia
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Este div se mostrará solo en Desarrollo (localhost) para poder cambiar de tenant */}
                    {(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Subdominio (Dev Only)</label>
                            <input
                                type="text"
                                required
                                value={subdominio}
                                onChange={(e) => setSubdominio(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                placeholder="ej: zara"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            placeholder="tu@correo.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 rounded-lg hover:opacity-90 transition active:scale-[0.98] disabled:opacity-50"
                    >
                        {isLoading ? 'Verificando...' : 'Iniciar Sesión'}
                    </button>
                </form>
            </div>
        </div>
    );
};
