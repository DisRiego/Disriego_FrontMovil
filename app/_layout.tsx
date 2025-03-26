/**
 * PublicLayout.tsx
 * Componente principal para el manejo de autenticación y navegación.
 * Gestiona el splash screen, carga de fuentes y redirección según estado de autenticación.
 */
import React, { useEffect, useState } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { getToken } from "../services/auth";

// Evita que el splash desaparezca automáticamente
SplashScreen.preventAutoHideAsync();

export default function PublicLayout() {
  // Estados y hooks
  const router = useRouter();
  const segments = useSegments();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Carga de fuentes personalizadas
  const [loaded] = useFonts({
    RobotoBold: require("../assets/fonts/Roboto-Bold.ttf"),
    RobotoSemiBold: require("../assets/fonts/Roboto-SemiBold.ttf"),
    RobotoMedium: require("../assets/fonts/Roboto-Medium.ttf"),
    RobotoRegular: require("../assets/fonts/Roboto-Regular.ttf"),
    RobotoLight: require("../assets/fonts/Roboto-Light.ttf"),
  });

  /**
   * Efecto para verificar el estado de autenticación
   * Recupera el token de usuario y actualiza el estado isAuthenticated
   */
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await getToken();
        setIsAuthenticated(!!token); // true si hay token, false si no
      } catch (error) {
        console.error("Error verificando autenticación:", error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  /**
   * Efecto para manejar la navegación y el splash screen
   * Se ejecuta cuando las fuentes están cargadas y se conoce el estado de autenticación
   */
  useEffect(() => {
    if (loaded && isAuthenticated !== null) {
      SplashScreen.hideAsync(); // Oculta el splash solo cuando todo esté listo

      // Verifica si el usuario está en una pantalla de autenticación
      if (
        segments.length === 1 &&
        (segments[0] === "login" || segments[0] === "register")
      ) {
        // Redirige según el estado de autenticación
        router.replace(isAuthenticated ? "/(tabs)/home" : "/login");
      }
    }
  }, [loaded, isAuthenticated, segments, router]);

  // Previene renderizado hasta que las fuentes estén cargadas y se verifique autenticación
  if (!loaded || isAuthenticated === null) return null;

  // Renderizado del layout principal
  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { marginHorizontal: 0, paddingHorizontal: 0 },
        }}
      >
        <Stack.Screen name="index" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
