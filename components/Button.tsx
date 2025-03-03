import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { colors } from "../config/theme";
import { typography } from "../config/typography";

interface ButtonProps {
  text: string;
  onPress: () => void;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ text, onPress, disabled = false }) => {
  return (
    <TouchableOpacity
      style={[styles.button]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[typography.bold.large, { color: colors.primary }]}>
        {text}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: "100%",
    padding: 15,
    backgroundColor: colors.tertiary,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 16,
    position: "relative",
  },
});
export default Button;
