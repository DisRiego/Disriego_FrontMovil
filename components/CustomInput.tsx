import React from "react";
import {
  TextInput,
  StyleSheet,
  TextInputProps,
  View,
  TouchableOpacity,
  Text,
} from "react-native";
import { colors } from "@/config/theme";

interface CustomInputProps extends TextInputProps {
  placeholderTextColor?: string;
  iconRight?: JSX.Element;
  onIconPress?: () => void;
  prefix?: string;
  onPress?: () => void; // Nuevo: Permite hacer que el input sea "touchable"
}

export default function CustomInput({
  placeholderTextColor,
  style,
  iconRight,
  onIconPress,
  prefix,
  onPress, // Nuevo
  editable,
  ...props
}: CustomInputProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
      style={[styles.inputContainer, style]}
      disabled={!onPress} // Solo permite tocar si hay `onPress`
    >
      {prefix && <Text style={styles.prefix}>{prefix}</Text>}
      <TextInput
        {...props}
        style={[styles.input, style]}
        placeholderTextColor={placeholderTextColor || colors.gray}
        editable={editable ?? !onPress} // Bloquea la edición si hay `onPress`
      />
      {iconRight && (
        <TouchableOpacity onPress={onIconPress} style={styles.iconContainer}>
          {iconRight}
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: 400,
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 15,
    backgroundColor: colors.white,
    paddingHorizontal: 15,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.darkGray,
  },
  iconContainer: {
    padding: 10,
  },
  prefix: {
    marginRight: 8,
    fontSize: 16,
    color: colors.darkGray,
  },
});
