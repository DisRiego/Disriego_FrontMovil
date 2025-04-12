import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { colors } from "@/config/theme";
import { Ionicons } from "@expo/vector-icons";
import { typography } from "@/config/typography";

interface ValveRequestCardProps {
  id: number | string;
  type: string;
  date: string;
  onPress?: () => void;
}

export default function ValveRequestCard({
  id,
  type,
  date,
  onPress,
}: ValveRequestCardProps) {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={styles.card}
      {...(onPress && { onPress, accessibilityRole: "button" })}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Solicitud de apertura</Text>
        {onPress && (
          <Ionicons name="chevron-forward" size={20} color={colors.gray} />
        )}
      </View>

      <Text style={styles.idText}>#{id}</Text>

      <View style={styles.infoContainer}>
        <View style={styles.infoColumn}>
          <Text style={styles.label}>Fecha de la solicitud</Text>
          <Text style={styles.value}>{date}</Text>
        </View>

        <View style={styles.infoColumn}>
          <Text style={styles.label}>Tipo de solicitud</Text>
          <Text style={styles.value}>{type}</Text>
        </View>
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
    ...typography.regular.medium,
    color: colors.gray,
    marginBottom: 10,
  },
  infoColumn: {
    flex: 1,
  },
  label: {
    ...typography.medium.regular,
    color: colors.darkGray,
    marginBottom: 2,
  },
  value: {
    ...typography.regular.medium,
    color: colors.gray,
  },
  infoContainer: {
    gap: 12,
  },
});
