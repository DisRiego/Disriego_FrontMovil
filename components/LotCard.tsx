import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { colors } from "@/config/theme";
import { Ionicons } from "@expo/vector-icons";
import { typography } from "@/config/typography";
import { useLotContext } from "@/context/LotContext";

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
  minimal?: boolean;
  showCropType?: boolean;
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
  plantingDate,
  estimatedHarvestDate,
  onPress,
  minimal = false,
  showCropType = true,
}: LotCardProps) {
  const { setLot } = useLotContext();

  const handlePress = () => {
    setLot({
      id,
      name,
      real_estate_registration_number: folio || "",
      latitude: latitud || "",
      longitude: longitud || "",
      extension: extension || "",
      cropType: cropType || "",
      paymentInterval: paymentInterval || "",
      plantingDate: plantingDate || "",
      estimatedHarvestDate: estimatedHarvestDate || "",
    });

    if (onPress) onPress();
  };

  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={styles.card}
      {...(onPress && { onPress: handlePress, accessibilityRole: "button" })}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{name}</Text>
        {onPress && (
          <Ionicons name="chevron-forward" size={20} color={colors.gray} />
        )}
      </View>

      <Text style={styles.idText}>#{id}</Text>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Folio Matrícula</Text>
        <Text style={styles.value}>{folio || "N/A"}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Extensión (m²)</Text>
        <Text style={styles.value}>{extension || "N/A"}</Text>
      </View>

      {showCropType && (
        <View style={styles.infoRow}>
          <Text style={styles.label}>Tipo Cultivo</Text>
          <Text style={styles.value}>{cropType || "N/A"}</Text>
        </View>
      )}

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
