import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import Modal from "react-native-modal";
import { colors } from "@/config/theme";
import { typography } from "@/config/typography";
import { AntDesign, Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useLotContext } from "@/context/LotContext";
import { API_URL_IOT } from "@/services/config";

interface ValveDetailsModalProps {
  isVisible: boolean;
  onClose: () => void;
  model: string;
  serialNumber: string;
  installDate: string;
  maintenanceDate: string;
  status: string; // status_id en string: "11" (operativo), "12" (no operativo)
  deviceId: number;
  deviceTypeName: string;
}

export default function ValveDetailsModal({
  isVisible,
  onClose,
  model,
  serialNumber,
  installDate,
  maintenanceDate,
  status,
  deviceId,
  deviceTypeName,
}: ValveDetailsModalProps) {
  const { getStatusBadge } = useLotContext();
  const badge = getStatusBadge(status);

  const [hasActiveRequest, setHasActiveRequest] = useState(false);

  useEffect(() => {
    const fetchActiveValveRequests = async () => {
      try {
        const res = await fetch(`${API_URL_IOT}/devices-request/request/`);
        const data = await res.json();

        if (data.success) {
          const activeRequests = data.data.filter(
            (r: any) => r.device_iot_id === deviceId && r.status === 18
          );
          setHasActiveRequest(activeRequests.length > 0);
        }
      } catch (err) {
        console.error("Error fetching valve requests:", err);
      }
    };

    if (isVisible) fetchActiveValveRequests();
  }, [isVisible]);

  const handleCloseValve = () => {
    Alert.alert(
      "Confirmar cierre",
      "¿Estás seguro que deseas cerrar la válvula?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Cerrar válvula",
          style: "destructive",
          onPress: () => {
            // Insertar lógica para enviar la solicitud al backend

            Alert.alert("Éxito", "La válvula ha sido cerrada correctamente.");

            onClose();
          },
        },
      ]
    );
  };

  return (
    <Modal isVisible={isVisible} style={styles.modal} onBackdropPress={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <View style={styles.iconContainer}>
              <Feather name="settings" size={22} color={colors.primary} />
            </View>
            <View style={styles.titleTextContainer}>
              <Text style={styles.title}>{model}</Text>
              <Text style={styles.idText}>Serial: {serialNumber}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose}>
            <AntDesign name="close" size={22} color={colors.gray} />
          </TouchableOpacity>
        </View>

        {/* Info */}
        <View style={styles.infoContainer}>
          <View style={styles.row}>
            <Text style={styles.label}>Estado</Text>
            <View style={[styles.badge, { backgroundColor: badge.bg }]}>
              <View
                style={[styles.badgeDot, { backgroundColor: badge.color }]}
              />
              <Text style={[styles.badgeText, { color: badge.color }]}>
                {badge.text}
              </Text>
            </View>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Tipo de dispositivo</Text>
            <Text style={styles.value}>{deviceTypeName || "Desconocido"}</Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.row}>
            <Text style={styles.label}>Fecha instalación</Text>
            <Text style={styles.value}>{installDate || "N/A"}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Fecha mantenimiento</Text>
            <Text style={styles.value}>{maintenanceDate || "N/A"}</Text>
          </View>

          <View style={styles.separator} />
        </View>

        {/* Acciones */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.replace("/properties/requestHistory")}
          >
            <Text style={styles.editText}>Ver historial</Text>
          </TouchableOpacity>

          {status === "Operativo" ? (
            // Solo si es "Operativo"
            <TouchableOpacity
              style={styles.valveActionButton}
              onPress={handleCloseValve}
            >
              <Text style={styles.valveActionText}>Cerrar válvula</Text>
            </TouchableOpacity>
          ) : status === "No Operativo" ? (
            hasActiveRequest ? (
              <TouchableOpacity
                style={[styles.valveActionButton, styles.disabledButton]}
                disabled
              >
                <Text style={[styles.valveActionText, styles.disabledText]}>
                  Pendiente
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.valveActionButton}
                onPress={() => router.replace("/properties/valveOpenForm")}
              >
                <Text style={styles.valveActionText}>Abrir válvula</Text>
              </TouchableOpacity>
            )
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  container: {
    backgroundColor: "white",
    padding: 24,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: "#F1F2F4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  titleTextContainer: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 2,
    marginLeft: 8,
  },
  title: {
    ...typography.semibold.medium,
  },
  idText: {
    color: colors.gray,
    ...typography.regular.large,
    marginBottom: 12,
  },
  infoContainer: {
    paddingVertical: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    alignItems: "center",
  },
  label: {
    color: colors.darkGray,
    fontSize: 14,
  },
  value: {
    color: colors.darkGray,
    fontWeight: "600",
    fontSize: 14,
  },
  separator: {
    height: 0.8,
    backgroundColor: colors.border,
    marginVertical: 5,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  badgeText: {
    fontWeight: "600",
    fontSize: 14,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginTop: 12,
    gap: 32,
  },
  valveActionButton: {
    backgroundColor: colors.tertiary,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
    flex: 1,
    justifyContent: "center",
  },
  valveActionText: {
    color: colors.primary,
    ...typography.medium.medium,
    marginLeft: 8,
  },
  editButton: {
    alignItems: "center",
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
    flex: 1,
    justifyContent: "center",
  },
  editText: {
    color: colors.gray,
    ...typography.medium.medium,
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: colors.secondary,
    opacity: 0.5,
  },
  disabledText: {
    color: colors.primary,
    ...typography.medium.medium,
  },
});
