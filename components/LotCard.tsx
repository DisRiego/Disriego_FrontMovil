import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { colors } from "@/config/theme";
import { Ionicons } from "@expo/vector-icons";
import { typography } from "@/config/typography";

interface LotCardProps {
  name: string;
  id: string;
  folio?: string;
  extension?: string;
  latitud?: string;
  longitud?: string;
  cropType?: string;
  paymentInterval?: string;
  plantingDate?: string;
  estimatedHarvestDate?: string;
  onPress?: () => void;
  minimal?: boolean; // Controla la visibilidad de ciertos datos
  showCropType?: boolean; // Nueva prop para controlar la visibilidad del tipo de cultivo
}

export default function LotCard({
  name,
  id,
  folio,
  extension,
  latitud,
  longitud,
  cropType,
  paymentInterval,
  onPress,
  minimal = false, // Por defecto, muestra todo
  showCropType = true, // Por defecto, se muestra el tipo de cultivo
}: LotCardProps) {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={styles.card}
      {...(onPress && { onPress, accessibilityRole: "button" })}
    >
      {/* Encabezado */}
      <View style={styles.header}>
        <Text style={styles.title}>{name}</Text>
        {onPress && (
          <Ionicons name="chevron-forward" size={20} color={colors.gray} />
        )}
      </View>

      <Text style={styles.idText}>#{id}</Text>
      {/* Información visible en ambos modos */}
      <View style={styles.infoRow}>
        <Text style={styles.label}>Folio Matrícula</Text>
        <Text style={styles.value}>{folio || "N/A"}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Extensión (m²)</Text>
        <Text style={styles.value}>{extension || "N/A"}</Text>
      </View>

      {/* Mostrar el tipo de cultivo solo si `showCropType` es `true` */}
      {showCropType && (
        <View style={styles.infoRow}>
          <Text style={styles.label}>Tipo Cultivo</Text>
          <Text style={styles.value}>{cropType || "N/A"}</Text>
        </View>
      )}

      {/* Oculta latitud y longitud si `minimal` es `true` */}
      {!minimal && (
        <>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Latitud</Text>
            <Text style={styles.value}>{latitud || "N/A"}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Longitud</Text>
            <Text style={styles.value}>{longitud || "N/A"}</Text>
          </View>
        </>
      )}

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
    elevation: 3, // Para sombras en Android
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
  separator: {
    height: 0.5,
    backgroundColor: colors.border,
    marginVertical: 5,
  },
});
