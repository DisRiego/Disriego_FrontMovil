import React, { useEffect, useState } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { getToken } from "../services/auth";

// Íconos para precargar
import {
  AntDesign,
  Ionicons,
  Feather,
  MaterialIcons,
} from "@expo/vector-icons";

SplashScreen.preventAutoHideAsync();

export default function PublicLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const [loaded] = useFonts({
    RobotoBold: require("../assets/fonts/Roboto-Bold.ttf"),
    RobotoSemiBold: require("../assets/fonts/Roboto-SemiBold.ttf"),
    RobotoMedium: require("../assets/fonts/Roboto-Medium.ttf"),
    RobotoRegular: require("../assets/fonts/Roboto-Regular.ttf"),
    RobotoLight: require("../assets/fonts/Roboto-Light.ttf"),
    ...AntDesign.font,
    ...Ionicons.font,
    ...Feather.font,
    ...MaterialIcons.font,
  });

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
