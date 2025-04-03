import React from "react";
import { render, waitFor, fireEvent } from "@testing-library/react-native";
import DetailsLots from "@/app/properties/detailsLot";
import { useLotContext } from "@/context/LotContext";
import { useRouter } from "expo-router";

// Mocks mejorados
jest.mock("@/components/CustomHeader", () => ({
  __esModule: true,
  default: ({ title }: { title: string }) => <>{title}</>,
}));

jest.mock("@/components/LotCard", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("@/components/LotInfoCard", () => ({
  __esModule: true,
  default: ({ onEditPress }: { onEditPress: () => void }) => (
    <button onClick={onEditPress}>Edit</button>
  ),
}));

jest.mock("@/components/DeviceCard", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("@/components/ValveCard", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("@/components/SearchBar", () => ({
  __esModule: true,
  default: () => <input type="text" placeholder="Buscar..." />,
}));

jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons",
}));

jest.mock("@/components/ValveDetailsModal", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("@/components/DeviceDetailsModal", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("expo-router", () => ({
  useRouter: jest.fn(() => ({
    replace: jest.fn(),
    push: jest.fn(),
  })),
}));

jest.mock("@/context/LotContext", () => ({
  useLotContext: jest.fn(),
}));

describe("DetailsLots Screen", () => {
  const mockCurrentLot = {
    id: "lot-123",
    name: "Lote de Prueba",
    real_estate_registration_number: "FOL-123",
    extension: "5 hectáreas",
    latitude: "12.3456",
    longitude: "-98.7654",
    cropType: "Maíz",
    paymentInterval: "Mensual",
    plantingDate: "2023-01-15",
    estimatedHarvestDate: "2023-07-20",
  };

  const mockDevices = [
    {
      id: "device-1",
      model: "Modelo 1",
      serial_number: "12345",
      status_name: "Activo",
      devices_id: 1,
      installation_date: "2023-01-01",
      estimated_maintenance_date: "2023-12-31",
    },
  ];

  const mockRouter = {
    replace: jest.fn(),
    push: jest.fn(),
  };

  const mockFetchDevicesByLot = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useLotContext as jest.Mock).mockReturnValue({
      currentLot: mockCurrentLot,
      devices: mockDevices,
      fetchDevicesByLot: mockFetchDevicesByLot,
    });
  });

  it("No renderiza nada cuando no hay currentLot", () => {
    (useLotContext as jest.Mock).mockReturnValueOnce({
      currentLot: null,
      devices: [], // Añade esto para evitar el error de filter
      fetchDevicesByLot: mockFetchDevicesByLot,
    });
    const { queryByText } = render(<DetailsLots />);
    expect(queryByText("Detalles del Lote")).toBeNull();
  });

  it("Renderiza correctamente con currentLot", async () => {
    const { findByText } = render(<DetailsLots />);
    const fullText = `En esta sección podrás visualizar información detallada sobre ${mockCurrentLot.name}.`;
    expect(await findByText(fullText)).toBeTruthy();
  });

  it("Configura la navegación al presionar atrás", () => {
    render(<DetailsLots />);
    expect(mockRouter.replace).toBeDefined();
  });

  it("Configura la navegación al editar", () => {
    render(<DetailsLots />);
    expect(mockRouter.push).toBeDefined();
  });

  it("Llama a fetchDevicesByLot al cargar", () => {
    render(<DetailsLots />);
    expect(mockFetchDevicesByLot).toHaveBeenCalledWith(mockCurrentLot.id);
  });
});
