import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export const setAuthToken = (token) => {
  api.defaults.headers['Authorization'] = `Bearer ${token}`;
};

export const userAPI = { register: (data) => api.post('/api/users/register', data), login: (data) => api.post('/api/users/login', data) };
export const menuAPI = { getMenus: (params) => api.get('/api/menus', { params }), createMenu: (data) => api.post('/api/menus', data) };
export const orderAPI = {
  createOrder: (data) => api.post('/api/orders', data),
  getUserOrders: (userId, token) => api.get(`/api/orders/${userId}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
};

export const cartAPI = {
  getCart: () => api.get('/api/cart'),
  addToCart: (menuId, quantity = 1) => api.post('/api/cart/add', { menuId, quantity }),
  removeFromCart: (menuId) => api.post('/api/cart/remove', { menuId }),
  clearCart: () => api.post('/api/cart/clear'),
};

export const paymentAPI = {
  createPaymentIntent: (amount) => api.post('/api/payment/create-payment-intent', { amount }),
  createStripeSession: (cartItems, address, userId, token) =>
    api.post('/api/stripe/create-session', { cartItems, address, userId }, {
      headers: { Authorization: `Bearer ${token}` }
    }),
};