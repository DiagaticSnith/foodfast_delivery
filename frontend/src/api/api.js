import axios from 'axios';

// Normalize VITE_API_URL: if user set it without scheme, prepend https://
const rawBase = import.meta.env.VITE_API_URL || '';
let normalizedBase = rawBase;
if (rawBase && !/^https?:\/\//i.test(rawBase)) {
  normalizedBase = `https://${rawBase}`;
}

// Runtime fallback: allow injecting a base URL at runtime by setting
// window.__FF_API_BASE__ (useful if the app was built without VITE_API_URL).
let resolvedBase = normalizedBase;
if (!resolvedBase && typeof window !== 'undefined') {
  const runtime = window.__FF_API_BASE__ || window.__RUNTIME_API_BASE__;
  if (runtime) {
    resolvedBase = runtime;
    if (!/^https?:\/\//i.test(resolvedBase)) resolvedBase = `https://${resolvedBase}`;
  }
}

export const api = axios.create({
  baseURL: resolvedBase || undefined,
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
  // Fail-fast when API base is missing to avoid requests hanging against the static host.
  try {
    const baseIsMissing = (!api.defaults.baseURL && !api.defaults.baseURL === false && !api.defaults.baseURL);
    if (baseIsMissing && config && config.url && config.url.startsWith('/api')) {
      // try to use runtime fallback if available
      if (typeof window !== 'undefined') {
        const runtime = window.__FF_API_BASE__ || window.__RUNTIME_API_BASE__;
        if (runtime) {
          const prefix = /^https?:\/\//i.test(runtime) ? runtime : `https://${runtime}`;
          config.url = prefix.replace(/\/$/, '') + config.url;
        } else {
          console.error('Missing API base URL: set VITE_API_URL at build time or set window.__FF_API_BASE__ at runtime.');
          return Promise.reject(new Error('Missing API base URL'));
        }
      }
    }
  } catch (e) {
    // ignore and continue
  }
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