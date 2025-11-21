// src/services/api.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Usuarios
export const fetchUsuarios = async () => {
    const response = await fetch(`${API_BASE_URL}/usuarios`);
    if (!response.ok) {
        throw new Error(`Error fetching usuarios: ${response.statusText}`);
    }
    return response.json();
};

export const createUsuario = async (usuario: { nombre: string; instrumento?: string }) => {
    const response = await fetch(`${API_BASE_URL}/usuarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(usuario)
    });
    if (!response.ok) {
        throw new Error(`Error creating usuario: ${response.statusText}`);
    }
    return response.json();
};

export const updateUsuario = async (id: number, usuario: { nombre: string; instrumento?: string }) => {
    const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(usuario)
    });
    if (!response.ok) {
        throw new Error(`Error updating usuario: ${response.statusText}`);
    }
    return response.json();
};

export const deleteUsuario = async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
        method: 'DELETE'
    });
    if (!response.ok) {
        throw new Error(`Error deleting usuario: ${response.statusText}`);
    }
};

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
    fetch(`${API_BASE_URL}/asistencias/reporte-por-fecha`)
        .then(res => res.json());