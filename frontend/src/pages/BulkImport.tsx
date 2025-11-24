import { useState } from 'react';
import { importUsuarios, importAsistencias } from '../services/api';

interface ImportResult {
    creados?: number;
    errores?: string[];
    error?: string;
}

export default function BulkImport() {
    const [userFile, setUserFile] = useState<File | null>(null);
    const [attendanceFile, setAttendanceFile] = useState<File | null>(null);
    const [userPaste, setUserPaste] = useState('');
    const [attendancePaste, setAttendancePaste] = useState('');

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<ImportResult | null>(null);
    const [activeTab, setActiveTab] = useState<'users' | 'attendances'>('users');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setFile: (f: File | null) => void) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setResult(null);
        }
    };

    const processImport = async (type: 'users' | 'attendances', source: 'file' | 'paste') => {
        setLoading(true);
        setResult(null);
        try {
            let fileToUpload: File | null = null;

            if (source === 'file') {
                fileToUpload = type === 'users' ? userFile : attendanceFile;
            } else {
                const content = type === 'users' ? userPaste : attendancePaste;
                if (!content.trim()) return;
                const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
                fileToUpload = new File([blob], `${type}_paste.csv`, { type: 'text/csv' });
            }

            if (!fileToUpload) return;

            let response;
            if (type === 'users') {
                response = await importUsuarios(fileToUpload);
            } else {
                response = await importAsistencias(fileToUpload);
            }
            setResult(response);

            // Clear inputs on success
            if (response.creados > 0 && (!response.errores || response.errores.length === 0)) {
                if (type === 'users') {
                    setUserFile(null);
                    setUserPaste('');
                } else {
                    setAttendanceFile(null);
                    setAttendancePaste('');
                }
                // Reset file inputs manually if needed, but state is null now
            }

        } catch (err: any) {
            console.error(err);
            setResult({ error: err.response?.data?.error || 'Error desconocido al importar.' });
        } finally {
            setLoading(false);
        }
    };

    const downloadTemplate = (type: 'users' | 'attendances') => {
        const header = type === 'users'
            ? 'nombre,instrumento'
            : 'fecha,usuario,estado';

        const exampleRow = type === 'users'
            ? '\nJuan Perez,Violin'
            : '\n2025-11-23,Juan Perez,Asistió';

        const csv = `${header}${exampleRow}`;
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `plantilla_${type}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Carga Masiva</h1>
                    <p className="text-slate-600 mt-1">Importa usuarios y registros de asistencia desde archivos CSV o Excel.</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl w-fit">
                <button
                    onClick={() => { setActiveTab('users'); setResult(null); }}
                    className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all ${activeTab === 'users'
                        ? 'bg-white text-slate-800 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Usuarios
                </button>
                <button
                    onClick={() => { setActiveTab('attendances'); setResult(null); }}
                    className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all ${activeTab === 'attendances'
                        ? 'bg-white text-slate-800 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Asistencias
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Input Actions */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-slate-800">
                                {activeTab === 'users' ? 'Importar Usuarios' : 'Importar Asistencias'}
                            </h2>
                            <button
                                onClick={() => downloadTemplate(activeTab)}
                                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Descargar Plantilla
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* File Upload */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Subir archivo CSV</label>
                                <div className="flex gap-2">
                                    <input
                                        type="file"
                                        accept=".csv"
                                        onChange={e => handleFileChange(e, activeTab === 'users' ? setUserFile : setAttendanceFile)}
                                        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition cursor-pointer border border-slate-200 rounded-lg"
                                    />
                                </div>
                                <button
                                    onClick={() => processImport(activeTab, 'file')}
                                    disabled={loading || !(activeTab === 'users' ? userFile : attendanceFile)}
                                    className="mt-3 w-full py-2.5 bg-slate-800 text-white rounded-lg font-medium text-sm hover:bg-slate-900 transition disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                                >
                                    {loading ? (
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                        </svg>
                                    )}
                                    Procesar Archivo
                                </button>
                            </div>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="w-full border-t border-slate-200"></div>
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="px-2 bg-white text-sm text-slate-400">O pegar contenido</span>
                                </div>
                            </div>

                            {/* Paste Area */}
                            <div>
                                <textarea
                                    placeholder={activeTab === 'users'
                                        ? "nombre,instrumento\nJuan,Violin"
                                        : "fecha,usuario,estado\n2023-11-23,Juan,Asistió"}
                                    value={activeTab === 'users' ? userPaste : attendancePaste}
                                    onChange={e => activeTab === 'users' ? setUserPaste(e.target.value) : setAttendancePaste(e.target.value)}
                                    rows={6}
                                    className="w-full border border-slate-300 rounded-lg p-3 text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                                />
                                <button
                                    onClick={() => processImport(activeTab, 'paste')}
                                    disabled={loading || !(activeTab === 'users' ? userPaste : attendancePaste).trim()}
                                    className="mt-3 w-full py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium text-sm hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Procesar Texto Pegado
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Results & Instructions */}
                <div className="space-y-6">
                    {/* Instructions Card */}
                    {!result && (
                        <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
                            <h3 className="text-indigo-900 font-semibold mb-2 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Instrucciones
                            </h3>
                            <ul className="text-sm text-indigo-800 space-y-2 ml-1">
                                <li>• El archivo debe ser formato <strong>.csv</strong> (separado por comas).</li>
                                <li>• La primera fila debe contener los encabezados exactos.</li>
                                {activeTab === 'users' ? (
                                    <>
                                        <li>• Columnas requeridas: <strong>nombre</strong>.</li>
                                        <li>• Opcionales: instrumento.</li>
                                    </>
                                ) : (
                                    <>
                                        <li>• Columnas requeridas: <strong>fecha, usuario, estado</strong>.</li>
                                        <li>• Formato de fecha: YYYY-MM-DD o DD/MM/YYYY.</li>
                                        <li>• El usuario debe existir previamente en el sistema.</li>
                                    </>
                                )}
                            </ul>
                        </div>
                    )}

                    {/* Results Card */}
                    {result && (
                        <div className={`p-6 rounded-2xl border ${result.error ? 'bg-red-50 border-red-100' : 'bg-white border-slate-200 shadow-sm'}`}>
                            {result.error ? (
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-red-100 rounded-full text-red-600 shrink-0">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-red-800 font-semibold text-lg">Error en la importación</h3>
                                        <p className="text-red-600 mt-1">{result.error}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-green-100 rounded-full text-green-600">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-slate-800 font-bold text-lg">Proceso Completado</h3>
                                            <p className="text-slate-600 text-sm">Resumen de la operación</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            <span className="block text-slate-500 text-xs uppercase tracking-wide font-semibold">Registros Creados</span>
                                            <span className="text-3xl font-bold text-slate-800">{result.creados}</span>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            <span className="block text-slate-500 text-xs uppercase tracking-wide font-semibold">Errores / Omitidos</span>
                                            <span className={`text-3xl font-bold ${result.errores && result.errores.length > 0 ? 'text-amber-600' : 'text-slate-800'}`}>
                                                {result.errores?.length || 0}
                                            </span>
                                        </div>
                                    </div>

                                    {result.errores && result.errores.length > 0 && (
                                        <div className="mt-4">
                                            <h4 className="text-sm font-semibold text-slate-700 mb-2">Detalle de errores:</h4>
                                            <div className="bg-slate-50 rounded-lg border border-slate-200 p-3 max-h-60 overflow-y-auto text-xs font-mono text-slate-600">
                                                {result.errores.map((err, idx) => (
                                                    <div key={idx} className="py-1 border-b border-slate-100 last:border-0">
                                                        {err}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
