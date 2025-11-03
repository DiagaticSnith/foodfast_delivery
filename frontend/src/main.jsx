import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { api } from './api/api';

// Set axios base from runtime-config or build env before mounting app to avoid
// initial fetch race.
try {
  if (typeof window !== 'undefined') {
    const runtime = window.__FF_API_BASE__ || window.__RUNTIME_API_BASE__;
    if (runtime) {
      api.defaults.baseURL = /^https?:\/\//i.test(runtime) ? runtime : `https://${runtime}`;
    } else if (import.meta && import.meta.env && import.meta.env.VITE_API_URL) {
      const v = import.meta.env.VITE_API_URL;
      api.defaults.baseURL = /^https?:\/\//i.test(v) ? v : `https://${v}`;
    }
  }
} catch (e) {}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);