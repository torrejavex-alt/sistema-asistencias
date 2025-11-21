// src/services/api.ts
const API_BASE_URL = '/api'; // Ahora usa el proxy de Vite

// Usuarios
export const fetchUsuarios = () => fetch(`${API_BASE_URL}/usuarios`).then(res => res.json());
export const createUsuario = (usuario: { nombre: string; instrumento?: string }) =>
    fetch(`${API_BASE_URL}/usuarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(usuario)
    }).then(res => res.json());

export const updateUsuario = (id: number, usuario: { nombre: string; instrumento?: string }) =>
    fetch(`${API_BASE_URL}/usuarios/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(usuario)
    }).then(res => res.json());

export const deleteUsuario = (id: number) =>
    fetch(`${API_BASE_URL}/usuarios/${id}`, {
        method: 'DELETE'
    });

// Eventos
export const fetchEventos = () => fetch(`${API_BASE_URL}/eventos`).then(res => res.json());
export const createEvento = (evento: { fecha: string }) =>
    fetch(`${API_BASE_URL}/eventos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(evento)
    }).then(res => res.json());

// Asistencias
export const fetchAsistencias = () => fetch(`${API_BASE_URL}/asistencias`).then(res => res.json());
export const createAsistencia = (asistencia: { id_usuario: number; id_evento: number; id_tipo: number }) =>
    fetch(`${API_BASE_URL}/asistencias`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(asistencia)
    }).then(res => res.json());

export const updateAsistencia = (id_usuario: number, id_evento: number, id_tipo: number) =>
    fetch(`${API_BASE_URL}/asistencias/${id_usuario}/${id_evento}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_tipo })
    }).then(res => res.json());

export const deleteAsistencia = (id_usuario: number, id_evento: number) =>
    fetch(`${API_BASE_URL}/asistencias/${id_usuario}/${id_evento}`, {
        method: 'DELETE'
    });

export const fetchReportePorFecha = () =>
    fetch('/api/asistencias/reporte-por-fecha')
        .then(res => res.json());