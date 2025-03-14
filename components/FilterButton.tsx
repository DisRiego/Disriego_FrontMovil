import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/config/theme";

interface FilterButtonProps {
  onPress: () => void;
}

export default function FilterButton({ onPress }: FilterButtonProps) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Ionicons name="filter" size={18} color={colors.gray} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.white,
    paddingHorizontal: 15,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
});
