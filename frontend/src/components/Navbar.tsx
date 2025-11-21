import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

export default function Navbar() {
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const isActive = (path: string) => location.pathname === path;

    const navLinks = [
        { path: '/', label: 'Dashboard' },
        { path: '/reportes', label: 'Reporte Asistencias' },
        { path: '/analiticas', label: 'Analíticas' },
        { path: '/usuarios', label: 'Usuarios' }
    ];

    return (
        <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 shadow-sm border-b border-slate-200/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center gap-12 w-full">
                        <div className="flex-shrink-0 flex items-center">
                            <h1 className="text-xl font-bold bg-gradient-to-r from-slate-600 to-slate-500 bg-clip-text text-transparent">
                                Control de Asistencias
                            </h1>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden sm:flex sm:gap-2 flex-1">
                            {navLinks.map(link => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive(link.path)
                                            ? 'bg-slate-600 text-white shadow-md'
                                            : 'text-slate-600 hover:bg-slate-100'
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>

                        {/* Mobile menu button */}
                        <div className="flex items-center sm:hidden ml-auto">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="inline-flex items-center justify-center p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-slate-500 transition-colors"
                                aria-expanded="false"
                            >
                                <span className="sr-only">Abrir menú principal</span>
                                {/* Hamburger icon */}
                                {!isMenuOpen ? (
                                    <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                                    </svg>
                                ) : (
                                    <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            <div className={`sm:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
                <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-slate-200">
                    {navLinks.map(link => (
                        <Link
                            key={link.path}
                            to={link.path}
                            onClick={() => setIsMenuOpen(false)}
                            className={`block px-3 py-2 rounded-md text-base font-medium transition-all ${isActive(link.path)
                                    ? 'bg-slate-600 text-white shadow-md'
                                    : 'text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>
            </div>
        </nav>
    );
}
