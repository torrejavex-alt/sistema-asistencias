import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    return (
        <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 shadow-sm border-b border-slate-200/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center gap-12">
                        <div className="flex-shrink-0 flex items-center">
                            <h1 className="text-xl font-bold bg-gradient-to-r from-slate-600 to-slate-500 bg-clip-text text-transparent">
                                Control de Asistencias
                            </h1>
                        </div>
                        <div className="hidden sm:flex sm:gap-2">
                            <Link
                                to="/"
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive('/')
                                    ? 'bg-slate-600 text-white shadow-md'
                                    : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                            >
                                Dashboard
                            </Link>
                            <Link
                                to="/reportes"
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive('/reportes')
                                    ? 'bg-slate-600 text-white shadow-md'
                                    : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                            >
                                Reporte Asistencias
                            </Link>
                            <Link
                                to="/analiticas"
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive('/analiticas')
                                    ? 'bg-slate-600 text-white shadow-md'
                                    : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                            >
                                Analíticas
                            </Link>
                            <Link
                                to="/usuarios"
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive('/usuarios')
                                    ? 'bg-slate-600 text-white shadow-md'
                                    : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                            >
                                Usuarios
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
