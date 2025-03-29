import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { colors } from "@/config/theme";
import { Ionicons } from "@expo/vector-icons";
import { typography } from "@/config/typography";
import { useLotContext } from "@/context/LotContext";

interface PropertyCardProps {
  name: string;
  id: string;
  folio?: string;
  extension?: string;
  latitud?: string;
  longitud?: string;
  onPress?: () => void;
}

export default function PropertyCard({
  name,
  id,
  folio,
  extension,
  latitud,
  longitud,
  onPress,
}: PropertyCardProps) {
  const { setProperty } = useLotContext();
  const Container = onPress ? TouchableOpacity : View;

  const handlePress = () => {
    setProperty({
      id,
      name,
      real_estate_registration_number: folio || "",
      latitude: latitud || "",
      longitude: longitud || "",
      extension: extension || "",
    });

    if (onPress) onPress();
  };

  return (
    <Container style={styles.card} {...(onPress && { onPress: handlePress })}>
      <View style={styles.header}>
        <Text style={styles.title}>{name}</Text>
        {onPress && (
          <Ionicons name="chevron-forward" size={20} color={colors.gray} />
        )}
      </View>

      <Text style={styles.idText}>#{id}</Text>

      {folio && (
        <View style={styles.infoRow}>
          <Text style={styles.label}>Folio Matrícula</Text>
          <Text style={styles.value}>{folio}</Text>
        </View>
      )}

      {extension && (
        <View style={styles.infoRow}>
          <Text style={styles.label}>Extensión (m²)</Text>
          <Text style={styles.value}>{extension}</Text>
        </View>
      )}

      {latitud && (
        <View style={styles.infoRow}>
          <Text style={styles.label}>Latitud</Text>
          <Text style={styles.value}>{latitud}</Text>
        </View>
      )}

      {longitud && (
        <View style={styles.infoRow}>
          <Text style={styles.label}>Longitud</Text>
          <Text style={styles.value}>{longitud}</Text>
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
