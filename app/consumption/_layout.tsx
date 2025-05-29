import React, { useEffect, useState } from "react";
import { Stack, useRouter } from "expo-router";
import { getToken } from "@/services/auth";
import * as SplashScreen from "expo-splash-screen";
import { setupDatabase } from "@/storage/db";
import { ReportsProvider } from "@/context/ReportContext";
import { MaintenanceOptionsProvider } from "@/context/MaintenanceOptionsContext";
import { ConsumptionProvider } from "@/context/ConsumptionContext";

SplashScreen.preventAutoHideAsync();

export default function ConsumptionLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAccess = async () => {
      const token = await getToken();

      if (!token) {
        setIsAuthenticated(false);
        router.dismissAll();
        router.replace("/(auth)/login");
        return;
      }

      setIsAuthenticated(true);
      await SplashScreen.hideAsync();
    };

    checkAccess();
  }, []);

  useEffect(() => {
    setupDatabase();
  }, []);

  if (isAuthenticated === null) return null;

  return (
    <ReportsProvider>
      <MaintenanceOptionsProvider>
        <ConsumptionProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </ConsumptionProvider>
      </MaintenanceOptionsProvider>
    </ReportsProvider>
  );
}
