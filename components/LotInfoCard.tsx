import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Pencil } from "lucide-react-native"; // Importa el ícono de lápiz
import { colors } from "@/config/theme";
import { typography } from "@/config/typography";

interface LotInfoCardProps {
  cropType?: string;
  paymentInterval?: string;
  plantingDate?: string;
  estimatedHarvestDate?: string;
  onEditPress?: () => void;
}

export default function LotInfoCard({
  cropType,
  paymentInterval,
  plantingDate,
  estimatedHarvestDate,
  onEditPress,
}: LotInfoCardProps) {
  console.log("Planting Date:", plantingDate);
  console.log("Estimated Harvest Date:", estimatedHarvestDate);

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Detalles del Cultivo</Text>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Tipo de Cultivo</Text>
        <Text style={styles.value}>{cropType || "N/A"}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Intervalo de Pago</Text>
        <Text style={styles.value}>{paymentInterval || "N/A"}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Fecha de Plantación</Text>
        <Text style={styles.value}>{plantingDate || "N/A"}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Fecha Estimada de Cosecha</Text>
        <Text style={styles.value}>{estimatedHarvestDate || "N/A"}</Text>
      </View>

      {/* Botón de Edición con Ícono */}
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
    marginLeft: 8, // Espacio entre el icono y el texto
  },
});
