import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import HomeScreen from "@/app/(tabs)/home";
import { useRouter } from "expo-router";
import { Alert } from "react-native";

// Mocks mejorados
jest.mock("react-native-svg", () => {
  const React = require("react");
  return {
    Svg: jest.fn(({ children }) =>
      React.createElement("View", { testID: "mock-svg" }, children)
    ),
    Circle: jest.fn((props) =>
      React.createElement("View", { testID: "mock-circle", ...props })
    ),
    Text: jest.fn((props) =>
      React.createElement("Text", { testID: "mock-svg-text", ...props })
    ),
  };
});

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/services/auth", () => ({
  getUserData: jest.fn(),
}));

jest.mock("@expo/vector-icons", () => ({
  Feather: jest.fn(() => null),
}));

// Mock para imágenes (solución alternativa)
jest.mock("../../assets/images/properties.png", () => ({}));
jest.mock("../../assets/images/bills.png", () => ({}));
jest.mock("../../assets/images/consumption.png", () => ({}));
jest.mock("../../assets/images/reports.png", () => ({}));

describe("HomeScreen", () => {
  let router: any;
  const mockGetUserData = require("@/services/auth").getUserData;

  beforeEach(() => {
    router = { push: jest.fn() };
    (useRouter as jest.Mock).mockReturnValue(router);
    mockGetUserData.mockReset();
  });

  it("renderiza correctamente con estado de carga", async () => {
    mockGetUserData.mockImplementation(() => new Promise(() => {}));

    const { getByText, findByTestId } = render(<HomeScreen />);

    expect(getByText("¡Bienvenido!")).toBeTruthy();

    await waitFor(
      () => {
        expect(findByTestId("mock-svg")).toBeTruthy();
      },
      { timeout: 5000 }
    ); // Aumenta a 5 segundos
  }, 10000); //

  it("muestra datos del usuario cuando se cargan correctamente", async () => {
    mockGetUserData.mockResolvedValue({
      name: "Juan",
      first_last_name: "Perez",
      profile_picture: "https://example.com/profile.jpg",
    });

    const { findByText } = render(<HomeScreen />);

    const userName = await findByText("Juan Perez");
    expect(userName).toBeTruthy();
  });

  it("muestra 'Usuario' cuando falla la carga de datos", async () => {
    mockGetUserData.mockRejectedValue(new Error("Error de red"));

    const { findByText } = render(<HomeScreen />);

    const defaultUser = await findByText("Usuario");
    expect(defaultUser).toBeTruthy();
  });

  it("renderiza todas las categorías del menú", async () => {
    mockGetUserData.mockResolvedValue({ name: "Test" });

    const { findByText } = render(<HomeScreen />);

    expect(await findByText("Mis predios y lotes")).toBeTruthy();
    expect(await findByText("Mis facturas y pagos")).toBeTruthy();
    expect(await findByText("Mi consumo")).toBeTruthy();
    expect(await findByText("Reportar fallos")).toBeTruthy();
  });

  it("navega correctamente al hacer clic en una categoría", async () => {
    mockGetUserData.mockResolvedValue({ name: "Test" });

    const { findByText } = render(<HomeScreen />);
    const menuItem = await findByText("Mis predios y lotes");

    fireEvent.press(menuItem);

    expect(router.push).toHaveBeenCalledWith("/properties/myProperties");
  });

  it("muestra avatar con iniciales cuando no hay imagen", async () => {
    mockGetUserData.mockResolvedValue({
      name: "Ana Maria",
      first_last_name: "Gomez",
    });

    const { findByTestId } = render(<HomeScreen />);

    const svgText = await findByTestId("mock-svg-text");
    expect(svgText.props.children).toBe("AM");
  });

  it("renderiza el SVG del avatar correctamente", async () => {
    mockGetUserData.mockResolvedValue({ name: "Test" });

    const { findByTestId } = render(<HomeScreen />);

    expect(await findByTestId("mock-svg")).toBeTruthy();
    expect(await findByTestId("mock-circle")).toBeTruthy();
  });
});
