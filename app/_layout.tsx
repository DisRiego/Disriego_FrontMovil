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

/**
 * @component PublicLayout
 * @description
 * Componente raíz para la navegación pública.
 * Se encarga de:
 * - Cargar fuentes personalizadas
 * - Mantener el splash screen hasta que todo esté listo
 * - Verificar autenticación del usuario
 * - Redirigir al usuario según su estado de sesión
 *
 * @returns {JSX.Element | null} Stack de navegación o null mientras se cargan fuentes o se verifica autenticación.
 */
export default function PublicLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  /**
   * Carga las fuentes tipográficas personalizadas.
   * Se usa para aplicar fuentes propias en toda la app.
   */
  const [loaded] = useFonts({
    RobotoBold: require("../assets/fonts/Roboto-Bold.ttf"),
    RobotoSemiBold: require("../assets/fonts/Roboto-SemiBold.ttf"),
    RobotoMedium: require("../assets/fonts/Roboto-Medium.ttf"),
    RobotoRegular: require("../assets/fonts/Roboto-Regular.ttf"),
    RobotoLight: require("../assets/fonts/Roboto-Light.ttf"),
  });

  /**
   * @function checkAuth
   * @description Verifica si el usuario tiene un token válido almacenado.
   * Actualiza el estado `isAuthenticated` según el resultado.
   * Se ejecuta una sola vez al montar el componente.
   * @private
   */
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await getToken();
        setIsAuthenticated(!!token);
      } catch (error) {
        console.error("Error verificando autenticación:", error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  /**
   * @function handleSplashAndNavigation
   * @description
   * Cuando las fuentes están cargadas y ya se conoce el estado de autenticación,
   * se oculta el splash screen y se realiza la redirección correspondiente.
   * Si el usuario está en login o register y ya está autenticado, se redirige a /home.
   */
  useEffect(() => {
    if (loaded && isAuthenticated !== null) {
      SplashScreen.hideAsync();

      if (
        segments.length === 1 &&
        (segments[0] === "login" || segments[0] === "register")
      ) {
        router.replace(isAuthenticated ? "/(tabs)/home" : "/login");
      }
    }
  }, [loaded, isAuthenticated, segments, router]);

  // Mientras se cargan fuentes o se verifica autenticación, no se muestra nada
  if (!loaded || isAuthenticated === null) return null;

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
