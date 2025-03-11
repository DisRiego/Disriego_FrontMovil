import React, { useEffect, useState } from "react";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { getToken } from "@/services/auth"; // Importa la función que obtiene el token

SplashScreen.preventAutoHideAsync();

export default function AuthLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = await getToken();
      if (token) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        router.replace("/login"); // Redirige a login si no está autenticado
      }
      await SplashScreen.hideAsync();
    };

    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return null; // Muestra una pantalla vacía mientras se verifica el token
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
