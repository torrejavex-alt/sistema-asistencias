import { useState, useEffect } from 'react';
import { fetchUsuarios, createUsuario, updateUsuario, deleteUsuario, deleteAllAsistencias, deleteAsistenciasByUser } from '../services/api';

interface Usuario {
    id_usuario: number;
    nombre: string;
    instrumento?: string;
}

export default function Usuarios() {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [nombre, setNombre] = useState('');
    const [instrumento, setInstrumento] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        loadUsuarios();
    }, []);

    const loadUsuarios = async () => {
        try {
            const data = await fetchUsuarios();
            setUsuarios(data);
        } catch (error) {
            console.error('Error loading users:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nombre.trim()) return;

        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            if (editingId) {
                await updateUsuario(editingId, { nombre, instrumento });
                setSuccessMessage('Usuario actualizado exitosamente');
            } else {
                const newUser = await createUsuario({ nombre, instrumento });
                console.log('Usuario creado:', newUser);
                setSuccessMessage('Usuario creado exitosamente');
            }
            setNombre('');
            setInstrumento('');
            setEditingId(null);

            // Reload users to show the new/updated user
            await loadUsuarios();

            // Clear success message after 3 seconds
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (error: any) {
            console.error('Error saving user:', error);
            // Mostrar el mensaje de error específico del servidor si está disponible
            if (error.response && error.response.data && error.response.data.error) {
                setError(error.response.data.error);
            } else {
                setError('Error al guardar el usuario. Por favor, intenta de nuevo.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (user: Usuario) => {
        setNombre(user.nombre);
        setInstrumento(user.instrumento || '');
        setEditingId(user.id_usuario);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) return;

        try {
            await deleteUsuario(id);
            await loadUsuarios();
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const handleDeleteUserAsistencias = async (userId: number, userName: string) => {
        if (!window.confirm(`¿Estás seguro de que quieres eliminar TODOS los registros de asistencia de ${userName}?`)) return;

        try {
            const result = await deleteAsistenciasByUser(userId);
            setSuccessMessage(result.message || 'Registros de asistencia eliminados');
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (error: any) {
            console.error('Error deleting asistencias:', error);
            setError(error.response?.data?.error || 'Error al eliminar registros de asistencia');
            setTimeout(() => setError(null), 3000);
        }
    };

    const handleDeleteAllAsistencias = async () => {
        if (!window.confirm('⚠️ ¿Estás COMPLETAMENTE seguro de que quieres eliminar TODOS los registros de asistencia de TODOS los usuarios? Esta acción no se puede deshacer.')) return;

        try {
            const result = await deleteAllAsistencias();
            setSuccessMessage(result.message || 'Todos los registros de asistencia han sido eliminados');
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (error: any) {
            console.error('Error deleting all asistencias:', error);
            setError(error.response?.data?.error || 'Error al eliminar todos los registros');
            setTimeout(() => setError(null), 3000);
        }
    };

    const handleCancel = () => {
        setNombre('');
        setInstrumento('');
        setEditingId(null);
    };

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
            <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">Gestión de Usuarios</h1>
                <p className="text-sm sm:text-base text-slate-600">Administra los miembros del grupo</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Form Section */}
                <div className="lg:col-span-4">
                    <div className="bento-card sticky top-24">
                        <h2 className="text-lg font-semibold text-slate-800 mb-4">
                            {editingId ? 'Editar Usuario' : 'Nuevo Usuario'}
                        </h2>

                        {/* Success Message */}
                        {successMessage && (
                            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm">
                                ✓ {successMessage}
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                                ✗ {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Nombre
                                </label>
                                <input
                                    type="text"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    className="bento-input w-full"
                                    placeholder="Nombre completo"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Instrumento
                                </label>
                                <input
                                    type="text"
                                    value={instrumento}
                                    onChange={(e) => setInstrumento(e.target.value)}
                                    className="bento-input w-full"
                                    placeholder="Ej. Guitarra, Voz (Opcional)"
                                />
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-primary flex-1 disabled:opacity-50"
                                >
                                    {loading ? 'Guardando...' : (editingId ? 'Actualizar' : 'Crear')}
                                </button>
                                {editingId && (
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                {/* List Section */}
                <div className="lg:col-span-8">
                    <div className="bento-card">
                        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                            <div className="flex items-center gap-4">
                                <h2 className="text-lg font-semibold text-slate-800">Lista de Miembros</h2>
                                <span className="text-sm text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                                    {usuarios.length} usuarios
                                </span>
                            </div>
                            <button
                                onClick={handleDeleteAllAsistencias}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 shadow-sm transition-all hover:shadow-md"
                                title="Eliminar todos los registros de asistencia"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Eliminar Todas las Asistencias
                            </button>
                        </div>

                        <div className="overflow-x-auto -mx-6 px-6">
                            <table className="bento-table">
                                <thead>
                                    <tr>
                                        <th>Nombre</th>
                                        <th>Instrumento</th>
                                        <th className="text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {usuarios.map((user) => (
                                        <tr key={user.id_usuario}>
                                            <td>
                                                <div className="font-medium text-slate-900">
                                                    {user.nombre}
                                                </div>
                                            </td>
                                            <td>{user.instrumento || '-'}</td>
                                            <td>
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEdit(user)}
                                                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                        title="Editar"
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteUserAsistencias(user.id_usuario, user.nombre)}
                                                        className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                                        title="Eliminar asistencias de este usuario"
                                                    >
                                                        📋🗑️
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(user.id_usuario)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Eliminar usuario"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {usuarios.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="text-center text-slate-500">
                                                No hay usuarios registrados.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
