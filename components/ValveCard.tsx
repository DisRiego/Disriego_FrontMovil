import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { colors } from "@/config/theme";
import { typography } from "@/config/typography";
import { Ionicons } from "@expo/vector-icons";

interface ValveCardProps {
  model: string;
  statusName: string;
  statusId?: number;
  serialNumber: string;
  installDate?: string;
  maintenanceDate?: string;
  deviceTypeName?: string;
  onPress?: () => void;
}

export default function ValveCard({
  model,
  statusName,
  statusId,
  serialNumber,
  installDate,
  maintenanceDate,
  deviceTypeName,
  onPress,
}: ValveCardProps) {
  const Container = onPress ? TouchableOpacity : View;

  const displayStatus = [17, 18, 19, 20].includes(statusId ?? -1)
    ? "No Operativo"
    : [21, 22].includes(statusId ?? -1)
    ? "Operativo"
    : statusName || "Desconocido";

  return (
    <Container
      style={styles.card}
      {...(onPress && { onPress, accessibilityRole: "button" })}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{model}</Text>
        {onPress && (
          <Ionicons name="chevron-forward" size={20} color={colors.gray} />
        )}
      </View>

      <Text style={styles.idText}>Serial: {serialNumber}</Text>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Estado</Text>
        <Text style={styles.value}>{displayStatus}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Tipo de dispositivo</Text>
        <Text style={styles.value}>{deviceTypeName || "Desconocido"}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Fecha instalación</Text>
        <Text style={styles.value}>{installDate || "N/A"}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Fecha mantenimiento</Text>
        <Text style={styles.value}>{maintenanceDate || "N/A"}</Text>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 15,
    marginVertical: 6,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.border,
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  title: {
    ...typography.medium.medium,
    fontWeight: "bold",
    color: colors.darkGray,
  },
  idText: {
    ...typography.regular.large,
    color: colors.gray,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 5,
  },
  label: {
    ...typography.regular.medium,
    color: colors.gray,
  },
  value: {
    ...typography.medium.regular,
    fontWeight: "600",
    color: colors.darkGray,
  },
});
