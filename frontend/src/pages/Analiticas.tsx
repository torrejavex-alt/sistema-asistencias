import { useState, useEffect } from 'react';
import { fetchUsuarios, fetchAsistencias } from '../services/api';
import { exportToCSV } from '../utils/exportUtils';
import { exportAnaliticasToPDF } from '../utils/pdfUtils';

interface Usuario {
    id_usuario: number;
    nombre: string;
    instrumento?: string;
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

interface UserStats {
    id_usuario: number;
    nombre: string;
    instrumento?: string;
    totalEvents: number;
    attended: number;
    absent: number;
    withPermission: number;
    attendancePercentage: number;
}

export default function Analiticas() {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
    const [stats, setStats] = useState<UserStats[]>([]);

    useEffect(() => {
        void loadData();
    }, []);

    useEffect(() => {
        if (usuarios.length > 0 && asistencias.length > 0) {
            calculateStats();
        }
    }, [usuarios, asistencias]);

    const loadData = async (): Promise<void> => {
        const [usersData, asistenciasData] = await Promise.all([
            fetchUsuarios(),
            fetchAsistencias()
        ]);
        setUsuarios(usersData);
        setAsistencias(asistenciasData);
    };

    const calculateStats = () => {
        const userStats: UserStats[] = usuarios.map(usuario => {
            const userAttendance = asistencias.filter(
                a => a.id_usuario === usuario.id_usuario && a.id_tipo !== 4
            );

            const totalEvents = userAttendance.length;
            const attended = userAttendance.filter(a => a.id_tipo === 1).length;
            const absent = userAttendance.filter(a => a.id_tipo === 2).length;
            const withPermission = userAttendance.filter(a => a.id_tipo === 3).length;

            const attendancePercentage = totalEvents > 0
                ? (attended / totalEvents) * 100
                : 0;

            return {
                id_usuario: usuario.id_usuario,
                nombre: usuario.nombre,
                instrumento: usuario.instrumento,
                totalEvents,
                attended,
                absent,
                withPermission,
                attendancePercentage
            };
        });

        userStats.sort((a, b) => b.attendancePercentage - a.attendancePercentage);
        setStats(userStats);
    };

    const getPercentageColor = (percentage: number) => {
        if (percentage >= 90) return 'bg-emerald-600';
        if (percentage >= 75) return 'bg-blue-600';
        if (percentage >= 60) return 'bg-orange-600';
        if (percentage >= 40) return 'bg-amber-600';
        return 'bg-red-600';
    };

    const getPerformanceLabel = (percentage: number) => {
        if (percentage >= 90) return { text: 'Excelente', color: 'text-emerald-800 bg-emerald-100' };
        if (percentage >= 75) return { text: 'Muy Bueno', color: 'text-blue-800 bg-blue-100' };
        if (percentage >= 60) return { text: 'Bueno', color: 'text-orange-800 bg-orange-100' };
        if (percentage >= 40) return { text: 'Regular', color: 'text-red-800 bg-red-100' };
        return { text: 'Bajo', color: 'text-red-900 bg-red-200' };
    };

    const handleExportCSV = () => {
        const exportData = stats.map(stat => ({
            Usuario: stat.nombre,
            Instrumento: stat.instrumento || '-',
            'Total Eventos': stat.totalEvents,
            'Asistió': stat.attended,
            'Faltas': stat.absent,
            'Permisos': stat.withPermission,
            'Porcentaje Asistencia': `${stat.attendancePercentage.toFixed(1)}%`
        }));

        const headers = ['Usuario', 'Instrumento', 'Total Eventos', 'Asistió', 'Faltas', 'Permisos', 'Porcentaje Asistencia'];
        exportToCSV(exportData, `analiticas-asistencia-${new Date().toISOString().split('T')[0]}`, headers);
    };

    const handleExportPDF = () => {
        exportAnaliticasToPDF(stats);
    };

    const avgAttendance = stats.length > 0
        ? (stats.reduce((sum, s) => sum + s.attendancePercentage, 0) / stats.length).toFixed(1)
        : '0';

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
            <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Analíticas de Asistencia</h1>
                    <p className="text-sm sm:text-base text-slate-700">
                        Análisis detallado del rendimiento de asistencia de cada miembro
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="hidden sm:inline">Exportar</span> CSV
                    </button>
                    <button
                        onClick={handleExportPDF}
                        className="flex items-center gap-2 px-4 py-2 bg-red-700 text-white rounded-lg text-sm font-semibold hover:bg-red-800 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <span className="hidden sm:inline">Exportar</span> PDF
                    </button>
                </div>
            </div>

            {/* Summary Cards - Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
                <div className="md:col-span-4 bento-card bg-gradient-to-br from-slate-50 to-white">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center">
                            <span className="text-2xl">👥</span>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-1">
                                Total Usuarios
                            </h3>
                            <p className="text-3xl font-extrabold text-slate-900">{usuarios.length}</p>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-5 bento-card bg-gradient-to-br from-sage-50 to-white">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-sage-600 rounded-xl flex items-center justify-center">
                            <span className="text-2xl">📊</span>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-sage-800 uppercase tracking-wide mb-1">
                                Promedio de Asistencia
                            </h3>
                            <p className="text-3xl font-extrabold text-sage-700">{avgAttendance}%</p>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-3 bento-card bg-gradient-to-br from-terracotta-100 to-white">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-terracotta-600 rounded-xl flex items-center justify-center">
                            <span className="text-2xl">📝</span>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-terracotta-800 uppercase tracking-wide mb-1">
                                Registros
                            </h3>
                            <p className="text-3xl font-extrabold text-terracotta-700">
                                {asistencias.filter(a => a.id_tipo !== 4).length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Statistics Table */}
            <div className="bento-card">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Rendimiento por Usuario</h2>
                <div className="overflow-x-auto -mx-6 px-6">
                    <table className="min-w-full border-collapse">
                        <thead>
                            <tr className="border-b-2 border-slate-200">
                                <th className="px-4 py-3 text-left text-sm font-bold text-slate-900 uppercase tracking-wider">
                                    Usuario
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-bold text-slate-900 uppercase tracking-wider hidden md:table-cell">
                                    Instrumento
                                </th>
                                <th className="px-4 py-3 text-center text-sm font-bold text-slate-900 uppercase tracking-wider hidden lg:table-cell">
                                    Total
                                </th>
                                <th className="px-4 py-3 text-center text-sm font-bold text-slate-900 uppercase tracking-wider hidden sm:table-cell">
                                    A / F / P
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-bold text-slate-900 uppercase tracking-wider">
                                    Asistencia
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-bold text-slate-900 uppercase tracking-wider hidden md:table-cell">
                                    Rendimiento
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {stats.map((stat) => {
                                const performance = getPerformanceLabel(stat.attendancePercentage);
                                return (
                                    <tr key={stat.id_usuario} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-2">
                                            <div>
                                                <div className="font-bold text-slate-900 text-base">
                                                    {stat.nombre}
                                                </div>
                                                <div className="text-sm text-slate-700 md:hidden mt-0.5">
                                                    {stat.instrumento || 'Sin instrumento'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2 text-base text-slate-800 hidden md:table-cell">
                                            {stat.instrumento || '-'}
                                        </td>
                                        <td className="px-4 py-2 text-center hidden lg:table-cell">
                                            <span className="inline-flex items-center justify-center w-12 h-12 bg-slate-100 text-slate-900 rounded-lg font-bold text-base">
                                                {stat.totalEvents}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 hidden sm:table-cell">
                                            <div className="flex items-center justify-center gap-2">
                                                <span className="badge-attended inline-flex items-center justify-center min-w-[2.5rem] text-base">
                                                    {stat.attended}
                                                </span>
                                                <span className="badge-absent inline-flex items-center justify-center min-w-[2.5rem] text-base">
                                                    {stat.absent}
                                                </span>
                                                <span className="badge-permission inline-flex items-center justify-center min-w-[2.5rem] text-base">
                                                    {stat.withPermission}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-1 bg-slate-300 rounded-full h-5 overflow-hidden min-w-[80px]">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-500 ${getPercentageColor(stat.attendancePercentage)}`}
                                                            style={{ width: `${stat.attendancePercentage}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-lg font-extrabold text-slate-900 min-w-[4rem] text-right">
                                                        {stat.attendancePercentage.toFixed(1)}%
                                                    </span>
                                                </div>
                                                <div className="sm:hidden flex items-center gap-2 text-xs">
                                                    <span className="text-sage-700 font-semibold">A: {stat.attended}</span>
                                                    <span className="text-slate-400">•</span>
                                                    <span className="text-terracotta-700 font-semibold">F: {stat.absent}</span>
                                                    <span className="text-slate-400">•</span>
                                                    <span className="text-amber-800 font-semibold">P: {stat.withPermission}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2 hidden md:table-cell">
                                            <span className={`inline-block px-4 py-2 rounded-lg text-sm font-bold ${performance.color} whitespace-nowrap`}>
                                                {performance.text}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {stats.length === 0 && (
                <div className="bento-card text-center py-16">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">📊</span>
                    </div>
                    <p className="text-slate-600 text-lg">No hay datos de asistencia disponibles</p>
                    <p className="text-slate-500 text-sm mt-2">Comienza registrando asistencias en el Dashboard</p>
                </div>
            )}
        </div>
    );
}
