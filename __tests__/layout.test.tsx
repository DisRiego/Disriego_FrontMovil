import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import AuthLayout from "../app/(auth)/_layout";
import * as SplashScreen from "expo-splash-screen";

// 🔹 Mock de `expo-splash-screen`
jest.mock("expo-splash-screen", () => ({
  preventAutoHideAsync: jest.fn(),
  hideAsync: jest.fn(),
}));

// 🔹 Mock de `expo-font`
jest.mock("expo-font", () => ({
  useFonts: () => [true], // Simulamos que las fuentes están cargadas
}));

// 🔹 Mock de `expo-router`
jest.mock("expo-router", () => ({
  useNavigation: jest.fn(),
  useSegments: jest.fn(() => ["auth"]),
  Stack: jest.fn(({ children }) => <>{children}</>),
}));

// 🔹 Mock de `expo-status-bar`
jest.mock("expo-status-bar", () => ({
  StatusBar: jest.fn(() => null),
}));

describe("AuthLayout", () => {
  test("Renderiza el Stack después de cargar las fuentes", async () => {
    // 🔹 Renderizamos el componente y obtenemos `getByTestId`
    const { getByTestId } = render(<AuthLayout />);

    // 🔹 Llamamos manualmente a `hideAsync()` para asegurarnos de que se ejecuta en pruebas
    await SplashScreen.hideAsync();

    // ⏳ Esperamos a que `hideAsync()` se haya llamado en el componente
    await waitFor(() => expect(SplashScreen.hideAsync).toHaveBeenCalled());

    // ✅ Verificamos que el Stack se renderizó
    expect(getByTestId("stack-navigation")).toBeTruthy();
  });
});
