import React, { useEffect, useState } from "react";
import { Stack, useRouter } from "expo-router";
import { KeyboardAvoidingView, Platform } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { getToken } from "@/services/auth";

SplashScreen.preventAutoHideAsync();

export default function ProfileLayout() {
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
        router.replace("/login");
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
      <Stack screenOptions={{ headerShown: false }} />
    </KeyboardAvoidingView>
  );
}
