import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import LoginScreen from "@/app/(auth)/login";
import { useRouter } from "expo-router";

// Mock de useRouter y AsyncStorage
jest.mock("expo-router", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
  })),
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

// Mock del servicio auth
jest.mock("@/services/auth", () => ({
  login: jest.fn(),
}));

describe("LoginScreen - Pruebas Esenciales", () => {
  const mockPush = jest.fn();
  const mockReplace = jest.fn();

  beforeEach(() => {
    // Configurar mocks antes de cada prueba
    mockPush.mockClear();
    mockReplace.mockClear();
    (useRouter as jest.Mock).mockImplementation(() => ({
      push: mockPush,
      replace: mockReplace,
    }));

    // Mockear AsyncStorage para evitar logs de undefined
    require("@react-native-async-storage/async-storage").getItem.mockResolvedValue(
      null
    );

    render(<LoginScreen />);
  });

  it("Renderiza correctamente los elementos básicos", () => {
    // Usamos getAllByText para manejar múltiples elementos con el mismo texto
    const loginTitles = screen.getAllByText(/Iniciar Sesión/i);
    expect(loginTitles.length).toBeGreaterThan(0); // Verifica que existe al menos uno

    expect(screen.getByPlaceholderText(/Correo Electrónico/i)).toBeTruthy();
    expect(screen.getByPlaceholderText(/Contraseña/i)).toBeTruthy();
    expect(screen.getByText(/¿Olvidaste la contraseña?/i)).toBeTruthy();
    expect(screen.getByText(/¿No tienes una cuenta?/i)).toBeTruthy();
    expect(screen.getByText(/Regístrate aquí/i)).toBeTruthy();
  });

  it("Permite llenar los campos de email y contraseña", () => {
    const emailInput = screen.getByPlaceholderText(/Correo Electrónico/i);
    const passwordInput = screen.getByPlaceholderText(/Contraseña/i);

    fireEvent.changeText(emailInput, "test@example.com");
    fireEvent.changeText(passwordInput, "password123");

    expect(emailInput.props.value).toBe("test@example.com");
    expect(passwordInput.props.value).toBe("password123");
  });

  it("Muestra/oculta la contraseña al presionar el icono", () => {
    const passwordInput = screen.getByPlaceholderText(/Contraseña/i);

    // Encontrar el icono de ojo (asumiendo que es el único TouchableOpacity dentro del input de contraseña)
    const passwordInputContainer =
      screen.getByPlaceholderText(/Contraseña/i).parent.parent;
    const toggleButtons =
      passwordInputContainer.findAllByType("TouchableOpacity");

    // Verificar que encontramos exactamente un botón de toggle
    expect(toggleButtons.length).toBe(1);
    const toggleButton = toggleButtons[0];

    // Por defecto debería estar oculta
    expect(passwordInput.props.secureTextEntry).toBe(true);

    // Presionar para mostrar
    fireEvent.press(toggleButton);
    expect(passwordInput.props.secureTextEntry).toBe(false);

    // Presionar nuevamente para ocultar
    fireEvent.press(toggleButton);
    expect(passwordInput.props.secureTextEntry).toBe(true);
  });

  it("Muestra error cuando los campos están vacíos", () => {
    // Encontrar el último botón con texto "Iniciar Sesión" (asumiendo que es el botón de submit)
    const loginButtons = screen.getAllByText(/Iniciar Sesión/i);
    const submitButton = loginButtons[loginButtons.length - 1];

    fireEvent.press(submitButton);

    // Verificar que los inputs muestran error (cambian de color)
    const emailInput = screen.getByPlaceholderText(/Correo Electrónico/i);
    const passwordInput = screen.getByPlaceholderText(/Contraseña/i);

    // Asumiendo que el estilo de error cambia el placeholderTextColor
    expect(emailInput.props.placeholderTextColor).not.toBe(
      passwordInput.props.placeholderTextColor
    );
  });

  it("Navega a pantalla de registro al presionar 'Regístrate aquí'", () => {
    const registerLink = screen.getByText(/Regístrate aquí/i);
    fireEvent.press(registerLink);
    expect(mockPush).toHaveBeenCalledWith("/register");
  });

  it("Navega a pantalla de recuperación de contraseña al presionar 'Haz clic aquí'", () => {
    const forgotPasswordLink = screen.getByText(/Haz clic aquí/i);
    fireEvent.press(forgotPasswordLink);
    expect(mockPush).toHaveBeenCalledWith("/forgotPassword");
  });
});
