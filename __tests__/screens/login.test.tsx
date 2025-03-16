import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import LoginScreen from "../../app/(auth)/login";
import { useRouter } from "expo-router";

// 🔹 Mock de `expo-router`
const mockPush = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe("LoginScreen", () => {
  test("Navegación a forgotPassword.tsx funciona", () => {
    const { getByText } = render(<LoginScreen />);

    // 🔹 Disparamos el evento de click
    fireEvent.press(getByText("Haz clic aquí"));

    // 🔍 Verificamos si `push` fue llamado
    console.log("🚀 mockRouter.push calls:", mockPush.mock.calls);

    // ✅ Verificamos que se llame a "/forgotPassword"
    expect(mockPush).toHaveBeenCalledWith("/forgotPassword");
  });
});
