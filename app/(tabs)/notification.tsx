import { View, Text, FlatList, TouchableOpacity, Image } from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { typography } from "@/config/typography";
import { colors } from "@/config/theme";
import { AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";

interface Notificacion {
  id: number;
  titulo: string;
  mensaje: string;
  fecha: string;
  estado: "leida" | "no_leida";
}

const Notification = () => {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const router = useRouter();

  useEffect(() => {
    obtenerNotificaciones();
  }, []);

  const obtenerNotificaciones = async () => {
    try {
      const respuesta: Notificacion[] = [
        {
          id: 1,
          titulo: "DisRiego",
          mensaje:
            "El dispositivo [Modelo dispositivo] ha sido asignado a tu predio [Nombre del predio]",
          fecha: "Jul 16, 2025",
          estado: "no_leida",
        },
        {
          id: 2,
          titulo: "DisRiego",
          mensaje:
            "Mantenimiento programado para tu dispositivo en [Nombre del predio]",
          fecha: "Jul 29, 2025",
          estado: "leida",
        },
      ];
      setNotificaciones(respuesta);
    } catch (error) {
      console.error("Error obteniendo notificaciones", error);
    }
  };

  const alternarEstadoNotificacion = (id: number) => {
    setNotificaciones((prevNotificaciones) =>
      prevNotificaciones.map((notificacion) =>
        notificacion.id === id
          ? {
              ...notificacion,
              estado: notificacion.estado === "leida" ? "no_leida" : "leida",
            }
          : notificacion
      )
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8F8F8" }}>
      {/* Encabezado */}
      <View style={{ flexDirection: "row", alignItems: "center", padding: 20 }}>
        <TouchableOpacity onPress={() => router.push("/home")}>
          <AntDesign name="left" size={22} color="black" />
        </TouchableOpacity>
        <Text
          style={{
            flex: 1,
            textAlign: "center",
            ...typography.bold.large,
            color: colors.darkGray,
          }}
        >
          Notificaciones
        </Text>
      </View>

      {/* Lista de Notificaciones */}
      <FlatList
        data={notificaciones}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => alternarEstadoNotificacion(item.id)}
            style={{
              backgroundColor: item.estado === "leida" ? "#FFFFFF" : "#ECEEF1",
              marginHorizontal: 20,
              marginVertical: 10,
              padding: 15,
              borderRadius: 10,
              flexDirection: "row",
              alignItems: "center",
              shadowColor: "#B0B0B0",
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            {/* Contenedor circular para la imagen */}
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

            {/* Contenedor de texto */}
            <View style={{ flex: 1, marginLeft: 10 }}>
              {/* Encabezado con título y fecha alineados */}
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
              {/* Mensaje de la notificación con separación del título */}
              <Text style={{ ...typography.regular.medium }}>
                {item.mensaje}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
};

export default Notification;
