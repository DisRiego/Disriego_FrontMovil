import React from "react";
import {
  render,
  fireEvent,
  waitFor,
  screen,
  act,
} from "@testing-library/react-native";
import ValveOpenForm from "@/app/properties/valveOpenForm";
import { Alert } from "react-native";

// Mocks mejorados
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

jest.spyOn(Alert, "alert").mockImplementation(() => {});

jest.mock("expo-router", () => ({
  useRouter: () => ({ replace: jest.fn() }),
}));

const mockOptions = [
  { id: 1, label: "Apertura con límite", value: "Apertura con límite" },
  { id: 2, label: "Apertura sin límite", value: "Apertura sin límite" },
];

jest.mock("@/context/LotContext", () => ({
  useLotContext: () => ({
    currentLot: { id: "lot-123" },
    currentValveId: "valve-456",
    fetchValveOpeningTypes: jest.fn().mockResolvedValue(mockOptions),
    createValveRequest: jest.fn().mockResolvedValue(true),
  }),
}));

jest.mock("@/services/auth", () => ({
  getUserData: jest.fn().mockResolvedValue({ id: 1 }),
}));

// Mock mejorado del Dropdown que actualiza el estado correctamente
jest.mock("@/components/Dropdown", () => {
  const React = require("react");
  const { View, Text, TouchableOpacity } = require("react-native");
  return ({ options, onValueChange }: any) => (
    <View testID="dropdown-picker">
      {options.map((option: any) => (
        <TouchableOpacity
          key={option.value}
          onPress={() => {
            // Simular el cambio de valor que haría el componente real
            onValueChange(option.value);
          }}
          testID={`option-${option.value}`}
        >
          <Text>{option.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
});

jest.mock("@/components/Button", () => {
  const React = require("react");
  const { Text, TouchableOpacity } = require("react-native");
  return ({ text, onPress }: any) => (
    <TouchableOpacity onPress={onPress} testID="confirm-button">
      <Text testID="confirm-button-text">{text}</Text>
    </TouchableOpacity>
  );
});

jest.mock("@/components/CustomHeader", () => "CustomHeader");
jest.mock("@react-native-community/datetimepicker", () => "DateTimePicker");

describe("ValveOpenForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Renderiza correctamente", async () => {
    render(<ValveOpenForm />);

    await waitFor(() => {
      expect(screen.getByText("Opciones de apertura")).toBeTruthy();
    });
  });

  it("No muestra campo volumen para apertura sin límite", async () => {
    render(<ValveOpenForm />);

    await waitFor(() => {
      expect(screen.getByTestId("dropdown-picker")).toBeTruthy();
    });

    await act(async () => {
      fireEvent.press(screen.getByTestId("option-Apertura sin límite"));
    });

    await waitFor(() => {
      expect(screen.queryByPlaceholderText("Volumen de agua (m³)")).toBeNull();
    });
  });

  it("Muestra alerta cuando no hay opción seleccionada", async () => {
    render(<ValveOpenForm />);

    await act(async () => {
      fireEvent.press(screen.getByTestId("confirm-button"));
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      "Atención",
      "Por favor, seleccione una opción válida."
    );
  });
});
