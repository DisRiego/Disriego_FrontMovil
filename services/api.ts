import axios from "axios";
import { getToken } from "./auth";
import { API_URL } from "./config"; // Importar API_URL desde config.ts

const api = axios.create({
  baseURL: API_URL,
});

// Agregar interceptor para incluir el token automáticamente
api.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
