import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_URL } from "./config";
import { jwtDecode } from "jwt-decode";

interface UserRole {
  id: number;
  name: string;
  permisos: { id: number; name: string }[];
}

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

// Cache en memoria
let tokenCache: string | null = null;
let emailCache: string | null = null;

const getAuthHeaders = async () => {
  const token = await getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const login = async (email: string, password: string) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password,
    });

    if (!response.data?.access_token) {
      throw new Error("Credenciales incorrectas.");
    }

    const token = response.data.access_token;
    const decoded: DecodedToken = jwtDecode(token); // Decodificamos el token

    await AsyncStorage.multiSet([
      ["token", token],
      ["email", email],
      ["first_login", String(!decoded.first_login_complete)], // Guardamos first_login como string
    ]);

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

export const getToken = async (): Promise<string | null> => {
  if (tokenCache) return tokenCache;

  try {
    tokenCache = await AsyncStorage.getItem("token");
    return tokenCache;
  } catch (error) {
    console.error("Error al obtener el token:", error);
    return null;
  }
};

export const logout = async () => {
  try {
    const token = await getToken();
    if (!token) {
      console.warn("Intento de logout sin token almacenado.");
      return;
    }

    await axios.post(
      `${API_URL}/auth/logout`,
      {},
      { headers: await getAuthHeaders() }
    );

    await AsyncStorage.multiRemove(["token", "email"]);
    tokenCache = null;
    emailCache = null;
    console.log("Cierre de sesión exitoso.");
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
  }
};

// Obtener los roles del usuario directamente desde el token
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

export const getUserData = async () => {
  try {
    const token = await getToken();
    if (!token) throw new Error("No hay token disponible");

    const decoded: DecodedToken = jwtDecode(token);
    const userId = decoded.id;
    if (!userId) throw new Error("El token no contiene un ID válido");

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
