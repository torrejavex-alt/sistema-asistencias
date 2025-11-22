import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const data = await login(username, password);

            // Guardar token y datos del usuario
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('user', JSON.stringify({
                username: data.username,
                nombre_completo: data.nombre_completo
            }));

            // Redirigir al dashboard
            navigate('/');
        } catch (err: any) {
            console.error('Error al iniciar sesión:', err);
            let errorMessage = 'Error al iniciar sesión. Por favor, intenta de nuevo.';

            if (err.response) {
                // El servidor respondió con un estado de error
                if (err.response.data && err.response.data.error) {
                    errorMessage = err.response.data.error;
                } else if (err.response.status === 401) {
                    errorMessage = 'Usuario o contraseña incorrectos';
                } else if (err.response.status === 500) {
                    errorMessage = 'Error interno del servidor. Por favor, contacta al soporte.';
                }
            } else if (err.request) {
                // La petición se hizo pero no hubo respuesta
                errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
            }

            setError(errorMessage);
            // Mostrar pop-up como solicitaste
            window.alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-sage-50 to-terracotta-50 p-4">
            <div className="w-full max-w-md">
                {/* Logo/Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-sage-600 to-sage-700 rounded-2xl mb-4 shadow-lg">
                        <span className="text-3xl">🎵</span>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-800 mb-2">
                        Sistema de Asistencias
                    </h1>
                    <p className="text-slate-600">
                        Inicia sesión para continuar
                    </p>
                </div>

                {/* Login Card */}
                <div className="bento-card">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Error Message */}
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                                ✗ {error}
                            </div>
                        )}

                        {/* Username Field */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Usuario
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="bento-input w-full"
                                placeholder="Ingresa tu usuario"
                                required
                                autoFocus
                            />
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Contraseña
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bento-input w-full"
                                placeholder="Ingresa tu contraseña"
                                required
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Iniciando sesión...
                                </span>
                            ) : (
                                'Iniciar Sesión'
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <div className="mt-6 text-center text-sm text-slate-600">
                    <p>Sistema de Control de Asistencias</p>
                    <p className="mt-1 text-xs text-slate-500">
                        Acceso restringido solo para administradores
                    </p>
                </div>
            </div>
        </div>
    );
}
