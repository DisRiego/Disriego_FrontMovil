import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import RegisterScreen from "@/app/(auth)/register";
import { useRouter } from "expo-router";

// Mock de useRouter
jest.mock("expo-router", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

describe("RegisterScreen - Pruebas Esenciales", () => {
  beforeEach(() => {
    render(<RegisterScreen />);
  });

  it("Renderiza correctamente los elementos básicos", () => {
    // Usamos getAllByText y seleccionamos el primer elemento (título)
    expect(screen.getAllByText(/Registrarse/i)[0]).toBeTruthy();
    expect(screen.getByPlaceholderText(/Correo Electrónico/i)).toBeTruthy();
    expect(screen.getByPlaceholderText(/Contraseña nueva/i)).toBeTruthy();
    expect(screen.getByText(/Inicia sesión aquí/i)).toBeTruthy();
  });

  it("Permite llenar los campos de texto", () => {
    const emailInput = screen.getByPlaceholderText(/Correo Electrónico/i);
    const passwordInput = screen.getByPlaceholderText(/Contraseña nueva/i);

    // Simulamos el cambio de texto directamente en las props
    fireEvent(emailInput, "changeText", "test@example.com");
    fireEvent(passwordInput, "changeText", "password123");

    // Verificamos que los manejadores de cambio fueron llamados
    expect(emailInput.props.value).toBe("test@example.com");
    expect(passwordInput.props.value).toBe("password123");
  });

  it("El botón de Registrarse es presionable", () => {
    // Llenamos los campos requeridos primero
    fireEvent.changeText(
      screen.getByPlaceholderText(/Correo Electrónico/i),
      "test@example.com"
    );
    fireEvent.changeText(
      screen.getByPlaceholderText(/Contraseña nueva/i),
      "ValidPassword123!"
    );
    fireEvent.changeText(
      screen.getByPlaceholderText(/Confirmar contraseña/i),
      "ValidPassword123!"
    );

    // Seleccionamos el botón (segundo elemento con texto "Registrarse")
    const registerButtons = screen.getAllByText(/Registrarse/i);
    fireEvent.press(registerButtons[1]); // El botón es el segundo elemento

    // Verificamos que no hay errores visibles
    expect(screen.queryByText(/Correo inválido/i)).toBeNull();
    expect(screen.queryByText(/Las contraseñas no coinciden/i)).toBeNull();
  });
});
