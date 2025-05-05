import { View, Text, FlatList, TouchableOpacity, Image } from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { typography } from "@/config/typography";
import { colors } from "@/config/theme";
import {
  fetchNotifications,
  markAllAsRead,
  markAsRead,
  Notificacion,
} from "@/services/notifications";
import { useNotification } from "@/context/NotificationContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

const NOTIF_CACHE_KEY = "notificaciones_cache";

const Notification = () => {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const { unreadCount, refreshUnreadCount } = useNotification();

  useEffect(() => {
    const fetchData = async () => {
      try {
        await obtenerNotificaciones();
      } catch {
        console.warn(
          "No se pudo cargar notificaciones (posible sesión expirada)"
        );
      }
    };

    fetchData();
  }, []);

  const obtenerNotificaciones = async () => {
    try {
      const { notifications } = await fetchNotifications();
      setNotificaciones(notifications);

      // Guardar en caché local
      await AsyncStorage.setItem(
        NOTIF_CACHE_KEY,
        JSON.stringify(notifications)
      );
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.warn(
          "Token expirado. Intentando usar notificaciones cacheadas."
        );
      } else {
        console.warn("Error obteniendo notificaciones:", error.message);
      }

      // Recuperar desde caché
      try {
        const cached = await AsyncStorage.getItem(NOTIF_CACHE_KEY);
        if (cached) {
          setNotificaciones(JSON.parse(cached));
          console.warn("Mostrando notificaciones desde caché local.");
        } else {
          console.warn("No hay datos en caché para mostrar.");
        }
      } catch (cacheError) {
        console.warn("Error leyendo caché local:", cacheError);
      }
    }
  };

  const marcarTodoComoLeido = async () => {
    try {
      await markAllAsRead();
      await obtenerNotificaciones();
      await refreshUnreadCount();
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.warn("Token expirado. No se puede marcar como leído.");
        return;
      }
      console.warn("Error al marcar todo como leído:", error.message);
    }
  };

  const marcarComoLeida = async (id: number) => {
    try {
      await markAsRead([id]);
      await obtenerNotificaciones();
      await refreshUnreadCount();
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.warn("Token expirado. No se puede marcar individualmente.");
        return;
      }
      console.warn("Error al marcar notificación como leída:", error.message);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.base }}>
      <View style={{ alignItems: "center", paddingVertical: 16 }}>
        <Text style={{ ...typography.bold.large, color: colors.darkGray }}>
          Notificaciones
        </Text>
      </View>

      <FlatList
        data={notificaciones}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: "3%" }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => marcarComoLeida(item.id)}
            disabled={item.estado === "leida"}
            style={{
              backgroundColor: item.estado === "leida" ? "#F2F2F2" : "#ECEEF1",
              marginHorizontal: 20,
              marginVertical: 10,
              padding: 15,
              borderRadius: 10,
              borderLeftWidth: 4,
              borderLeftColor:
                item.estado === "leida" ? "#B0B0B0" : colors.primary,
              flexDirection: "row",
              alignItems: "center",
              shadowColor: "#B0B0B0",
              shadowOpacity: 0.15,
              shadowRadius: 4,
              elevation: 2,
              opacity: item.estado === "leida" ? 0.9 : 1,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "#E0E0E0",
                justifyContent: "center",
                alignItems: "center",
                overflow: "hidden",
              }}
            >
              <Image
                source={require("../../assets/images/icon.png")}
                style={{
                  width: 55,
                  height: 55,
                  resizeMode: "contain",
                }}
              />
            </View>

            <View style={{ flex: 1, marginLeft: 10 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={{ ...typography.bold.regular, marginBottom: 5 }}>
                  {item.titulo}
                </Text>
                <Text
                  style={{ color: colors.gray, ...typography.regular.medium }}
                >
                  {item.fecha}
                </Text>
              </View>
              <Text style={{ ...typography.regular.medium }}>
                {item.mensaje}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {unreadCount > 0 && (
        <TouchableOpacity
          onPress={marcarTodoComoLeido}
          style={{
            position: "absolute",
            bottom: 30,
            right: 20,
            backgroundColor: colors.primary,
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 25,
            elevation: 5,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
          }}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>
            Marcar todo leído
          </Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

export default Notification;
