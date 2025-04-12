import React from "react";
import { render, waitFor, fireEvent, screen } from "@testing-library/react-native";
import ValveRequests from "@/app/properties/requestHistory";
import { useLotContext } from "@/context/LotContext";
import { useRouter } from "expo-router";
import { Text } from "react-native";

// Mocks de componentes y dependencias
jest.mock("@/components/CustomHeader", () => "CustomHeader");
jest.mock("@/components/RequestCard", () => {
  const React = require("react");
  const { Text, TouchableOpacity } = require("react-native");

  return ({ id, type, date, onPress }: any) => (
    <TouchableOpacity onPress={onPress}>
      <Text>
        {type} - {date}
      </Text>
    </TouchableOpacity>
  );
});
jest.mock("@/components/RequestDetailsModal", () => "RequestDetailsModal");
jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));
jest.mock("moment", () => (date: string) => ({
  format: () => {
    if (date.includes("2023-05-15")) return "15/05/2023 10:30 AM";
    if (date.includes("2023-05-10")) return "10/05/2023 08:15 AM";
    return "formatted-date";
  },
}));
jest.mock("@/context/LotContext", () => ({
  useLotContext: jest.fn(),
}));

describe("RequestHistory Screen", () => {
  const mockCurrentLot = {
    id: "lot-123",
    name: "Lote de Prueba",
  };

  const mockRequests = [
    {
      id: 1,
      request_date: "2023-05-15T10:30:00Z",
      type_opening_id: 1,
      status: 1,
      open_date: "2023-05-15T10:35:00Z",
      close_date: "2023-05-15T11:30:00Z",
    },
    {
      id: 2,
      request_date: "2023-05-10T08:15:00Z",
      type_opening_id: 2,
      status: 2,
      open_date: "2023-05-10T08:20:00Z",
      close_date: "2023-05-10T09:15:00Z",
    },
  ];

  const mockOpeningTypes = [
    { id: 1, label: "Riego programado", value: "scheduled" },
    { id: 2, label: "Riego manual", value: "manual" },
  ];

  const mockGetRequestByDeviceId = jest.fn();
  const mockFetchValveOpeningTypes = jest.fn();
  const mockRouter = { push: jest.fn() };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useLotContext as jest.Mock).mockReturnValue({
      currentLot: mockCurrentLot,
      currentValveId: "valve-123",
      getRequestByDeviceId: mockGetRequestByDeviceId.mockResolvedValue(mockRequests),
      fetchValveOpeningTypes: mockFetchValveOpeningTypes.mockResolvedValue(mockOpeningTypes),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Muestra mensaje cuando no hay solicitudes", async () => {
    mockGetRequestByDeviceId.mockResolvedValueOnce([]);

    render(<ValveRequests />);
    expect(
      await screen.findByText("No hay solicitudes registradas.")
    ).toBeTruthy();
  });

  it("Ordena solicitudes por fecha descendente", async () => {
    render(<ValveRequests />);

    const requestTexts = await screen.findAllByText(
      /Riego (programado|manual) - \d{2}\/\d{2}\/\d{4}/
    );

    // Verificar que la más reciente aparece primero
    expect(requestTexts[0].props.children.join("")).toContain("15/05/2023");
    expect(requestTexts[1].props.children.join("")).toContain("10/05/2023");
  });

  it("Muestra tipos de apertura correctamente", async () => {
    render(<ValveRequests />);

    await waitFor(() => {
      expect(
        screen.getByText("Riego programado - 15/05/2023 10:30 AM")
      ).toBeTruthy();
      expect(
        screen.getByText("Riego manual - 10/05/2023 08:15 AM")
      ).toBeTruthy();
    });
  });
});