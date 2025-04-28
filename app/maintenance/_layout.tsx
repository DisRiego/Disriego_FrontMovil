import React, { useEffect, useState } from "react";
import { Stack, useRouter } from "expo-router";
import { KeyboardAvoidingView, Platform } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { getToken } from "@/services/auth";
import { ReportsProvider } from "@/context/ReportContext";

SplashScreen.preventAutoHideAsync();

export default function ReportsLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAccess = async () => {
      const token = await getToken();

      if (!token) {
        setIsAuthenticated(false);
        router.replace("/login");
        return;
      }

      setIsAuthenticated(true);
      await SplashScreen.hideAsync();
    };

    checkAccess();
  }, []);

  if (isAuthenticated === null) return null;

  return (
    <ReportsProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </ReportsProvider>
  );
}
