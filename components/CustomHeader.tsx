import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import { colors } from "@/config/theme";
import { typography } from "@/config/typography";

interface CustomHeaderProps {
  title: string;
  backRoute?: string | (() => void);
}

export default function CustomHeader({
  title,
  backRoute = "/(tabs)/profile",
}: CustomHeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.customHeader}>
      <TouchableOpacity
        onPress={() => {
          if (typeof backRoute === "function") {
            backRoute();
          } else {
            router.push(backRoute);
          }
        }}
        style={styles.backButton}
      >
        <AntDesign name="left" size={22} color={colors.gray} />
      </TouchableOpacity>

      <Text style={styles.headerTitle}>{title}</Text>

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
    paddingHorizontal: 10,
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
