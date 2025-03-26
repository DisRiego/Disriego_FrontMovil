// Importaciones principales de React y componentes nativos
import React, { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";

// Importaciones de navegación y enrutamiento
import { Stack, useRouter } from "expo-router";

// Importaciones de utilidades y servicios
import * as SplashScreen from "expo-splash-screen";
import { getToken } from "@/services/auth"; // Función para obtener el token de autenticación

// Prevenir que la pantalla de splash se oculte automáticamente
SplashScreen.preventAutoHideAsync();

/**
 * AuthLayout - Componente de layout para la autenticación
 *
 * Este componente verifica si el usuario está autenticado.
 * Si no lo está, redirige al usuario a la pantalla de login.
 */
export default function AuthLayout() {
  // Estado para controlar si el usuario está autenticado
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Hook de navegación
  const router = useRouter();

  /**
   * Efecto para verificar el estado de autenticación al montar el componente
   */
  useEffect(() => {
    /**
     * Función asíncrona para verificar la autenticación
     */
    const checkAuth = async () => {
      // Obtener el token de autenticación
      const token = await getToken();

      if (token) {
        // Usuario autenticado
        setIsAuthenticated(true);
      } else {
        // Usuario no autenticado, redirigir a login
        setIsAuthenticated(false);
        router.replace("/login");
      }

      // Ocultar la pantalla de splash una vez verificada la autenticación
      await SplashScreen.hideAsync();
    };

    // Ejecutar la verificación
    checkAuth();
  }, []); // Array de dependencias vacío, se ejecuta solo al montar

  // Mientras se verifica la autenticación, no mostrar nada
  if (isAuthenticated === null) {
    return null;
  }

  // Componente principal
  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
