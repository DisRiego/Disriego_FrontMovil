import { colors } from "@/config/theme";
import { typography } from "@/config/typography";
import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";

interface StatusCardProps {
  status: "exito" | "error";
  message: string;
  description: string;
  onPress: () => void;
}

const StatusCard: React.FC<StatusCardProps> = ({
  status,
  message,
  description,
  onPress,
}) => {
  const imageSource =
    status === "exito"
      ? require("../assets/images/success.png")
      : require("../assets/images/error.png");

  const textColor = status === "exito" ? "#155724" : "#721C24";

  return (
    <View style={[styles.container]}>
      <Image source={imageSource} style={styles.icon} />
      <Text style={[styles.message]}>{message}</Text>
      <Text style={[styles.description]}>{description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    borderRadius: 10,
    width: "90%",
    alignSelf: "center",
  },
  icon: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  message: {
    ...typography.semibold.big,
    color: colors.darkGray,
  },
  description: {
    ...typography.medium.medium,
    color: colors.gray,
    paddingTop: 10,
    textAlign: "center",
  },
});

export default StatusCard;
