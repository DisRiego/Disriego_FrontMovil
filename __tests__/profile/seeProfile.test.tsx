import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import SeeProfile from "@/app/profile/seeProfile";

// Mocks mejorados
jest.mock("@/services/auth", () => ({
  getUserData: jest.fn(),
}));

jest.mock("@/services/location", () => ({
  fetchLocationNames: jest.fn(),
}));

jest.mock("@/components/CustomHeader", () => "CustomHeader");

// Mock mejorado de CustomInput que renderiza el texto visible
jest.mock("@/components/CustomInput", () => {
  const { Text, View } = require("react-native");
  return ({ value, placeholder }) => (
    <View>
      <Text testID={`mock-input-${placeholder}`}>{value}</Text>
    </View>
  );
});

describe("SeeProfile Component", () => {
  const mockUserData = {
    name: "John",
    first_last_name: "Doe",
    email: "john.doe@example.com",
    profile_picture: "https://example.com/profile.jpg",
    address: "123 Main St",
    phone: "555-1234",
    gender_name: "Masculino",
    type_document_name: "Cédula",
    document_number: "123456789",
    birthday: "1990-01-01",
    date_issuance_document: "2010-05-15",
    country: "CO",
    department: "05",
    city: "05001",
  };

  const mockLocationNames = {
    country: "Colombia",
    department: "Antioquia",
    city: "Medellín",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renderiza el indicador de carga inicialmente", async () => {
    require("@/services/auth").getUserData.mockImplementation(
      () => new Promise(() => {})
    );

    const { findByText } = render(<SeeProfile />);
    const loadingText = await findByText("Cargando datos...");
    expect(loadingText).toBeTruthy();
  });

  it("muestra los datos del usuario cuando se cargan", async () => {
    require("@/services/auth").getUserData.mockResolvedValue(mockUserData);
    require("@/services/location").fetchLocationNames.mockResolvedValue(
      mockLocationNames
    );

    const { findByText } = render(<SeeProfile />);

    // Verificar datos básicos
    expect(await findByText("John Doe")).toBeTruthy();

    // Verificar datos mediante texto visible
    expect(await findByText("Cédula")).toBeTruthy();
    expect(await findByText("123456789")).toBeTruthy();
    expect(await findByText("john.doe@example.com")).toBeTruthy();
    expect(await findByText("555-1234")).toBeTruthy();
    expect(await findByText("123 Main St")).toBeTruthy();
    expect(await findByText("Colombia, Antioquia, Medellín")).toBeTruthy();
  });

  it("muestra avatar con iniciales cuando no hay imagen", async () => {
    require("@/services/auth").getUserData.mockResolvedValue({
      ...mockUserData,
      profile_picture: null,
    });
    require("@/services/location").fetchLocationNames.mockResolvedValue(
      mockLocationNames
    );

    const { findByText } = render(<SeeProfile />);
    expect(await findByText("JD")).toBeTruthy();
  });
});
