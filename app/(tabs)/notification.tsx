import { View, Text, FlatList, TouchableOpacity, Image } from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { typography } from "@/config/typography";
import { colors } from "@/config/theme";
import { useRouter } from "expo-router";
import {
  fetchNotifications,
  markAllAsRead,
  markAsRead,
  Notificacion,
} from "@/services/notifications";
import { getToken } from "@/services/auth";
import { useNotification } from "@/context/NotificationContext";

const Notification = () => {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  const { unreadCount, refreshUnreadCount } = useNotification();

  useEffect(() => {
    const fetchData = async () => {
      const tk = await getToken();
      setToken(tk);
      if (tk) obtenerNotificaciones(tk);
    };
    fetchData();
  }, []);

  const obtenerNotificaciones = async (tk: string) => {
    try {
      const { notifications } = await fetchNotifications(tk);
      setNotificaciones(notifications);
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.warn("Token expirado. No se actualizarán las notificaciones.");
        return;
      }

      console.error("Error obteniendo notificaciones", error);
    }
  };

  const marcarTodoComoLeido = async () => {
    try {
      if (!token) return;

      await markAllAsRead(token);
      await obtenerNotificaciones(token);
      await refreshUnreadCount();
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.warn("Token expirado. No se puede marcar como leído.");
        return;
      }

      console.error("Error al marcar como leídas", error);
    }
  };

  const marcarComoLeida = async (id: number) => {
    try {
      if (!token) return;
      await markAsRead(token, [id]);
      await obtenerNotificaciones(token);
      await refreshUnreadCount();
    } catch (error) {
      console.error("Error marcando notificación como leída:", error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8F8F8" }}>
      {/* Título */}
      <View style={{ alignItems: "center", paddingVertical: 16 }}>
        <Text style={{ ...typography.bold.large, color: colors.darkGray }}>
          Notificaciones
        </Text>
      </View>

      {/* Lista de Notificaciones */}
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

      {/* Botón flotante */}
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
