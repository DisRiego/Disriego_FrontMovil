import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_URL } from "./config";
import { jwtDecode } from "jwt-decode";

interface User {
  gender: string;
  id: number;
  email: string;
  name: string;
  first_last_name: string;
  second_last_name?: string | null;
  address?: string;
  profile_picture?: string | null;
  phone?: string;
  status_name: string;
  roles: { id: number; name: string }[];
}

// Interfaz para el error específico de cuenta no activada
interface NotActivatedError {
  status: string;
  message: string;
  token: string;
}

// Cache en memoria para evitar llamadas innecesarias a AsyncStorage
let tokenCache: string | null = null;
let emailCache: string | null = null;

// Obtener los headers con token automáticamente
const getAuthHeaders = async () => {
  const token = await getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Iniciar sesión y almacenar token en AsyncStorage + memoria
export const login = async (email: string, password: string) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password,
    });

    if (!response.data?.access_token) {
      throw new Error("Credenciales incorrectas.");
    }

    tokenCache = response.data.access_token; // Cache en memoria
    emailCache = email;

    if (tokenCache) {
      await AsyncStorage.multiSet([
        ["token", tokenCache],
        ["email", email],
        // Guardar datos de usuario completos
        ["userData", JSON.stringify(response.data)],
        // Establecer flag de first login basado en el token
        ["isFirstLogin", response.data.first_login_complete ? "false" : "true"],
      ]);
    } else {
      throw new Error("Token is null");
    }

    return tokenCache;
  } catch (error: any) {
    console.error("Error en login:", error);

    // Manejar caso específico de cuenta no activada
    if (
      error.response?.status === 401 &&
      typeof error.response?.data?.detail === "object" &&
      error.response?.data?.detail.status === "false"
    ) {
      const notActivatedError = error.response.data.detail as NotActivatedError;
      // Puedes guardar el token temporal si es necesario
      await AsyncStorage.setItem("activation_token", notActivatedError.token);
      throw new Error(notActivatedError.message);
    }

    // Manejar caso de cuenta inactiva o bloqueada
    if (
      error.response?.status === 401 &&
      error.response?.data?.detail ===
        "Cuenta inactiva o bloqueada. No se permite el acceso."
    ) {
      throw new Error("Cuenta inactiva o bloqueada. No se permite el acceso.");
    }

    // Otros errores
    throw new Error(
      error.response?.status === 401
        ? "Credenciales incorrectas."
        : error.response?.data?.detail ||
          error.response?.data?.message ||
          "Ocurrió un error inesperado."
    );
  }
};

// Obtener el token desde memoria o AsyncStorage (si es necesario)
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

// Obtener el email del usuario desde memoria o AsyncStorage
export const getEmail = async (): Promise<string | null> => {
  if (emailCache) return emailCache;

  try {
    emailCache = await AsyncStorage.getItem("email");
    return emailCache;
  } catch (error) {
    console.error("Error al obtener el email:", error);
    return null;
  }
};

// Cerrar sesión y limpiar memoria + AsyncStorage
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

// Interfaz del token decodificado
interface DecodedToken {
  id: number;
  email: string;
  exp: number; // Expiración del token
}

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

    console.log("Datos del usuario recibidos:", response.data);

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
