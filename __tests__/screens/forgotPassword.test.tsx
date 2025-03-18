import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import ForgotPasswordScreen from "@/app/(auth)/forgotPassword";
import { Alert } from "react-native";
import axios from "axios";

// Mock de Axios para simular peticiones HTTP
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock de Alert para capturar las alertas generadas en la UI
jest.mock("react-native/Libraries/Alert/Alert", () => ({
  alert: jest.fn(),
}));

describe("ForgotPasswordScreen", () => {
  // Prueba para verificar que los elementos básicos de la pantalla se renderizan correctamente
  test("Renderiza correctamente los elementos básicos", () => {
    const { getByText, getByPlaceholderText } = render(
      <ForgotPasswordScreen />
    );

    expect(getByText("¿Olvidaste tu contraseña?")).toBeTruthy();
    expect(getByPlaceholderText("Ingresa tu correo electrónico")).toBeTruthy();
    expect(getByText("Enviar enlace")).toBeTruthy();
  });

  // Prueba para verificar que se muestra una alerta si el usuario intenta enviar un formulario vacío
  test("Muestra una alerta si el input está vacío y se intenta enviar", () => {
    const { getByText } = render(<ForgotPasswordScreen />);
    fireEvent.press(getByText("Enviar enlace"));

    expect(Alert.alert).toHaveBeenCalledWith(
      "Error",
      "Por favor, ingresa tu correo electrónico."
    );
  });

  // Prueba para verificar que el usuario puede ingresar un correo y que el estado se actualiza correctamente
  test("Permite ingresar un correo y se actualiza el estado", () => {
    const { getByPlaceholderText } = render(<ForgotPasswordScreen />);
    const emailInput = getByPlaceholderText("Ingresa tu correo electrónico");

    fireEvent.changeText(emailInput, "usuario@email.com");
    console.log("🔹 Valor del input:", emailInput.props.value);
    expect(emailInput.props.value).toBe("usuario@email.com");
  });

  // Prueba para verificar que se muestra una alerta de éxito cuando el correo se envía correctamente
  test("Muestra una alerta de éxito si el correo se envía correctamente", async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { token: "fake-reset-token" },
    });

    console.log("🔹 Simulación de Axios POST ejecutada");

    const { getByPlaceholderText, getByText } = render(
      <ForgotPasswordScreen />
    );
    const emailInput = getByPlaceholderText("Ingresa tu correo electrónico");
    fireEvent.changeText(emailInput, "usuario@email.com");
    console.log("🔹 Valor final del input:", emailInput.props.value);

    fireEvent.press(getByText("Enviar enlace"));
    console.log("🔹 Axios post fue llamado:", mockedAxios.post.mock.calls);

    await waitFor(() => {
      const alertMock = Alert.alert as jest.Mock;
      const alertCalls = alertMock.mock.calls;
      console.log("🔹 Alertas disparadas:", alertCalls);

      // Verificamos que al menos una alerta fue llamada
      expect(alertCalls.length).toBeGreaterThan(0);

      // Buscamos la alerta de éxito específica
      const lastAlert = alertCalls.find((call) => call[0] === "Éxito");
      expect(lastAlert).toBeDefined();
      const [title, message] = lastAlert!;

      expect(title).toBe("Éxito");
      expect(message).toBe(
        "Se ha enviado un enlace de recuperación a tu correo."
      );
    });
  });
});
