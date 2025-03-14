import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import { colors } from "@/config/theme";
import { typography } from "@/config/typography";

interface CustomHeaderProps {
  title: string;
  backRoute?: string;
}

export default function CustomHeader({
  title,
  backRoute = "/(tabs)/profile",
}: CustomHeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.customHeader}>
      {/* Botón de retroceso */}
      <TouchableOpacity
        onPress={() => router.push(backRoute)}
        style={styles.backButton}
      >
        <AntDesign name="left" size={22} color={colors.gray} />
      </TouchableOpacity>

      {/* Título centrado */}
      <Text style={styles.headerTitle}>{title}</Text>

      {/* Espacio a la derecha para balancear la vista */}
      <View style={styles.placeholder} />
    </View>
  );
}

const styles = StyleSheet.create({
  customHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 10,
  },
  headerTitle: {
    flex: 1,
    ...typography.medium.big,
    color: colors.darkGray,
    textAlign: "center",
  },
  placeholder: {
    width: 45,
  },
});
