import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_URL } from "./config"; // Importar API_URL desde config.ts

export const login = async (email: string, password: string) => {
  try {
    const response = await axios.post(`${API_URL}/users/login`, {
      email,
      password,
    });

    // Verificar si la respuesta tiene el access_token esperado
    if (response.data && response.data.access_token) {
      const { access_token } = response.data;
      await AsyncStorage.setItem("token", access_token); // Guardar el token
      return access_token;
    } else {
      throw new Error("Credenciales incorrectas."); // Lanzar un error si el token no se encuentra
    }
  } catch (error: any) {
    // Manejo de errores específicos: si el error es 401, significa que las credenciales son incorrectas
    if (error.response && error.response.status === 401) {
      throw new Error("Credenciales incorrectas.");
    }

    // Manejo de errores genéricos
    console.error("Error en login:", error);
    throw new Error("Ocurrió un error inesperado.");
  }
};

export const getToken = async () => {
  return await AsyncStorage.getItem("token");
};

export const logout = async () => {
  try {
    // Obtener el token almacenado
    const token = await AsyncStorage.getItem("token");

    // Si no hay token, no podemos proceder
    if (!token) {
      console.log("No hay token para cerrar sesión");
      return;
    }

    // Enviar solicitud al backend para revocar el token
    const response = await axios.post(
      `${API_URL}/users/logout`, // Asegúrate de que la URL sea la correcta
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`, // Pasar el token en el encabezado
        },
      }
    );

    if (response.data.message === "Cierre de sesión exitoso") {
      // Eliminar el token de AsyncStorage después de que el backend lo haya revocado
      await AsyncStorage.removeItem("token");
      console.log("Cierre de sesión exitoso");
    } else {
      console.error("Error al cerrar sesión: ", response.data);
    }
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
  }
};
