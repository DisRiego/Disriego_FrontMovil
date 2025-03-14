import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { colors } from "@/config/theme";
import { Ionicons } from "@expo/vector-icons";
import { typography } from "@/config/typography";

interface PropertyCardProps {
  name: string;
  id: string;
  folio: string;
  extension: string;
  onPress: () => void;
}

export default function PropertyCard({
  name,
  id,
  folio,
  extension,
  onPress,
}: PropertyCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {/* Encabezado */}
      <View style={styles.header}>
        <Text style={styles.title}>{name}</Text>
        <Ionicons name="chevron-forward" size={20} color={colors.gray} />
      </View>

      {/* ID */}
      <Text style={styles.idText}>#{id}</Text>

      {/* Información en filas */}
      <View style={styles.infoRow}>
        <Text style={styles.label}>Folio Matrícula</Text>
        <Text style={styles.value}>{folio}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Extensión (m²)</Text>
        <Text style={styles.value}>{extension}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 15,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.border,
    shadowOpacity: 0.1,
    shadowRadius: 5,
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
