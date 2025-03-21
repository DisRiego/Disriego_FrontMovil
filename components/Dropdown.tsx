import { View, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useState } from "react";
import { colors } from "../config/theme"; // Asegúrate de importar los colores correctamente

interface DropdownPickerProps {
  testID?: string;
  selectedValue: string;
  onValueChange: (itemValue: string, itemIndex: number) => void;
  options: { label: string; value: string }[];
}

export default function DropdownPicker({
  selectedValue,
  onValueChange,
  options,
}: DropdownPickerProps) {
  return (
    <View style={styles.pickerContainer}>
      <Picker
        testID="dropdown-document-type"
        selectedValue={selectedValue}
        onValueChange={onValueChange}
        style={styles.picker}
        dropdownIconColor={colors.border}
      >
        {options.map((option) => (
          <Picker.Item
            key={option.value}
            label={option.label}
            value={option.value}
          />
        ))}
      </Picker>
    </View>
  );
}

const styles = StyleSheet.create({
  pickerContainer: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 15,
    backgroundColor: colors.white,
    overflow: "hidden",
  },
  picker: {
    height: 50,
  },
});
