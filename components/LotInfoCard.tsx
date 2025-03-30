import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Pencil } from "lucide-react-native";
import { colors } from "@/config/theme";
import { typography } from "@/config/typography";
import { useLotContext } from "@/context/LotContext";
import moment from "moment"; // Asegúrate de importar moment

export default function LotInfoCard({
  onEditPress,
}: {
  onEditPress?: () => void;
}) {
  const { currentLot } = useLotContext();

  if (!currentLot) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Detalles del Cultivo</Text>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Tipo de Cultivo</Text>
        <Text style={styles.value}>{currentLot.cropType || "N/A"}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Intervalo de Pago</Text>
        <Text style={styles.value}>{currentLot.paymentInterval || "N/A"}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Fecha de Plantación</Text>
        <Text style={styles.value}>
          {currentLot.plantingDate
            ? moment(currentLot.plantingDate).format("YYYY-MM-DD")
            : "N/A"}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Fecha Estimada de Cosecha</Text>
        <Text style={styles.value}>
          {currentLot.estimatedHarvestDate || "N/A"}
        </Text>
      </View>

      {onEditPress && (
        <TouchableOpacity style={styles.editButton} onPress={onEditPress}>
          <Pencil size={18} color={colors.gray} />
          <Text style={styles.editText}>Editar</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 15,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.border,
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  sectionTitle: {
    ...typography.medium.medium,
    fontWeight: "bold",
    color: colors.darkGray,
    marginBottom: 8,
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
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
    justifyContent: "center",
    marginTop: 15,
  },
  editText: {
    color: colors.gray,
    ...typography.medium.medium,
    marginLeft: 8,
  },
});
