import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { colors } from "@/config/theme";
import { Ionicons } from "@expo/vector-icons";
import { typography } from "@/config/typography";

interface LotCardProps {
  name: string;
  id: string;
  extension?: string;
  cropType?: string;
  onPress?: () => void;
}

export default function LotCard({
  name,
  id,
  extension,
  cropType,
  onPress,
}: LotCardProps) {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container style={styles.card} {...(onPress && { onPress })}>
      {/* Encabezado */}
      <View style={styles.header}>
        <Text style={styles.title}>{name}</Text>
        {onPress && (
          <Ionicons name="chevron-forward" size={20} color={colors.gray} />
        )}
      </View>

      {/* ID */}
      <Text style={styles.idText}>#{id}</Text>

      {/* Información opcional */}
      {extension && (
        <View style={styles.infoRow}>
          <Text style={styles.label}>Extensión (m²)</Text>
          <Text style={styles.value}>{extension}</Text>
        </View>
      )}

      {cropType && (
        <View style={styles.infoRow}>
          <Text style={styles.label}>Tipo Cultivo</Text>
          <Text style={styles.value}>{cropType}</Text>
        </View>
      )}
    </Container>
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
