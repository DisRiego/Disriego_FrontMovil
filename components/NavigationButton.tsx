import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { typography } from "@/config/typography";
import { colors } from "@/config/theme";

interface NavigationButtonProps {
  text: string;
  color: string;
  textColor: string;
  borderColor: string;
  route: string;
  onPress?: () => void;
}

const NavigationButton: React.FC<NavigationButtonProps> = ({
  text,
  color,
  textColor,
  borderColor,
  route,
  onPress,
}) => {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: color, borderColor: borderColor, borderWidth: 1 },
      ]}
      onPress={() => router.push(route)}
    >
      <Text style={[styles.buttonText, { color: textColor }]}>{text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: "90%",
    padding: 15,
    marginBottom: 16,
    alignItems: "center",
    borderRadius: 15,
    shadowColor: colors.base,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonText: {
    ...typography.semibold.large,
  },
});

export default NavigationButton;
