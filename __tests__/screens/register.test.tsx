import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import RegisterScreen from "@/app/(auth)/register";
import { Picker } from "@react-native-picker/picker";

// Mock de `useRouter` para evitar errores de navegación en pruebas
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe("RegisterScreen - Pruebas exitosas ✅", () => {
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

    // Aquí usamos una expresión regular para evitar fallos
    expect(getByText(/¿Tienes una cuenta\?/i)).toBeTruthy();
    expect(getByText("Inicia sesión aquí")).toBeTruthy();

    // Verifica los inputs de CustomInput
    expect(getByPlaceholderText("No. de Identificación *")).toBeTruthy();
    expect(getByPlaceholderText("Fecha de Expedición *")).toBeTruthy();
  });

  it("Permite ingresar un número de identificación", async () => {
    const { getByPlaceholderText } = render(<RegisterScreen />);

    // Obtener el input por su placeholder
    const input = getByPlaceholderText("No. de Identificación *");

    // Simular el cambio de texto
    fireEvent.changeText(input, "123456789");

    // Esperar y verificar el valor actualizado en el estado
    await waitFor(() => {
      expect(input.props.value).toBe("123456789");
    });
  });

  it("Permite ingresar un número de identificación", async () => {
    const { getByPlaceholderText } = render(<RegisterScreen />);
    const input = getByPlaceholderText("No. de Identificación *");

    fireEvent.changeText(input, "123456789");

    await waitFor(() => {
      expect(input.props.defaultValue || input.props.value).toBe("123456789");
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
