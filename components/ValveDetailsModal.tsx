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
  status: string;
  statusId: number;
  deviceId: number;
  deviceTypeName: string;
}

function getValveActionButton({
  statusId,
  requestStatusId,
  openDate,
  closeDate,
  deviceId,
  lotId,
  onClose,
  openValve,
  closeValve,
  fetchDevicesByLot,
  styles,
}: {
  statusId: number;
  requestStatusId: number | null;
  openDate?: string;
  closeDate?: string;
  deviceId: number;
  lotId?: string;
  onClose: () => void;
  openValve: (deviceId: number) => Promise<boolean>;
  closeValve: (deviceId: number) => Promise<boolean>;
  fetchDevicesByLot: (lotId: string) => Promise<void>;
  styles: any;
}) {
  const handleOpen = async () => {
    Alert.alert("Confirmar apertura", "¿Deseas abrir la válvula?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Abrir válvula",
        onPress: async () => {
          const ok = await openValve(deviceId);
          if (ok && lotId) await fetchDevicesByLot(lotId);
          onClose();
        },
      },
    ]);
  };

  const handleClose = async () => {
    Alert.alert("Confirmar cierre", "¿Deseas cerrar la válvula?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Cerrar válvula",
        style: "destructive",
        onPress: async () => {
          const ok = await closeValve(deviceId);
          if (ok && lotId) await fetchDevicesByLot(lotId);
          onClose();
        },
      },
    ]);
  };

  const now = new Date();
  const isWithinWindow =
    openDate && closeDate
      ? now >= new Date(openDate) && now <= new Date(closeDate)
      : false;

  // Mostrar "Crear solicitud" si el dispositivo está No Operativo (12) y la solicitud es Aprobada o Pendiente
  if (
    statusId === 12 &&
    (requestStatusId === null ||
      requestStatusId === 17 ||
      requestStatusId === 18)
  ) {
    return (
      <TouchableOpacity
        style={styles.valveActionButton}
        onPress={() => {
          onClose();
          router.push({
            pathname: "/properties/valveOpenForm",
            params: { lotId, deviceId },
          });
        }}
      >
        <Text style={styles.valveActionText}>Crear solicitud</Text>
      </TouchableOpacity>
    );
  }

  // Mostrar "Pendiente"
  else if (requestStatusId === 18) {
    return (
      <TouchableOpacity
        style={[styles.valveActionButton, styles.disabledButton]}
        disabled
      >
        <Text style={[styles.valveActionText, styles.disabledText]}>
          Pendiente
        </Text>
      </TouchableOpacity>
    );
  }

  // Mostrar "Abrir" o "Cerrar" válvula si está en rango
  else if (requestStatusId === 17 && isWithinWindow) {
    if (statusId === 21) {
      return (
        <TouchableOpacity style={styles.valveActionButton} onPress={handleOpen}>
          <Text style={styles.valveActionText}>Abrir válvula</Text>
        </TouchableOpacity>
      );
    } else if (statusId === 22) {
      return (
        <TouchableOpacity
          style={styles.valveActionButton}
          onPress={handleClose}
        >
          <Text style={styles.valveActionText}>Cerrar válvula</Text>
        </TouchableOpacity>
      );
    }
  }

  // 💤 Si está aprobada pero fuera de rango → "En espera"
  else if (requestStatusId === 17 && !isWithinWindow) {
    return (
      <TouchableOpacity
        style={[styles.valveActionButton, styles.disabledButton]}
        disabled
      >
        <Text style={[styles.valveActionText, styles.disabledText]}>
          En espera
        </Text>
      </TouchableOpacity>
    );
  }

  return null;
}

export default function ValveDetailsModal({
  isVisible,
  onClose,
  model,
  serialNumber,
  installDate,
  maintenanceDate,
  status,
  statusId,
  deviceId,
  deviceTypeName,
}: ValveDetailsModalProps) {
  const {
    getStatusBadge,
    openValve,
    closeValve,
    fetchDevicesByLot,
    currentLot,
  } = useLotContext();

  const [requestStatusId, setRequestStatusId] = useState<number | null>(null);
  const [openDate, setOpenDate] = useState<string | undefined>();
  const [closeDate, setCloseDate] = useState<string | undefined>();

  const displayStatus = [17, 18, 19, 20].includes(statusId)
    ? "No Operativo"
    : [21, 22].includes(statusId)
    ? "Operativo"
    : status || "Desconocido";

  const badge = getStatusBadge(displayStatus);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const fetchActiveValveRequests = async () => {
      try {
        const res = await fetch(`${API_URL_IOT}/devices-request/`);
        const data = await res.json();

        if (data.success) {
          const request = data.data.find(
            (r: any) =>
              r.device_iot_id === deviceId &&
              [18, 20, 21, 17, 19].includes(r.status)
          );

          setRequestStatusId(request ? request.status : null);
          setOpenDate(request?.open_date);
          setCloseDate(request?.close_date);
        }
      } catch (err) {
        console.error("Error fetching valve requests:", err);
      }
    };

    if (isVisible) {
      fetchActiveValveRequests();
      interval = setInterval(fetchActiveValveRequests, 30000);
    }

    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <Modal isVisible={isVisible} style={styles.modal} onBackdropPress={onClose}>
      <View style={styles.container}>
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

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.replace("/properties/requestHistory")}
          >
            <Text style={styles.editText}>Ver historial</Text>
          </TouchableOpacity>

          {getValveActionButton({
            statusId,
            requestStatusId,
            openDate,
            closeDate,
            deviceId,
            lotId: currentLot?.id,
            onClose,
            openValve,
            closeValve,
            fetchDevicesByLot,
            styles,
          })}
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
