import { useState, useEffect, useMemo } from 'react';
import { fetchReportePorFecha } from '../services/api';
import { exportToCSV } from '../utils/exportUtils';
import { exportReporteToPDF } from '../utils/pdfUtils';

interface RegistroAsistencia {
    nombre: string;
    [fecha: string]: string;
}

export function ReporteAsistencias() {
    // Raw data from API
    const [fechas, setFechas] = useState<string[]>([]);
    const [registros, setRegistros] = useState<RegistroAsistencia[]>([]);

    // Filter state
    const [filterType, setFilterType] = useState<'year' | 'month' | 'quarter' | 'semester'>('year');
    const [selectedYear, setSelectedYear] = useState<string>('');
    const [selectedMonth, setSelectedMonth] = useState<string>('');
    const [selectedQuarter, setSelectedQuarter] = useState<string>('');
    const [selectedSemester, setSelectedSemester] = useState<string>('');

    const [availableYears, setAvailableYears] = useState<string[]>([]);

    // Load data and compute available years
    useEffect(() => {
        fetchReportePorFecha().then(data => {
            setFechas(data.fechas);
            setRegistros(data.registros);
            const years = Array.from(
                new Set((data.fechas as string[]).map((f: string) => new Date(f).getFullYear().toString()))
            );
            setAvailableYears(years);
            setSelectedYear(years[0] || '');
        });
    }, []);

    // Filter dates based on selected filter type
    const filteredFechas = useMemo(() => {
        if (!selectedYear) return fechas;

        return fechas.filter(f => {
            const date = new Date(f);
            const year = date.getFullYear().toString();
            const month = date.getMonth();
            const quarter = Math.floor(month / 3) + 1;
            const semester = month < 6 ? 1 : 2;

            if (year !== selectedYear) return false;

            switch (filterType) {
                case 'month':
                    return selectedMonth ? month === parseInt(selectedMonth) : true;
                case 'quarter':
                    return selectedQuarter ? quarter === parseInt(selectedQuarter) : true;
                case 'semester':
                    return selectedSemester ? semester === parseInt(selectedSemester) : true;
                default:
                    return true;
            }
        });
    }, [fechas, selectedYear, filterType, selectedMonth, selectedQuarter, selectedSemester]);

    const filteredRegistros = useMemo(() => {
        return registros.map(r => {
            const newRec: any = { nombre: r.nombre };
            Object.entries(r).forEach(([key, value]) => {
                if (key !== 'nombre' && key !== 'instrumento' && filteredFechas.includes(key)) {
                    newRec[key] = value;
                }
            });
            return newRec;
        });
    }, [registros, filteredFechas]);

    // Compute month groups for header spanning
    const months = useMemo(() => {
        const groups: { name: string; count: number }[] = [];
        if (filteredFechas.length === 0) return groups;
        let currentMonth = '';
        let count = 0;
        filteredFechas.forEach(fecha => {
            const date = new Date(fecha);
            const monthName = date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
            const formattedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);
            if (formattedMonth !== currentMonth) {
                if (currentMonth) groups.push({ name: currentMonth, count });
                currentMonth = formattedMonth;
                count = 1;
            } else {
                count++;
            }
        });
        if (currentMonth) groups.push({ name: currentMonth, count });
        return groups;
    }, [filteredFechas]);

    const getCellStyle = (estado: string) => {
        let bgColor = 'bg-slate-50';
        let textColor = 'text-slate-600';
        let text = '';
        let border = '';
        if (estado === 'Asistió') {
            bgColor = 'bg-sage-100';
            textColor = 'text-sage-600';
            text = 'A';
            border = 'border-2 border-sage-600';
        } else if (estado === 'No asistió') {
            bgColor = 'bg-terracotta-200';
            textColor = 'text-terracotta-600';
            text = 'F';
            border = 'border-2 border-terracotta-600';
        } else if (estado === 'Con permiso') {
            bgColor = 'bg-amber-100';
            textColor = 'text-amber-700';
            text = 'P';
            border = 'border-2 border-amber-600';
        } else if (estado === 'No convocado') {
            bgColor = 'bg-slate-200';
            textColor = 'text-slate-500';
            text = '-';
            border = 'border-2 border-slate-500';
        }
        return { bgColor, textColor, text, border };
    };

    const handleExportCSV = () => {
        const exportData = filteredRegistros.map(registro => {
            const row: any = { Usuario: registro.nombre };
            filteredFechas.forEach(fecha => {
                const formattedDate = new Date(fecha).toLocaleDateString('es-ES');
                row[formattedDate] = registro[fecha] || 'Sin registrar';
            });
            return row;
        });
        const headers = ['Usuario', ...filteredFechas.map(f => new Date(f).toLocaleDateString('es-ES'))];
        exportToCSV(exportData, `reporte-asistencias-${new Date().toISOString().split('T')[0]}`, headers);
    };

    const handleExportPDF = () => {
        exportReporteToPDF(filteredRegistros, filteredFechas);
    };

    const monthNames = [
        { value: '0', label: 'Enero' },
        { value: '1', label: 'Febrero' },
        { value: '2', label: 'Marzo' },
        { value: '3', label: 'Abril' },
        { value: '4', label: 'Mayo' },
        { value: '5', label: 'Junio' },
        { value: '6', label: 'Julio' },
        { value: '7', label: 'Agosto' },
        { value: '8', label: 'Septiembre' },
        { value: '9', label: 'Octubre' },
        { value: '10', label: 'Noviembre' },
        { value: '11', label: 'Diciembre' }
    ];

    return (
        <div className="p-8 max-w-full mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 mb-2">Reporte de Asistencias</h1>
                    <p className="text-slate-600">Vista completa del historial de asistencias por usuario y fecha</p>
                </div>
                <div className="flex gap-4 items-center flex-wrap">
                    {/* Tipo de filtro */}
                    <select
                        value={filterType}
                        onChange={e => {
                            setFilterType(e.target.value as any);
                            setSelectedMonth('');
                            setSelectedQuarter('');
                            setSelectedSemester('');
                        }}
                        className="px-3 py-2 border border-slate-300 rounded-md bg-white text-sm"
                    >
                        <option value="year">Por Año</option>
                        <option value="month">Por Mes</option>
                        <option value="quarter">Por Trimestre</option>
                        <option value="semester">Por Semestre</option>
                    </select>

                    {/* Selector de año */}
                    <select
                        value={selectedYear}
                        onChange={e => setSelectedYear(e.target.value)}
                        className="px-3 py-2 border border-slate-300 rounded-md bg-white text-sm"
                    >
                        {availableYears.map(year => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </select>

                    {/* Selector de mes (solo si filterType es 'month') */}
                    {filterType === 'month' && (
                        <select
                            value={selectedMonth}
                            onChange={e => setSelectedMonth(e.target.value)}
                            className="px-3 py-2 border border-slate-300 rounded-md bg-white text-sm"
                        >
                            <option value="">Todos los meses</option>
                            {monthNames.map(m => (
                                <option key={m.value} value={m.value}>
                                    {m.label}
                                </option>
                            ))}
                        </select>
                    )}

                    {/* Selector de trimestre */}
                    {filterType === 'quarter' && (
                        <select
                            value={selectedQuarter}
                            onChange={e => setSelectedQuarter(e.target.value)}
                            className="px-3 py-2 border border-slate-300 rounded-md bg-white text-sm"
                        >
                            <option value="">Todos los trimestres</option>
                            <option value="1">Q1 (Ene-Mar)</option>
                            <option value="2">Q2 (Abr-Jun)</option>
                            <option value="3">Q3 (Jul-Sep)</option>
                            <option value="4">Q4 (Oct-Dic)</option>
                        </select>
                    )}

                    {/* Selector de semestre */}
                    {filterType === 'semester' && (
                        <select
                            value={selectedSemester}
                            onChange={e => setSelectedSemester(e.target.value)}
                            className="px-3 py-2 border border-slate-300 rounded-md bg-white text-sm"
                        >
                            <option value="">Ambos semestres</option>
                            <option value="1">Primer Semestre (Ene-Jun)</option>
                            <option value="2">Segundo Semestre (Jul-Dic)</option>
                        </select>
                    )}

                    <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg text-sm font-semibold hover:bg-slate-700 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="hidden sm:inline">Exportar</span> CSV
                    </button>
                    <button
                        onClick={handleExportPDF}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <span className="hidden sm:inline">Exportar</span> PDF
                    </button>
                </div>
            </div>

            <div className="bento-card">
                <div className="overflow-x-auto -mx-6 px-6">
                    <table className="min-w-full border-separate border-spacing-0 text-xs">
                        <thead>
                            <tr>
                                <th
                                    rowSpan={2}
                                    className="sticky left-0 z-20 bg-slate-100 border-b-2 border-r-2 border-slate-300 p-3 text-left font-semibold text-slate-700 uppercase tracking-wide"
                                >
                                    Nombre
                                </th>
                                {months.map((month, idx) => (
                                    <th
                                        key={idx}
                                        colSpan={month.count}
                                        className="border-b border-slate-300 p-3 text-center font-bold text-slate-700 bg-gradient-to-b from-slate-100 to-slate-50"
                                    >
                                        {month.name}
                                    </th>
                                ))}
                            </tr>
                            <tr>
                                {filteredFechas.map(fecha => (
                                    <th
                                        key={fecha}
                                        className="border-b-2 border-slate-300 p-2 text-center w-10 bg-slate-50 text-slate-600 font-semibold"
                                    >
                                        {new Date(fecha).getDate()}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRegistros.length === 0 ? (
                                <tr>
                                    <td colSpan={filteredFechas.length + 1} className="p-8 text-center text-slate-500">
                                        No hay registros de asistencia para mostrar. Por favor, registra asistencias en la sección correspondiente.
                                    </td>
                                </tr>
                            ) : (
                                filteredRegistros.map((registro, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="sticky left-0 z-10 bg-white border-r-2 border-slate-200 p-3 font-medium text-slate-900 whitespace-nowrap">
                                            {registro.nombre}
                                        </td>
                                        {filteredFechas.map(fecha => {
                                            const estado = registro[fecha];
                                            const { bgColor, textColor, text, border } = getCellStyle(estado);
                                            return (
                                                <td
                                                    key={fecha}
                                                    className={`border border-slate-300 p-2 text-center font-semibold ${bgColor} ${textColor} ${border} transition-colors`}
                                                    title={estado}
                                                >
                                                    {text}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Legend */}
                <div className="mt-6 pt-6 border-t border-slate-200 flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                        <span className="w-8 h-8 bg-sage-100 text-sage-600 rounded-lg flex items-center justify-center font-semibold text-xs">A</span>
                        <span className="text-sm text-slate-600">Asistió</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-8 h-8 bg-terracotta-200 text-terracotta-600 rounded-lg flex items-center justify-center font-semibold text-xs">F</span>
                        <span className="text-sm text-slate-600">No asistió (Falta)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-8 h-8 bg-amber-100 text-amber-700 rounded-lg flex items-center justify-center font-semibold text-xs">P</span>
                        <span className="text-sm text-slate-600">Con permiso</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-8 h-8 bg-slate-200 text-slate-500 rounded-lg flex items-center justify-center font-semibold text-xs">-</span>
                        <span className="text-sm text-slate-600">No convocado</span>
                    </div>
                </div>
            </div>
        </div>
    );
}