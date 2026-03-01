import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE,
    timeout: 10000,
});

api.interceptors.request.use((config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401 && typeof window !== 'undefined') {
            localStorage.removeItem('admin_token');
            window.location.href = '/admin/login';
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
export const authApi = {
    login: (email: string, password: string) => api.post('/auth/login', { email, password }),
    getMe: () => api.get('/auth/me'),
    changePassword: (currentPassword: string, newPassword: string) => api.patch('/auth/change-password', { currentPassword, newPassword }),
};

export default api;
