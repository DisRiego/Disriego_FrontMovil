import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface StatusBannerProps {
  type: "success" | "warning";
  title: string;
  subtitle: string;
}

const StatusBanner: React.FC<StatusBannerProps> = ({
  type,
  title,
  subtitle,
}) => {
  const isSuccess = type === "success";

  return (
    <View
      style={[
        styles.container,
        isSuccess ? styles.successBorder : styles.warningBorder,
      ]}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: isSuccess ? "#E8F5E9" : "#FFF8E1" },
        ]}
      >
        <Ionicons
          name={isSuccess ? "wallet-outline" : "notifications-outline"}
          size={22}
          color={isSuccess ? "#2E7D32" : "#F9A825"}
        />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  successBorder: {
    borderLeftWidth: 4,
    borderLeftColor: "#2E7D32",
  },
  warningBorder: {
    borderLeftWidth: 4,
    borderLeftColor: "#F9A825",
  },
  iconContainer: {
    borderRadius: 50,
    padding: 10,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontWeight: "600",
    fontSize: 15,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: "#666",
  },
});

export default StatusBanner;
