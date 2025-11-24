import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
});

// Interceptor para agregar el token JWT a todas las peticiones
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token inválido o expirado
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth
export const login = async (username: string, password: string) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
};

export const verifyToken = async () => {
    const response = await api.get('/auth/verify');
    return response.data;
};

export const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
};

// Usuarios
export const fetchUsuarios = async () => {
    const response = await api.get('/usuarios');
    return response.data;
};

export const createUsuario = async (data: { nombre: string; instrumento?: string }) => {
    const response = await api.post('/usuarios', data);
    return response.data;
};

export const updateUsuario = async (id: number, data: { nombre: string; instrumento?: string }) => {
    const response = await api.put(`/usuarios/${id}`, data);
    return response.data;
};

export const deleteUsuario = async (id: number) => {
    const response = await api.delete(`/usuarios/${id}`);
    return response.data;
};

// Eventos
export const fetchEventos = async () => {
    const response = await api.get('/eventos');
    return response.data;
};

export const createEvento = async (data: { fecha: string }) => {
    const response = await api.post('/eventos', data);
    return response.data;
};

// Asistencias
export const fetchAsistencias = async () => {
    const response = await api.get('/asistencias');
    return response.data;
};

export const fetchReportePorFecha = async () => {
    const response = await api.get('/asistencias/reporte-por-fecha');
    return response.data;
};

export const createAsistencia = async (data: { id_usuario: number; id_evento: number; id_tipo: number }) => {
    const response = await api.post('/asistencias', data);
    return response.data;
};

export const updateAsistencia = async (userId: number, eventId: number, tipoId: number) => {
    const response = await api.put(`/asistencias/${userId}/${eventId}`, { id_tipo: tipoId });
    return response.data;
};

// Delete a specific asistencia for a user and event
export const deleteAsistencia = async (userId: number, eventId: number) => {
    const response = await api.delete(`/asistencias/${userId}/${eventId}`);
    return response.data;
};

export const deleteAllAsistencias = async () => {
    const response = await api.delete('/asistencias/delete-all');
    return response.data;
};

// Importar usuarios (CSV)
export const importUsuarios = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/usuarios/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

// Importar asistencias (CSV)
export const importAsistencias = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/asistencias/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};