/**
 * Módulo de autenticación
 * Provee funciones para manejo de sesión, autenticación y obtención de datos de usuario
 */

// Importaciones necesarias
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { API_URL } from "@env";

/**
 * Interfaces para tipado
 */
// Define la estructura de un rol de usuario
interface UserRole {
  id: number;
  name: string;
  permisos: { id: number; name: string }[];
}

// Define la estructura completa de un usuario
interface User {
  id: number;
  email: string;
  name: string;
  first_last_name: string;
  second_last_name?: string | null;
  address?: string;
  profile_picture?: string | null;
  phone?: string;
  document_number: number;
  date_issuance_document: string;
  type_document_id: number;
  type_document_name: string;
  status_id: number;
  status_name: string;
  status_description: string;
  gender_id: number;
  gender_name: string;
  roles: { id: number; name: string }[];
  country: string;
  department: string;
  city: number;
  first_login_complete: boolean;
}

// Define la estructura del token JWT decodificado
interface DecodedToken {
  sub: string; // Correo del usuario
  id: number;
  name: string;
  email: string;
  status_date: string;
  rol: UserRole[];
  birthday: string;
  first_login_complete: boolean;
  exp: number; // Expiración del token
}

// Cache en memoria para optimizar acceso
let tokenCache: string | null = null;
let emailCache: string | null = null;

/**
 * Obtiene los headers de autenticación para las peticiones HTTP
 * @returns Objeto con el header de autorización si hay token disponible
 */
const getAuthHeaders = async () => {
  const token = await getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Inicia sesión con email y contraseña
 * @param email Email del usuario
 * @param password Contraseña del usuario
 * @returns Objeto con token y estado de primer inicio de sesión
 */
export const login = async (email: string, password: string) => {
  try {
    // Realizar petición de login
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password,
    });

    // Validar respuesta del servidor
    if (!response.data?.access_token) {
      throw new Error("Credenciales incorrectas.");
    }

    const token = response.data.access_token;
    const decoded: DecodedToken = jwtDecode(token); // Decodificamos el token

    // Guardar información en almacenamiento persistente
    await AsyncStorage.multiSet([
      ["token", token],
      ["email", email],
      ["first_login", String(!decoded.first_login_complete)], // Guardamos first_login como string
    ]);

    // Actualizar cache en memoria
    tokenCache = token;
    emailCache = email;

    return { token, first_login: !decoded.first_login_complete };
  } catch (error: any) {
    console.error("Error en login:", error);
    throw new Error(
      error.response?.status === 401
        ? "Credenciales incorrectas."
        : error.response?.data?.message || "Ocurrió un error inesperado."
    );
  }
};

/**
 * Obtiene el token almacenado
 * @returns Token JWT o null si no hay sesión
 */
export const getToken = async (): Promise<string | null> => {
  // Primero verificar si está en cache
  if (tokenCache) return tokenCache;

  try {
    // Recuperar desde almacenamiento persistente
    tokenCache = await AsyncStorage.getItem("token");
    return tokenCache;
  } catch (error) {
    console.error("Error al obtener el token:", error);
    return null;
  }
};

/**
 * Cierra la sesión del usuario actual
 */
export const logout = async () => {
  try {
    const token = await getToken();
    if (!token) {
      console.warn("Intento de logout sin token almacenado.");
      return;
    }

    // Notificar al servidor sobre el cierre de sesión
    await axios.post(
      `${API_URL}/auth/logout`,
      {},
      { headers: await getAuthHeaders() }
    );

    // Limpiar datos de sesión en almacenamiento local
    await AsyncStorage.multiRemove(["token", "email"]);

    // Limpiar cache en memoria
    tokenCache = null;
    emailCache = null;
    console.log("Cierre de sesión exitoso.");
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
  }
};

/**
 * Obtiene los roles del usuario desde el token JWT
 * @returns Array de roles del usuario o null si hay error
 */
export const getUserRoles = async (): Promise<UserRole[] | null> => {
  try {
    const token = await getToken();
    if (!token) throw new Error("No hay token disponible");

    const decoded: DecodedToken = jwtDecode(token);
    return decoded.rol || [];
  } catch (error: any) {
    console.error("Error obteniendo roles del usuario:", error.message);
    return null;
  }
};

/**
 * Obtiene datos completos del usuario desde el servidor
 * @returns Objeto con datos del usuario o null si hay error
 */
export const getUserData = async () => {
  try {
    // Verificar token disponible
    const token = await getToken();
    if (!token) throw new Error("No hay token disponible");

    // Decodificar token para obtener ID de usuario
    const decoded: DecodedToken = jwtDecode(token);
    const userId = decoded.id;
    if (!userId) throw new Error("El token no contiene un ID válido");

    // Solicitar datos completos del usuario
    const response = await axios.get(`${API_URL}/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    //console.log("Datos del usuario recibidos:", response.data);

    // Acceder al primer elemento del array dentro de "data"
    const user = response.data?.data?.[0] || null;
    return user;
  } catch (error: any) {
    console.error(
      "Error obteniendo datos del usuario:",
      error.response?.data || error.message
    );
    return null;
  }
};
