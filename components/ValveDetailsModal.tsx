import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Modal from "react-native-modal";
import { colors } from "@/config/theme";
import { typography } from "@/config/typography";
import { AntDesign, Feather } from "@expo/vector-icons";
import { router, useRouter } from "expo-router";
import { useLotContext } from "@/context/LotContext";

interface ValveDetailsModalProps {
  isVisible: boolean;
  onClose: () => void;
  model: string;
  serialNumber: string;
  installDate: string;
  maintenanceDate: string;
  status: string;
}

export default function ValveDetailsModal({
  isVisible,
  onClose,
  model,
  serialNumber,
  installDate,
  maintenanceDate,
  status,
}: ValveDetailsModalProps) {
  const { getStatusBadge } = useLotContext();
  const badge = getStatusBadge(status);

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

        {/* Información */}
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

        {/* Botones */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.replace("/devices/valveEditRequest")}
          >
            <Text style={styles.editText}>Editar solicitud</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.valveActionButton}
            onPress={
              status.toLowerCase() === "operativo"
                ? () => router.replace("/properties/valveCloseConfirm") // Si está operativo, lleva a la confirmación de cierre
                : () => router.replace("/properties/valveOpenForm") // Si no está operativo, lleva a la apertura
            }
          >
            <Text style={styles.valveActionText}>
              {status.toLowerCase() === "operativo"
                ? "Cerrar válvula"
                : "Abrir válvula"}
            </Text>
          </TouchableOpacity>
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
  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: "#F1F2F4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
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
    height: 0.5,
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
    color: colors.darkGray,
    fontWeight: "bold",
  },
  editButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  editText: {
    color: colors.gray,
    fontWeight: "bold",
  },
});
