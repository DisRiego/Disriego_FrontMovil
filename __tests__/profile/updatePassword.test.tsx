import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import UpdatePassword from "@/app/profile/updatePassword";

// Mocks básicos que ya funcionan
jest.mock("@/services/auth", () => ({
  getUserData: jest.fn(() =>
    Promise.resolve({
      id: 1,
      name: "John",
      email: "john@example.com",
    })
  ),
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(() => Promise.resolve("mock-token")),
}));

jest.mock("axios", () => ({
  post: jest.fn(() => Promise.resolve({ data: {} })),
}));

// Mock simplificado de CustomHeader
jest.mock("@/components/CustomHeader", () => {
  const { View, Text } = require("react-native");
  return ({ title }: { title: string }) => (
    <View>
      <Text>{title}</Text>
    </View>
  );
});

// Mock simplificado de CustomInput
jest.mock("@/components/CustomInput", () => {
  const { TextInput } = require("react-native");
  return ({ placeholder, value, onChangeText, ...props }: any) => (
    <TextInput
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      {...props}
    />
  );
});

// Mock de otros componentes
jest.mock("@expo/vector-icons", () => ({
  AntDesign: jest.fn(() => null),
}));

jest.mock("lucide-react-native", () => ({
  Eye: jest.fn(() => null),
  EyeOff: jest.fn(() => null),
}));

// Mock del hook de validación
jest.mock("@/hooks/passwordValidation", () => ({
  usePasswordValidation: () => ({
    errors: {
      password: false,
      confirmPassword: false,
    },
    validatePassword: jest.fn(() => true),
    handlePasswordChange: jest.fn((text, setter) => setter(text)),
    handleConfirmPasswordChange: jest.fn((text, _, setter) => setter(text)),
  }),
}));

describe("UpdatePassword Screen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Prueba básica que ya funciona
  it("permite editar los campos de contraseña", async () => {
    const { getByPlaceholderText } = render(<UpdatePassword />);

    const currentPass = getByPlaceholderText("Contraseña actual");
    const newPass = getByPlaceholderText("Contraseña nueva");
    const confirmPass = getByPlaceholderText("Confirmar contraseña");

    fireEvent.changeText(currentPass, "current123");
    fireEvent.changeText(newPass, "newPass123!");
    fireEvent.changeText(confirmPass, "newPass123!");

    await waitFor(() => {
      expect(currentPass.props.value).toBe("current123");
      expect(newPass.props.value).toBe("newPass123!");
      expect(confirmPass.props.value).toBe("newPass123!");
    });
  });

  // Prueba adicional 1: Verifica que el botón esté presente
  it("muestra el botón de guardar cambios", () => {
    const { getByText } = render(<UpdatePassword />);
    expect(getByText("Guardar cambios")).toBeTruthy();
  });

  it("muestra error cuando las contraseñas no coinciden", async () => {
    require("@/hooks/passwordValidation").usePasswordValidation = () => ({
      errors: {
        password: false,
        confirmPassword: true,
      },
      validatePassword: jest.fn(() => true),
      handlePasswordChange: jest.fn((text, setter) => setter(text)),
      handleConfirmPasswordChange: jest.fn((text, currentPassword, setter) => {
        setter(text);
        return { confirmPassword: text !== currentPassword };
      }),
    });

    const { getByText, getByPlaceholderText } = render(<UpdatePassword />);

    fireEvent.changeText(
      getByPlaceholderText("Contraseña nueva"),
      "newPass123!"
    );
    fireEvent.changeText(
      getByPlaceholderText("Confirmar contraseña"),
      "differentPass"
    );

    await waitFor(() => {
      expect(getByText("Las contraseñas no coinciden.")).toBeTruthy();
    });
  });
});
