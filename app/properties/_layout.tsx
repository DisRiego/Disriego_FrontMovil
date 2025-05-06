import React, { useEffect, useState } from "react";
import { Stack, useRouter } from "expo-router";
import { KeyboardAvoidingView, Platform } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { getToken } from "@/services/auth";
import { LotProvider } from "@/context/LotContext";

SplashScreen.preventAutoHideAsync();

export default function PropertiesLayout() {
  // Estado para controlar si el usuario está autenticado
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = await getToken();

      if (token) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        router.dismissAll();
        router.replace("/(auth)/login");
      }

      await SplashScreen.hideAsync();
    };

    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return null;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <LotProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </LotProvider>
    </KeyboardAvoidingView>
  );
}
