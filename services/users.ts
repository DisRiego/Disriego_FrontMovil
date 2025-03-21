// user.ts

import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_URL } from "./config";
import { getToken } from "./auth"; // Importamos el getToken desde auth
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  id: number;
  email: string;
  rol: { id: number; name: string }[];
}

export const getUserData = async () => {
  try {
    console.log("🔍 Iniciando getUserData...");

    // Intentamos obtener los datos en caché
    const cachedUser = await AsyncStorage.getItem("user_data");
    if (cachedUser) {
      console.log("📂 Datos en caché encontrados:", JSON.parse(cachedUser));
      return JSON.parse(cachedUser);
    }

    // Obtenemos el token
    const token = await getToken();
    if (!token) throw new Error("No hay token disponible");
    console.log("🔑 Token obtenido:", token);

    // Decodificamos el token
    const decoded: DecodedToken = jwtDecode(token);
    console.log("🧩 Token decodificado:", decoded);

    const userId = decoded.id;
    if (!userId) throw new Error("El token no contiene un ID válido");

    // Llamamos a la API para obtener los datos del usuario
    console.log(`📡 Consultando API: ${API_URL}/users/${userId}`);
    const response = await axios.get(`${API_URL}/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("📥 Respuesta de la API:", response.data);

    // Extraemos los datos del usuario
    const user = response.data?.data?.[0] || null;
    if (user) {
      console.log("✅ Usuario obtenido:", user);
      await AsyncStorage.setItem("user_data", JSON.stringify(user));
    } else {
      console.warn("⚠️ No se encontró usuario en la respuesta.");
    }

    return user;
  } catch (error: any) {
    console.error("❌ Error obteniendo datos del usuario:", error.message);
    return null;
  }
};
