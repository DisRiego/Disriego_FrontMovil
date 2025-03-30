import React, { useEffect, useState } from "react";
import { Stack, useRouter } from "expo-router";
import { KeyboardAvoidingView, Platform } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { getToken } from "@/services/auth";
import { LotProvider } from "@/context/LotContext"; // 👈 Importa tu context

SplashScreen.preventAutoHideAsync();

export default function AuthLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await getToken();
        if (token) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          router.replace("/login");
        }
      } catch (error) {
        console.error("Error al verificar autenticación:", error);
        setIsAuthenticated(false);
        router.replace("/login");
      } finally {
        await SplashScreen.hideAsync();
      }
    };

    checkAuth();
  }, []);

  if (isAuthenticated === null) return null;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      {/* 👇 Aquí envuelves el Stack dentro del Provider */}
      <LotProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </LotProvider>
    </KeyboardAvoidingView>
  );
}
