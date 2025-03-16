import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import LoginScreen from "../../app/(auth)/login";

describe("LoginScreen - Validación de formulario", () => {
  test("Los inputs de email y contraseña se pueden escribir correctamente", () => {
    // Renderiza el componente LoginScreen
    const { getByPlaceholderText } = render(<LoginScreen />);

    // Obtén los inputs de correo y contraseña
    const emailInput = getByPlaceholderText("Correo Electrónico");
    const passwordInput = getByPlaceholderText("Contraseña");

    // Simula la escritura en los inputs
    fireEvent.changeText(emailInput, "usuario@example.com");
    fireEvent.changeText(passwordInput, "Password123");

    // Verifica que los valores de los inputs sean los correctos
    expect(emailInput.props.value).toBe("usuario@example.com");
    expect(passwordInput.props.value).toBe("Password123");
  });
});
