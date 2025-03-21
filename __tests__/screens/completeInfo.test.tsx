import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import CompleteInfo from "@/app/(auth)/completeInfo";
import { useRouter } from "expo-router";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

describe("CompleteInfo Screen - Pruebas exitosas ✅", () => {
  let router: any;

  beforeEach(() => {
    router = { push: jest.fn() };
    (useRouter as jest.Mock).mockReturnValue(router);
  });

  it("Renderiza correctamente los elementos esenciales", () => {
    const { getByText, getByPlaceholderText } = render(<CompleteInfo />);

    // Verifica que los elementos clave de la pantalla se rendericen
    expect(getByText("Completa tu perfil")).toBeTruthy();
    expect(getByText("fecha de nacimiento *")).toBeTruthy();
    expect(getByPlaceholderText("Teléfono *")).toBeTruthy();
    expect(getByPlaceholderText("Dirección de correspondencia *")).toBeTruthy();
    expect(getByText("Subir una foto de perfil (Opcional)")).toBeTruthy();
    expect(getByText("Siguiente")).toBeTruthy();
  });

  it("Permite ingresar datos en los campos de texto", () => {
    const { getByPlaceholderText } = render(<CompleteInfo />);

    // Encuentra los inputs de teléfono y dirección
    const phoneInput = getByPlaceholderText("Teléfono *");
    const addressInput = getByPlaceholderText("Dirección de correspondencia *");

    // Simula la escritura en los campos
    fireEvent.changeText(phoneInput, "1234567890");
    fireEvent.changeText(addressInput, "Calle 123");

    // Verifica que los valores han sido actualizados correctamente
    expect(phoneInput.props.value).toBe("1234567890");
    expect(addressInput.props.value).toBe("Calle 123");
  });
});
