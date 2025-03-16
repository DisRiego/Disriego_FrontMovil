import React from "react";
import {
  TextInput,
  StyleSheet,
  TextInputProps,
  View,
  TouchableOpacity,
} from "react-native";
import { colors } from "@/config/theme";

interface CustomInputProps extends TextInputProps {
  placeholderTextColor?: string;
  iconRight?: JSX.Element;
  onIconPress?: () => void;
}

export default function CustomInput({
  placeholderTextColor,
  style,
  iconRight,
  onIconPress,
  ...props
}: CustomInputProps) {
  return (
    <View style={[styles.inputContainer, style]}>
      <TextInput
        {...props}
        style={[styles.input, style]}
        placeholderTextColor={placeholderTextColor || colors.gray}
      />
      {iconRight && (
        <TouchableOpacity onPress={onIconPress} style={styles.iconContainer}>
          {iconRight}
        </TouchableOpacity>
      )}
    </View>
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
});
