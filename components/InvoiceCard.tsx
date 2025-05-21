import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { colors } from "@/config/theme";
import { typography } from "@/config/typography";
import { Ionicons } from "@expo/vector-icons";

interface InvoiceCardProps {
  invoiceId: number;
  dueDate: string;
  propertyName: string;
  lotName: string;
  amount: string;
  onPress?: () => void;
}

export default function InvoiceCard({
  invoiceId,
  dueDate,
  propertyName,
  lotName,
  amount,
  onPress,
}: InvoiceCardProps) {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={styles.card}
      {...(onPress && { onPress, accessibilityRole: "button" })}
    >
      {/* Título e ícono */}
      <View style={styles.header}>
        <Text style={styles.title}>Factura No. {invoiceId}</Text>
        {onPress && (
          <Ionicons name="chevron-forward" size={18} color={colors.gray} />
        )}
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Valor a pagar:</Text>
        <Text style={styles.value}>{amount}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Fecha Vencimiento:</Text>
        <Text style={styles.value}>{dueDate}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Nombre Predio:</Text>
        <Text style={styles.value}>{propertyName}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Nombre Lote:</Text>
        <Text style={styles.value}>{lotName}</Text>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.border,
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    ...typography.medium.medium,
    fontWeight: "bold",
    color: colors.darkGray,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  label: {
    ...typography.regular.medium,
    color: colors.gray,
  },
  value: {
    ...typography.medium.regular,
    color: colors.darkGray,
    textAlign: "right",
  },
});
