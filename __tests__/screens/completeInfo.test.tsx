import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import CompleteInfo from "@/app/(auth)/completeInfo";
import { Alert } from "react-native";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";

// Mocks globales
jest.mock("expo-router", () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() })),
}));

jest.mock("axios");

jest.mock("@/services/location", () => ({
  getCountries: jest.fn(() =>
    Promise.resolve([
      { name: "Colombia", iso2: "CO" },
      { name: "Estados Unidos", iso2: "US" },
    ])
  ),
  getStates: jest.fn(),
  getCities: jest.fn(),
  getCountryPhoneCode: jest.fn(),
}));

jest.mock("@/services/auth", () => ({
  getUserData: jest.fn(() => Promise.resolve({ id: 1 })),
}));

describe("CompleteInfo Screen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Renderiza correctamente", () => {
    const { getByText, getByPlaceholderText } = render(<CompleteInfo />);

    expect(getByText("Completa tu perfil")).toBeTruthy();
    expect(getByPlaceholderText("Dirección")).toBeTruthy();
    expect(getByPlaceholderText("Teléfono")).toBeTruthy();
  });

  it("Permite seleccionar imagen", async () => {
    const { getByText } = render(<CompleteInfo />);
    const uploadButton = getByText("Subir");

    fireEvent.press(uploadButton);

    await waitFor(() => {
      expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled();
    });
  });

  it("Muestra error si faltan campos", async () => {
    const { getByText } = render(<CompleteInfo />);
    fireEvent.press(getByText("Registrarse"));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Error",
        "Por favor completa todos los campos."
      );
    });
  });
});
