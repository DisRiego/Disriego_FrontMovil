import React, { useEffect, useState } from "react";
import { Tabs, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/config/theme";
import { typography } from "@/config/typography";
import { getToken } from "@/services/auth";
import { NotificationProvider } from "@/context/NotificationContext";
import NotificationIcon from "@/components/NotificationIcon";
import { PermissionProvider } from "@/context/PermissionContext";

const Layout = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await getToken();
        if (token) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          router.dismissAll();
          router.replace("/(auth)/login");
        }
      } catch (error) {
        console.error("Error verificando autenticación:", error);
        setIsAuthenticated(false);
        router.dismissAll();
        router.replace("/(auth)/login");
      }
    };

    checkAuth();
  }, [router]);

  if (isAuthenticated === null) {
    return null; // evita render hasta saber si hay sesión
  }

  return (
    <NotificationProvider>
      <PermissionProvider>
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.gray,
            tabBarStyle: {
              height: 68,
              paddingBottom: 10,
              paddingTop: 5,
            },
            tabBarLabelStyle: {
              ...typography.medium.small,
            },
          }}
        >
          {/* Pestaña de Notificaciones */}
          <Tabs.Screen
            name="notification"
            options={{
              title: "Notificaciones",
              headerShown: false,
              tabBarIcon: ({ color }) => <NotificationIcon color={color} />,
            }}
          />

          {/* Pestaña de Inicio */}
          <Tabs.Screen
            name="home"
            options={{
              title: "Inicio",
              headerShown: false,
              tabBarIcon: ({ color }) => (
                <Ionicons name="home-outline" size={22} color={color} />
              ),
            }}
          />

          {/* Pestaña de Perfil */}
          <Tabs.Screen
            name="profile"
            options={{
              title: "Perfil",
              headerShown: false,
              tabBarIcon: ({ color }) => (
                <Ionicons name="person-outline" size={22} color={color} />
              ),
            }}
          />
        </Tabs>
      </PermissionProvider>
    </NotificationProvider>
  );
};

export default Layout;
