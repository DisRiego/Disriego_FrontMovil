/**
 * Componente de layout de autenticación
 * Este componente verifica si el usuario está autenticado y redirige según corresponda.
 * También maneja la pantalla de splash y el comportamiento del teclado.
 */
import React, { useEffect, useState } from "react";
import { Stack, useRouter } from "expo-router";
import { KeyboardAvoidingView, Platform } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { getToken } from "@/services/auth";

// Previene que la pantalla de splash se oculte automáticamente
SplashScreen.preventAutoHideAsync();

export default function AuthLayout() {
  // Estado para controlar si el usuario está autenticado
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  /**
   * Efecto para verificar la autenticación al montar el componente
   * Comprueba si existe un token válido y redirige si es necesario
   */
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Obtiene el token de autenticación
        const token = await getToken();

        if (token) {
          // Usuario autenticado
          setIsAuthenticated(true);
        } else {
          // Usuario no autenticado, redirigir a login
          setIsAuthenticated(false);
          router.replace("/login");
        }
      } catch (error) {
        // Manejo de error en caso de fallo al obtener el token
        console.error("Error al verificar autenticación:", error);
        setIsAuthenticated(false);
        router.replace("/login");
      } finally {
        // Oculta la pantalla de splash una vez completada la verificación
        await SplashScreen.hideAsync();
      }
    };

    // Ejecuta la verificación de autenticación
    checkAuth();
  }, []);

  // Renderiza una pantalla vacía mientras se verifica la autenticación
  if (isAuthenticated === null) {
    return null;
  }

  // Renderiza el layout principal con ajuste de teclado
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      {/* Stack de navegación sin cabecera visible */}
      <Stack screenOptions={{ headerShown: false }} />
    </KeyboardAvoidingView>
  );
}
