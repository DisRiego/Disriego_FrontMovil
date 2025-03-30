import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import UpdateProfile from "@/app/profile/updateProfile";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Mock de componentes personalizados
jest.mock("@/components/CustomHeader", () => "CustomHeader");
jest.mock("@/components/CustomInput", () => {
  const { TextInput } = require("react-native");
  return ({ value, onChangeText, placeholder, ...props }) => (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      testID={`input-${placeholder}`}
      {...props}
    />
  );
});
jest.mock("@/components/Dropdown", () => {
  const { View, Text, TouchableOpacity } = require("react-native");
  return ({ selectedValue, onValueChange, options, disabled }) => (
    <View testID="dropdown-picker">
      {options.map((option) => (
        <TouchableOpacity
          key={option.value}
          onPress={() => !disabled && onValueChange(option.value)}
          testID={`dropdown-option-${option.value}`}
        >
          <Text>{option.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
});
jest.mock("@/components/Button", () => "CustomButton");

// Mock simplificado de react-native-svg con testID
jest.mock("react-native-svg", () => {
  const { View } = require("react-native");
  return {
    Svg: View,
    Circle: View,
    Text: ({ children, ...props }) => (
      <View {...props} testID="svg-text">
        {children}
      </View>
    ),
  };
});

// Mock de servicios
const mockGetUserData = jest.fn();
const mockGetCountries = jest.fn();
const mockGetStates = jest.fn();
const mockGetCities = jest.fn();

jest.mock("@/services/auth", () => ({
  getUserData: () => mockGetUserData(),
}));

jest.mock("@/services/location", () => ({
  getCountries: () => mockGetCountries(),
  getStates: (countryCode: string) => mockGetStates(countryCode),
  getCities: (countryCode: string, stateCode: string) =>
    mockGetCities(countryCode, stateCode),
}));

// Mock de expo-router
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
}));

describe("UpdateProfile Component - Pruebas Estables", () => {
  const mockUser = {
    id: "1",
    name: "John",
    first_last_name: "Doe",
    address: "123 Main St",
    phone: "1234567890",
    country: "US",
    department: "CA",
    city: "Los Angeles",
    profile_picture: "https://example.com/profile.jpg",
  };

  const mockUserWithoutImage = {
    ...mockUser,
    profile_picture: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUserData.mockResolvedValue(mockUser);
    mockGetCountries.mockResolvedValue([
      { name: "United States", iso2: "US" },
      { name: "Colombia", iso2: "CO" },
    ]);
    mockGetStates.mockResolvedValue([
      { name: "California", iso2: "CA" },
      { name: "New York", iso2: "NY" },
    ]);
    mockGetCities.mockResolvedValue([
      { name: "Los Angeles", id: "LA" },
      { name: "San Francisco", id: "SF" },
    ]);
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue("fake-token");
  });

  it("renderiza el indicador de carga inicialmente", async () => {
    const { getByText } = render(<UpdateProfile />);
    expect(getByText("Cargando datos...")).toBeTruthy();

    await waitFor(() => expect(getByText("John Doe")).toBeTruthy());
  });

  it("muestra los datos del usuario después de cargar", async () => {
    const { getByText, getByDisplayValue } = render(<UpdateProfile />);

    await waitFor(() => {
      expect(getByText("John Doe")).toBeTruthy();
      expect(getByDisplayValue("123 Main St")).toBeTruthy();
      expect(getByDisplayValue("1234567890")).toBeTruthy();
    });
  });

  it("maneja el cambio de país y carga los estados", async () => {
    const { getByTestId, getByText } = render(<UpdateProfile />);

    await waitFor(() => expect(getByText("John Doe")).toBeTruthy());

    fireEvent.press(getByTestId("dropdown-option-CO"));

    expect(mockGetStates).toHaveBeenCalledWith("CO");
  });

  it("maneja el cambio de estado y carga las ciudades", async () => {
    const { getByTestId, getByText } = render(<UpdateProfile />);

    await waitFor(() => expect(getByText("John Doe")).toBeTruthy());

    fireEvent.press(getByTestId("dropdown-option-NY"));

    expect(mockGetCities).toHaveBeenCalledWith("US", "NY");
  });

  it("actualiza el número de teléfono solo con valores numéricos", async () => {
    const { getByDisplayValue, getByTestId } = render(<UpdateProfile />);

    await waitFor(() => expect(getByDisplayValue("1234567890")).toBeTruthy());

    const phoneInput = getByTestId("input-Teléfono");
    fireEvent.changeText(phoneInput, "123abc456!@#7890");

    expect(getByDisplayValue("1234567890")).toBeTruthy();
  });

  it("muestra avatar con iniciales cuando no hay imagen disponible", async () => {
    mockGetUserData.mockResolvedValueOnce(mockUserWithoutImage);

    const { getByTestId } = render(<UpdateProfile />);

    await waitFor(() => {
      expect(getByTestId("svg-text")).toBeTruthy();
    });

    // Verificamos que el texto "JD" está en el componente SVG
    const svgText = getByTestId("svg-text");
    expect(svgText.props.children).toBe("JD");
  });
});
