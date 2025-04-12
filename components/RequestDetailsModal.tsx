import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Modal from "react-native-modal";
import { AntDesign, Feather } from "@expo/vector-icons";
import { colors } from "@/config/theme";
import { typography } from "@/config/typography";

interface RequestDetailsModalProps {
  isVisible: boolean;
  onClose: () => void;
  requestId: number | string;
  requestDate: string;
  statusText: string;
  statusColor: string;
  statusBg: string;
  requestType: string;
  openDate: string;
  closeDate: string;
}

export default function RequestDetailsModal({
  isVisible,
  onClose,
  requestId,
  requestDate,
  statusText,
  statusColor,
  statusBg,
  requestType,
  openDate,
  closeDate,
}: RequestDetailsModalProps) {
  return (
    <Modal isVisible={isVisible} style={styles.modal} onBackdropPress={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <View style={styles.iconContainer}>
              <Feather name="clock" size={22} color={colors.primary} />
            </View>
            <View style={styles.titleTextContainer}>
              <Text style={styles.title}>Solicitud de apertura</Text>
              <Text style={styles.idText}>#{requestId}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose}>
            <AntDesign name="close" size={22} color={colors.gray} />
          </TouchableOpacity>
        </View>

        {/* Estado */}
        <View style={styles.infoContainer}>
          <View style={styles.row}>
            <Text style={styles.label}>Estado</Text>
            <View style={[styles.badge, { backgroundColor: statusBg }]}>
              <View
                style={[styles.badgeDot, { backgroundColor: statusColor }]}
              />
              <Text style={[styles.badgeText, { color: statusColor }]}>
                {statusText}
              </Text>
            </View>
          </View>

          <View style={styles.separator} />

          {/* Tipo de solicitud */}
          <View style={styles.row}>
            <Text style={styles.label}>Tipo de solicitud</Text>
            <Text style={styles.value} numberOfLines={3}>
              {requestType}
            </Text>
          </View>

          {/* Fecha de la solicitud */}
          <View style={styles.row}>
            <Text style={styles.label}>Fecha de la solicitud</Text>
            <Text style={styles.value}>{requestDate}</Text>
          </View>

          <View style={styles.separator} />

          {/* Fecha de apertura */}
          <View style={styles.row}>
            <Text style={styles.label}>Fecha de apertura</Text>
            <Text style={styles.value}>{openDate}</Text>
          </View>

          {/* Fecha de cierre */}
          <View style={styles.row}>
            <Text style={styles.label}>Fecha de cierre</Text>
            <Text style={styles.value}>{closeDate}</Text>
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
  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: "#F1F2F4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  titleTextContainer: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 2,
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
    ...typography.medium.medium,
    fontSize: 13,
  },
});
