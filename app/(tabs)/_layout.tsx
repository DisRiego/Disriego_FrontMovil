import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons"; // Importar iconos
import { colors } from "../../config/theme";
import { typography } from "../../config/typography";

const TabsLayout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary, // Color de icono activo
        tabBarInactiveTintColor: colors.gray, // Color de icono inactivo
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
      <Tabs.Screen
        name="notification"
        options={{
          title: "Notificaciones",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications-outline" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="home"
        options={{
          title: "Inicio",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;
