// Importaciones necesarias
import React from "react";
import { useEffect } from "react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";

// Previene que la pantalla de splash se oculte automáticamente
SplashScreen.preventAutoHideAsync();

/**
 * AuthLayout - Componente de diseño para la autenticación
 * Maneja la carga de fuentes y la gestión de la pantalla de splash
 */
export default function AuthLayout() {
  // Carga las fuentes personalizadas de la aplicación
  const [loaded] = useFonts({
    RobotoBold: require("../../assets/fonts/Roboto-Bold.ttf"),
    RobotoSemiBold: require("../../assets/fonts/Roboto-SemiBold.ttf"),
    RobotoMedium: require("../../assets/fonts/Roboto-Medium.ttf"),
    RobotoRegular: require("../../assets/fonts/Roboto-Regular.ttf"),
    RobotoLight: require("../../assets/fonts/Roboto-Light.ttf"),
  });

  // Efecto para ocultar la pantalla de splash una vez que las fuentes estén cargadas
  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Si las fuentes no están cargadas, no renderiza nada
  if (!loaded) return null;

  // Renderiza el componente Stack sin mostrar el encabezado
  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
