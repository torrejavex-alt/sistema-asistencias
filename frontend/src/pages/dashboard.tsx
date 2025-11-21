import { useState, useEffect, useCallback } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format } from 'date-fns';
import {
    fetchUsuarios,
    fetchEventos,
    fetchAsistencias,
    createAsistencia,
    updateAsistencia,
    deleteAsistencia,
    createEvento
} from '../services/api';

interface Usuario {
    id_usuario: number;
    nombre: string;
    instrumento?: string;
}

interface Evento {
    id_evento: number;
    fecha: string;
}

interface Asistencia {
    id_usuario: number;
    id_evento: number;
    id_tipo: number;
    usuario: string;
    instrumento?: string;
    fecha: string;
    estado: string;
}

export default function Dashboard() {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [eventos, setEventos] = useState<Evento[]>([]);
    const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
    const [currentEventId, setCurrentEventId] = useState<number | null>(null);

    useEffect(() => {
        void loadData();
    }, []);

    useEffect(() => {
        // Find event for selected date
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        const evento = eventos.find(e => e.fecha === dateStr);
        setCurrentEventId(evento ? evento.id_evento : null);
    }, [selectedDate, eventos]);

    const loadData = async (): Promise<void> => {
        const [usersData, eventosData, asistenciasData] = await Promise.all([
            fetchUsuarios(),
            fetchEventos(),
            fetchAsistencias()
        ]);
        setUsuarios(usersData);
        setEventos(eventosData);
        setAsistencias(asistenciasData);
    };

    const getAttendanceForUser = useCallback((userId: number): number | null => {
        if (!currentEventId) return null;
        const attendance = asistencias.find(
            a => a.id_usuario === userId && a.id_evento === currentEventId
        );
        return attendance ? attendance.id_tipo : null;
    }, [currentEventId, asistencias]);

    const handleAttendanceChange = async (userId: number, tipoId: number) => {
        let eventId = currentEventId;

        // If no event exists for this date, create it
        if (!eventId) {
            const dateStr = format(selectedDate, 'yyyy-MM-dd');
            const newEvent = await createEvento({ fecha: dateStr });
            eventId = newEvent.id_evento;
            await loadData(); // Reload to get the new event
        }

        const existingAttendance = getAttendanceForUser(userId);

        if (existingAttendance !== null) {
            // Update existing
            await updateAsistencia(userId, eventId!, tipoId);
        } else {
            // Create new
            await createAsistencia({
                id_usuario: userId,
                id_evento: eventId!,
                id_tipo: tipoId
            });
        }

        await loadData(); // Reload data
    };

    const handleDeleteAttendance = async (userId: number) => {
        if (!currentEventId) return;
        await deleteAsistencia(userId, currentEventId);
        await loadData();
    };

    const getStatusColor = (tipoId: number | null) => {
        if (tipoId === null) return 'bg-slate-100 text-slate-600';
        switch (tipoId) {
            case 1: return 'badge-attended';
            case 2: return 'badge-absent';
            case 3: return 'badge-permission';
            case 4: return 'badge-not-summoned';
            default: return 'bg-slate-100 text-slate-600';
        }
    };

    const getStatusText = (tipoId: number | null) => {
        if (tipoId === null) return 'Sin registrar';
        switch (tipoId) {
            case 1: return 'Asistió';
            case 2: return 'No asistió';
            case 3: return 'Con permiso';
            case 4: return 'No convocado';
            default: return 'Sin registrar';
        }
    };

    return (
        <div className="p-4 sm:p-6 w-full">
            <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">Control de Asistencias</h1>
                <p className="text-sm sm:text-base text-slate-600">Gestiona y registra la asistencia de los miembros</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
                {/* Calendar Section - Bento Style */}
                <div className="lg:col-span-3">
                    <div className="bento-card lg:sticky lg:top-24">
                        <h2 className="text-base sm:text-lg font-semibold text-slate-800 mb-4">Seleccionar Fecha</h2>
                        <Calendar
                            onChange={(value) => setSelectedDate(value as Date)}
                            value={selectedDate}
                            className="w-full"
                        />
                        <div className="mt-6 p-4 bg-gradient-to-br from-slate-50 to-sage-50 rounded-xl border border-slate-200">
                            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
                                Fecha seleccionada
                            </p>
                            <p className="text-xl sm:text-2xl font-bold text-slate-800">
                                {format(selectedDate, 'dd/MM/yyyy')}
                            </p>
                            {!currentEventId && (
                                <p className="text-xs text-slate-500 mt-3 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-terracotta-500 rounded-full"></span>
                                    No hay evento para esta fecha. Se creará al registrar asistencia.
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* User List Section - Bento Style */}
                <div className="lg:col-span-9">
                    <div className="bento-card">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-base sm:text-lg font-semibold text-slate-800">Lista de Usuarios</h2>
                            <span className="text-xs sm:text-sm text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                                {usuarios.length} miembros
                            </span>
                        </div>
                        <div className="overflow-x-auto -mx-6 px-6">
                            <table className="bento-table">
                                <thead>
                                    <tr>
                                        <th>Usuario</th>
                                        <th className="hidden sm:table-cell">Instrumento</th>
                                        <th className="hidden md:table-cell">Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {usuarios.map((usuario) => {
                                        const tipoId = getAttendanceForUser(usuario.id_usuario);
                                        return (
                                            <tr key={usuario.id_usuario}>
                                                <td>
                                                    <div>
                                                        <div className="font-medium text-slate-900 text-sm">
                                                            {usuario.nombre}
                                                        </div>
                                                        <div className="text-xs text-slate-600 sm:hidden mt-0.5">
                                                            {usuario.instrumento || 'Sin instrumento'}
                                                        </div>
                                                        <div className="md:hidden mt-1">
                                                            <span className={`${getStatusColor(tipoId)} inline-block text-xs`}>
                                                                {getStatusText(tipoId)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="text-slate-600 hidden sm:table-cell">
                                                    {usuario.instrumento || '-'}
                                                </td>
                                                <td className="hidden md:table-cell">
                                                    <span className={`${getStatusColor(tipoId)} inline-block`}>
                                                        {getStatusText(tipoId)}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="flex flex-nowrap gap-2">
                                                        <button
                                                            onClick={() => handleAttendanceChange(usuario.id_usuario, 1)}
                                                            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 whitespace-nowrap"
                                                        >
                                                            <span className="text-sm">✓</span>
                                                            <span className="hidden sm:inline">Asistió</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleAttendanceChange(usuario.id_usuario, 2)}
                                                            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 whitespace-nowrap"
                                                        >
                                                            <span className="text-sm">✗</span>
                                                            <span className="hidden sm:inline">Falta</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleAttendanceChange(usuario.id_usuario, 3)}
                                                            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-amber-500 text-white rounded-lg text-xs font-semibold hover:bg-amber-600 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 whitespace-nowrap"
                                                        >
                                                            <span className="text-sm">📋</span>
                                                            <span className="hidden sm:inline">Permiso</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleAttendanceChange(usuario.id_usuario, 4)}
                                                            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-slate-400 text-white rounded-lg text-xs font-semibold hover:bg-slate-500 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 whitespace-nowrap"
                                                        >
                                                            <span className="text-sm">➖</span>
                                                            <span className="hidden sm:inline">No conv.</span>
                                                        </button>
                                                        {tipoId !== null && (
                                                            <button
                                                                onClick={() => handleDeleteAttendance(usuario.id_usuario)}
                                                                className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-slate-600 text-white rounded-lg text-xs font-semibold hover:bg-slate-700 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 whitespace-nowrap"
                                                            >
                                                                <span className="text-sm">🗑</span>
                                                                <span className="hidden sm:inline">Borrar</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}