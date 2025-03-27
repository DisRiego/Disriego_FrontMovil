import React, { useEffect, useState } from "react";
import { Tabs, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../config/theme";
import { typography } from "../../config/typography";
import { getToken } from "@/services/auth";

/**
 * TabsLayout
 * Gestiona la barra de navegación inferior y verifica la autenticación
 * del usuario antes de permitir el acceso a las rutas protegidas.
 */
const TabsLayout = () => {
  // Estados y hooks
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  /**
   * Efecto para verificar el estado de autenticación
   * Si el usuario no está autenticado, redirige a la pantalla de login
   */
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await getToken();
        if (token) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          router.replace("/login"); // Redirige a login si no está autenticado
        }
      } catch (error) {
        console.error("Error verificando autenticación:", error);
        setIsAuthenticated(false);
        router.replace("/login");
      }
    };

    checkAuth();
  }, [router]);

  // Previene renderizado hasta confirmar estado de autenticación
  if (isAuthenticated === null) {
    return null; // Evita renderizar la UI hasta que se verifique la autenticación
  }

  // Configuración de la barra de navegación por pestañas
  return (
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
          tabBarIcon: ({ color }) => (
            <Ionicons name="notifications-outline" size={22} color={color} />
          ),
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
  );
};

export default TabsLayout;
