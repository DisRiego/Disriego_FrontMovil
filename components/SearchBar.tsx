import React from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/config/theme";
import { typography } from "@/config/typography";

interface SearchBarProps {
  searchText: string;
  onSearchChange: (text: string) => void;
}

export default function SearchBar({
  searchText,
  onSearchChange,
}: SearchBarProps) {
  return (
    <View style={styles.container}>
      <Ionicons name="search" size={18} color={colors.gray} />
      <TextInput
        style={styles.input}
        placeholder="Búsqueda"
        placeholderTextColor={colors.gray}
        value={searchText}
        onChangeText={onSearchChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    paddingHorizontal: 10,
    borderRadius: 10,
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    flex: 1,
    marginLeft: 8,
    ...typography.regular.large,
    color: colors.darkGray,
  },
});
