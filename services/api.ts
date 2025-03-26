/**
 * Módulo de servicio API
 * Este archivo configura una instancia de Axios para realizar solicitudes HTTP
 * e incluye interceptores para autenticación automática.
 */

// Importaciones necesarias
import axios from "axios";
import { getToken } from "./auth";
import { API_URL } from "./config";

/**
 * Creación de la instancia de Axios
 * Configurada con la URL base desde las variables de configuración
 */
const api = axios.create({
  baseURL: API_URL,
});

/**
 * Interceptor de solicitudes
 * Añade automáticamente el token de autenticación en el encabezado
 * de cada solicitud si está disponible
 */
api.interceptors.request.use(
  async (config) => {
    // Obtener el token de autenticación
    const token = await getToken();

    // Si existe un token, añadirlo al encabezado de autorización
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  // Manejo de errores en el interceptor
  (error) => Promise.reject(error)
);

// Exportar la instancia de API configurada
export default api;
