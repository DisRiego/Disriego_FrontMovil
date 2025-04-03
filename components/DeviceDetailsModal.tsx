import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Modal from "react-native-modal";
import { colors } from "@/config/theme";
import { typography } from "@/config/typography";
import { AntDesign, Feather } from "@expo/vector-icons";
import { useLotContext } from "@/context/LotContext";

interface DeviceDetailsModalProps {
  isVisible: boolean;
  onClose: () => void;
  model: string;
  serialNumber: string;
  installDate: string;
  maintenanceDate: string;
  status: string;
}

export default function DeviceDetailsModal({
  isVisible,
  onClose,
  model,
  serialNumber,
  installDate,
  maintenanceDate,
  status,
}: DeviceDetailsModalProps) {
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
            <Text style={styles.label}>Fecha de instalación</Text>
            <Text style={styles.value}>{installDate}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Fecha mantenimiento</Text>
            <Text style={styles.value}>{maintenanceDate}</Text>
          </View>
          <View style={styles.separator} />
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
  title: {
    ...typography.semibold.medium,
  },
  idText: {
    color: colors.gray,
    ...typography.regular.large,
    marginBottom: 12,
  },
  infoContainer: {
    backgroundColor: colors.white,
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
  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: "#F1F2F4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
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
    ...typography.medium.medium,
    fontSize: 13,
  },
});
