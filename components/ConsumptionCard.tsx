import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { colors } from "@/config/theme";
import { typography } from "@/config/typography";
import { Ionicons } from "@expo/vector-icons";

interface ConsumptionCardProps {
  name: string;
  id: string;
  extension: string;
  startDate: string;
  endDate: string;
  consumption: string;
  onPress?: () => void;
}

const ConsumptionCard: React.FC<ConsumptionCardProps> = ({
  name,
  id,
  extension,
  startDate,
  endDate,
  consumption,
  onPress,
}) => {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={styles.card}
      {...(onPress && { onPress, accessibilityRole: "button" })}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{name}</Text>
        {onPress && (
          <Ionicons name="chevron-forward" size={20} color={colors.gray} />
        )}
      </View>

      <Text style={styles.idText}>#{id}</Text>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Extensión (m²)</Text>
        <Text style={styles.value}>{extension}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Último consumo</Text>
        <Text style={styles.value}>{endDate}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Consumo Registrado</Text>
        <Text style={styles.value}>{consumption} m³</Text>
      </View>
    </Container>
  );
};

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

export default ConsumptionCard;
