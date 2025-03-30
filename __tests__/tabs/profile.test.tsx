import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import Profile from "@/app/(tabs)/profile";
import { router } from "expo-router";

// Mocks necesarios
jest.mock("@/services/auth", () => ({
  getUserData: jest.fn(),
  logout: jest.fn(),
}));

jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
  },
}));

jest.mock("@expo/vector-icons", () => ({
  Ionicons: jest.fn(() => null),
}));

jest.mock("react-native-svg", () => ({
  Svg: jest.fn(({ children }) => children),
  Circle: jest.fn((props) => null),
  Text: jest.fn((props) => null),
}));

describe("Profile Component", () => {
  const mockUserData = {
    name: "John",
    first_last_name: "Doe",
    email: "john.doe@example.com",
    profile_picture: "https://example.com/profile.jpg",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renderiza correctamente el título", () => {
    const { getByText } = render(<Profile />);
    expect(getByText("Mi perfil")).toBeTruthy();
  });

  it("muestra los datos del usuario cuando se cargan", async () => {
    require("@/services/auth").getUserData.mockResolvedValue(mockUserData);

    const { findByText } = render(<Profile />);

    const name = await findByText("John Doe");
    const email = await findByText("john.doe@example.com");

    expect(name).toBeTruthy();
    expect(email).toBeTruthy();
  });

  it("maneja el error al cargar datos del usuario", async () => {
    require("@/services/auth").getUserData.mockRejectedValue(
      new Error("Error")
    );

    const { findByText } = render(<Profile />);

    const defaultName = await findByText("Usuario");
    const defaultEmail = await findByText("email@ejemplo.com");

    expect(defaultName).toBeTruthy();
    expect(defaultEmail).toBeTruthy();
  });

  it("navega a editar perfil al presionar la opción", async () => {
    require("@/services/auth").getUserData.mockResolvedValue(mockUserData);
    const { findByText } = render(<Profile />);

    const editOption = await findByText("Editar Datos");
    fireEvent.press(editOption);

    expect(router.push).toHaveBeenCalledWith("/profile/updateProfile");
  });

  it("navega a actualizar contraseña al presionar la opción", async () => {
    require("@/services/auth").getUserData.mockResolvedValue(mockUserData);
    const { findByText } = render(<Profile />);

    const passwordOption = await findByText("Actualizar contraseña");
    fireEvent.press(passwordOption);

    expect(router.push).toHaveBeenCalledWith("/profile/updatePassword");
  });

  it("cierra sesión correctamente", async () => {
    require("@/services/auth").getUserData.mockResolvedValue(mockUserData);
    require("@/services/auth").logout.mockResolvedValue(true);

    const { findByText } = render(<Profile />);
    const logoutButton = await findByText("Cerrar sesión");

    fireEvent.press(logoutButton);

    await waitFor(() => {
      expect(require("@/services/auth").logout).toHaveBeenCalled();
      expect(router.replace).toHaveBeenCalledWith("/login");
    });
  });
});
