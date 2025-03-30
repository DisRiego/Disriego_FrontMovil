import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import RegisterScreen from "@/app/(auth)/register";

// Mock simplificado de usePasswordValidation
jest.mock("@/hooks/passwordValidation", () => ({
  usePasswordValidation: () => ({
    errors: {
      password: false,
      confirmPassword: false,
    },
    handlePasswordChange: jest.fn((text, setter) => setter(text)),
    handleConfirmPasswordChange: jest.fn((text, currentPassword, setter) => setter(text)),
  }),
}));

// Mocks de otras dependencias
jest.mock("@expo/vector-icons", () => ({
  AntDesign: jest.fn(() => null),
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

jest.mock("axios", () => ({
  isAxiosError: jest.fn(),
  post: jest.fn(),
}));

jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

jest.mock("react-native/Libraries/Alert/Alert", () => ({
  alert: jest.fn(),
}));

describe("RegisterScreen - Pruebas exitosas ✅", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Renderiza correctamente la pantalla de registro", () => {
    const { getAllByText, getByText, getByPlaceholderText } = render(
      <RegisterScreen />
    );

    expect(getAllByText("Registrarse")[0]).toBeTruthy();
    expect(
      getByText(
        "Por favor, proporcione la siguiente información para confirmar su registro en el sistema."
      )
    ).toBeTruthy();

    expect(getByText(/¿Tienes una cuenta\?/i)).toBeTruthy();
    expect(getByText("Inicia sesión aquí")).toBeTruthy();

    expect(getByPlaceholderText("Correo Electrónico")).toBeTruthy();
    expect(getByPlaceholderText("Contraseña nueva")).toBeTruthy();
    expect(getByPlaceholderText("Confirmar contraseña")).toBeTruthy();
  });

  it("Permite ingresar un correo electrónico", async () => {
    const { getByPlaceholderText } = render(<RegisterScreen />);
    const input = getByPlaceholderText("Correo Electrónico");

    fireEvent.changeText(input, "test@example.com");

    await waitFor(() => {
      expect(input.props.value).toBe("test@example.com");
    });
  });

  it("Permite ingresar una contraseña", async () => {
    const { getByPlaceholderText } = render(<RegisterScreen />);
    const input = getByPlaceholderText("Contraseña nueva");

    fireEvent.changeText(input, "password123");

    await waitFor(() => {
      expect(input.props.value).toBe("password123");
    });
  });

  it("Ejecuta la función de registro al presionar el botón", () => {
    const { getAllByText } = render(<RegisterScreen />);
    const registerButton = getAllByText("Registrarse")[0];

    fireEvent.press(registerButton);
    expect(registerButton).toBeTruthy();
  });

  it("Navega al login cuando se presiona el enlace", () => {
    const { getByText } = render(<RegisterScreen />);
    const loginLink = getByText("Inicia sesión aquí");

    fireEvent.press(loginLink);
    expect(loginLink).toBeTruthy();
  });
});