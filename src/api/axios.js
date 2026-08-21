import axios from "axios";

// ============================================
// ✅ SELALU PAKAI RELATIVE URL
//    Backend (apipresensi.sidoarjokab.go.id) TIDAK
//    mengizinkan CORS untuk request langsung dari browser,
//    jadi harus selalu lewat proxy server-side:
//    - dev: vite.config.js -> server.proxy
//    - production: vercel.json -> rewrites
// ============================================
const api = axios.create({
  baseURL: "/api/v1",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
    "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
  },
  timeout: 30000,
});

// ============================================
// REQUEST INTERCEPTOR
// ============================================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`, {
      data: config.data instanceof FormData ? "FormData" : config.data,
    });

    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================
// RESPONSE INTERCEPTOR
// ============================================
api.interceptors.response.use(
  (response) => {
    console.log(`📥 ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    if (error.response?.status === 403) {
      console.error("🛡️ Akses ditolak oleh API!");
    }
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;