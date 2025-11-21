import { useState, useEffect } from 'react';
import { fetchUsuarios, createUsuario, updateUsuario, deleteUsuario } from '../services/api';

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
        } catch (error) {
            console.error('Error saving user:', error);
            setError('Error al guardar el usuario. Por favor, intenta de nuevo.');
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
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-slate-800">Lista de Miembros</h2>
                            <span className="text-sm text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                                {usuarios.length} usuarios
                            </span>
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
                                                        onClick={() => handleDelete(user.id_usuario)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Eliminar"
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
