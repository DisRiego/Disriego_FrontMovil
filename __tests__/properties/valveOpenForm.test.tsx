import React from "react";
import {
  render,
  fireEvent,
  waitFor,
  screen,
} from "@testing-library/react-native";
import ValveOpenForm from "@/app/properties/valveOpenForm";
import { Alert } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Mock de Alert
jest.spyOn(Alert, "alert").mockImplementation(() => {});

// Mock de dependencias externas
jest.mock("expo-router", () => ({
  useRouter: jest.fn(() => ({ replace: jest.fn() })),
}));

jest.mock("@/context/LotContext", () => ({
  useLotContext: jest.fn(() => ({
    currentLot: { id: "lot-123", name: "Lote de Prueba" },
    currentValveId: "valve-456",
    fetchValveOpeningTypes: jest.fn().mockResolvedValue([
      { id: 1, label: "Apertura con límite", value: "con limite" },
      { id: 2, label: "Apertura sin límite", value: "sin limite" },
    ]),
    createValveRequest: jest.fn().mockResolvedValue(true),
  })),
}));

jest.mock("@/components/Dropdown", () => {
  const React = require("react");
  const { View, Text, TouchableOpacity } = require("react-native");
  return ({ options, selectedValue, onValueChange }: any) => (
    <View testID="dropdown-picker">
      <Text>Dropdown: {selectedValue}</Text>
      {options.map((option: any) => (
        <TouchableOpacity
          key={option.value}
          onPress={() => onValueChange(option.value)}
          testID={`dropdown-option-${option.value}`}
        >
          <Text>{option.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
});

describe("ValveOpenForm Component", () => {
  const renderWithSafeArea = (ui: React.ReactElement) => {
    return render(<SafeAreaProvider>{ui}</SafeAreaProvider>);
  };

  it("Renderiza correctamente el formulario inicial", async () => {
    const { debug } = renderWithSafeArea(<ValveOpenForm />);

    debug(); // Esto imprimirá el contenido renderizado en la consola.

    await waitFor(() => {
      expect(screen.getByText("Solicitud de apertura")).toBeTruthy();
      expect(
        screen.getByText("Por favor, complete el siguiente formulario")
      ).toBeTruthy();
      expect(screen.getByText("Opciones de apertura")).toBeTruthy();
      expect(screen.getByTestId("dropdown-picker")).toBeTruthy();
    });
  });

  it("Muestra campos de volumen cuando se selecciona apertura con límite", async () => {
    renderWithSafeArea(<ValveOpenForm />);

    fireEvent.press(screen.getByTestId("dropdown-option-con limite"));

    await waitFor(() => {
      expect(screen.getByText("Volumen de agua")).toBeTruthy();
      expect(screen.getByPlaceholderText("Volumen de agua (m³)")).toBeTruthy();
    });
  });

  it("No muestra campo de volumen cuando se selecciona apertura sin límite", async () => {
    renderWithSafeArea(<ValveOpenForm />);

    fireEvent.press(screen.getByTestId("dropdown-option-sin limite"));

    await waitFor(() => {
      expect(screen.queryByPlaceholderText("Volumen de agua (m³)")).toBeNull();
    });
  });

  it("Muestra alerta cuando no se selecciona una opción válida", async () => {
    renderWithSafeArea(<ValveOpenForm />);

    fireEvent.press(screen.getByText("Confirmar"));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Atención",
        "Por favor, seleccione una opción válida."
      );
    });
  });
});
