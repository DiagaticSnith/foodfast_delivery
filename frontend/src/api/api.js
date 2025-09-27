import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export const setAuthToken = (token) => {
  api.defaults.headers['Authorization'] = `Bearer ${token}`;
};

export const userAPI = { register: (data) => api.post('/api/users/register', data), login: (data) => api.post('/api/users/login', data) };
export const menuAPI = { getMenus: (params) => api.get('/api/menus', { params }), createMenu: (data) => api.post('/api/menus', data) };
export const orderAPI = { createOrder: (data) => api.post('/api/orders', data), getUserOrders: (userId) => api.get(`/api/orders/${userId}`) };