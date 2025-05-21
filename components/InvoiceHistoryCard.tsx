import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/config/theme";
import { typography } from "@/config/typography";

interface Props {
  invoiceNumber: string;
  dueDate: string;
  amount: string;
  isLast?: boolean;
  onPress?: () => void;
}

export default function InvoiceHistoryCard({
  invoiceNumber,
  dueDate,
  amount,
  isLast = false,
  onPress,
}: Props) {
  return (
    <>
      <TouchableOpacity style={styles.card} onPress={onPress}>
        <View style={styles.header}>
          <Text style={styles.title}>Factura No. {invoiceNumber}</Text>
          <View style={styles.amountRow}>
            <Text style={styles.amount}>{amount}</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.gray} />
          </View>
        </View>
        <Text style={styles.subtitle}>Limite de pago: {dueDate}</Text>
      </TouchableOpacity>

      {!isLast && <View style={styles.divider} />}
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  title: {
    ...typography.medium.regular,
    color: colors.darkGray,
  },
  subtitle: {
    marginTop: 6,
    ...typography.regular.medium,
    color: colors.gray,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  amount: {
    ...typography.medium.regular,
    color: colors.darkGray,
  },
  divider: {
    height: 1,
    backgroundColor: colors.lightGray,
    marginLeft: 16,
    marginRight: 16,
  },
});
