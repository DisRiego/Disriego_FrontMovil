import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { colors } from "@/config/theme";
import { typography } from "@/config/typography";
import { Ionicons } from "@expo/vector-icons";

interface ReportCardProps {
  type: "report" | "maintenance";
  id: string;
  lotId: string;
  propertyId?: string;
  date: string;
  status: string;
  onPress?: () => void;
}

export default function ReportCard({
  type,
  id,
  lotId,
  propertyId,
  date,
  status,
  onPress,
}: ReportCardProps) {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={styles.card}
      {...(onPress && { onPress, accessibilityRole: "button" })}
    >
      <View style={styles.header}>
        <Text style={styles.title}>ID Reporte</Text>
        {onPress && (
          <Ionicons name="chevron-forward" size={20} color={colors.gray} />
        )}
      </View>

      {type === "maintenance" && (
        <View style={styles.infoRow}>
          <Text style={styles.label}>ID Predio</Text>
          <Text style={styles.value}>{propertyId || "N/A"}</Text>
        </View>
      )}

      <View style={styles.infoRow}>
        <Text style={styles.label}>ID Lote</Text>
        <Text style={styles.value}>{lotId}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Fecha de Reporte</Text>
        <Text style={styles.value}>{date}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Estado</Text>
        <Text style={styles.value}>{status}</Text>
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
    marginBottom: 10,
  },
  title: {
    ...typography.medium.medium,
    color: colors.darkGray,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  label: {
    ...typography.regular.medium,
    color: colors.gray,
  },
  value: {
    ...typography.medium.regular,
    color: colors.darkGray,
  },
});
