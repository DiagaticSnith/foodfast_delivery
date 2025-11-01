import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export const setAuthToken = (token) => {
  api.defaults.headers['Authorization'] = `Bearer ${token}`;
};

// Always attach token from localStorage if available
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  } catch {}
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    const msg = error?.response?.data?.message;
    if ((status === 401) || (status === 403 && msg === 'Invalid token')) {
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } catch {}
      if (typeof window !== 'undefined') {
        try { window.ffToast && window.ffToast.error('Phiên đăng nhập hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.'); } catch {}
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const userAPI = {
  register: (data) => api.post('/api/users/register', data),
  login: (data) => api.post('/api/users/login', data),
  updateInfo: (id, body) => api.put(`/api/users/${id}/info`, body),
};
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

export const reviewAPI = {
  getReviews: (menuId, params) => api.get(`/api/menus/${menuId}/reviews`, { params }),
  postReview: (menuId, body) => api.post(`/api/menus/${menuId}/reviews`, body),
  deleteReview: (id) => api.delete(`/api/reviews/${id}`),
  setStatus: (id, status) => api.put(`/api/reviews/${id}/status`, { status }),
};

export const paymentAPI = {
  createPaymentIntent: (amount) => api.post('/api/payment/create-payment-intent', { amount }),
  createStripeSession: (cartItems, address, userId, email, token) =>
    api.post('/api/stripe/create-session', { cartItems, address, userId, email }, {
      headers: { Authorization: `Bearer ${token}` }
    }),
};