import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE,
    timeout: 30000,
});

api.interceptors.request.use((config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') || localStorage.getItem('admin_token') : null;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401 && typeof window !== 'undefined') {
            if (window.location.pathname.startsWith('/admin') || window.location.pathname.startsWith('/login')) {
                localStorage.removeItem('token');
                localStorage.removeItem('admin_token');
                useAuthStore.getState()?.logout();
                window.location.href = '/login';
            }
        }
        return Promise.reject(err);
    }
);

// ── Categories ──────────────────────────────────────
export const categoriesApi = {
    getAll: () => api.get('/categories'),
    getAllAdmin: () => api.get('/categories/admin'),
    create: (data: object) => api.post('/categories', data),
    update: (id: string, data: object) => api.patch(`/categories/${id}`, data),
    delete: (id: string) => api.delete(`/categories/${id}`),
};

// ── Menu ────────────────────────────────────────────
export const menuApi = {
    getAll: (params?: object) => api.get('/menu', { params }),
    getAllAdmin: (params?: object) => api.get('/menu/admin', { params }),
    getById: (id: string) => api.get(`/menu/${id}`),
    create: (formData: FormData) => api.post('/menu', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    update: (id: string, formData: FormData) => api.patch(`/menu/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    delete: (id: string) => api.delete(`/menu/${id}`),
};

// ── Orders ──────────────────────────────────────────
export const ordersApi = {
    create: (data: object) => api.post('/orders', data),
    getAll: (params?: object) => api.get('/orders', { params }),
    getById: (id: string) => api.get(`/orders/${id}`),
    trackOrder: (orderNumber: string) => api.get(`/orders/track/${orderNumber}`),
    updateStatus: (id: string, status: string) => api.patch(`/orders/${id}/status`, { status }),
    updatePayment: (id: string, paymentStatus: string) => api.patch(`/orders/${id}/payment`, { paymentStatus }),
    getDailyReport: (date?: string) => api.get('/orders/report/daily', { params: { date } }),
    getMonthlyReport: (params?: object) => api.get('/orders/report/monthly', { params }),
};

// ── Tables ──────────────────────────────────────────
export const tablesApi = {
    getAll: () => api.get('/tables'),
    getByNumber: (number: string) => api.get(`/tables/${number}/info`),
    create: (data: object) => api.post('/tables', data),
    update: (id: string, data: object) => api.patch(`/tables/${id}`, data),
    regenerateQR: (id: string) => api.post(`/tables/${id}/regenerate-qr`),
    delete: (id: string) => api.delete(`/tables/${id}`),
};

// ── Auth ────────────────────────────────────────────
// ── Auth & Users ────────────────────────────────────
export const authApi = {
    login: (email: string, password: string) => api.post('/users/login', { email, password }),
    register: (data: object) => api.post('/users/register', data),
    googleLogin: (idToken: string) => api.post('/users/google', { idToken }),
    getMe: () => api.get('/users/me'),
    changePassword: (currentPassword: string, newPassword: string) => api.patch('/auth/change-password', { currentPassword, newPassword }),
};

export const usersApi = {
    getAll: () => api.get('/users'),
    updateRole: (id: string, role: string) => api.patch(`/users/${id}/role`, { role }),
    delete: (id: string) => api.delete(`/users/${id}`),
};

export default api;
