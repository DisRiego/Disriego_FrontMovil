import React from "react";
import { TextInput, StyleSheet, TextInputProps } from "react-native";
import { colors } from "../config/theme";

interface CustomInputProps extends TextInputProps {}

export default function CustomInput(props: CustomInputProps) {
  return <TextInput {...props} style={[styles.input, props.style]} />;
}

const styles = StyleSheet.create({
  input: {
    width: "100%",
    height: 50,
    padding: 15,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 15,
    backgroundColor: colors.white,
    fontSize: 16,
    color: colors.darkGray,
  },
});
