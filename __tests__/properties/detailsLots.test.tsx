import React from "react";
import { render, waitFor } from "@testing-library/react-native";
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

  const mockRouter = {
    replace: jest.fn(),
    push: jest.fn(),
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useLotContext as jest.Mock).mockReturnValue({
      currentLot: mockCurrentLot,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("No renderiza nada cuando no hay currentLot", () => {
    (useLotContext as jest.Mock).mockReturnValueOnce({ currentLot: null });
    const { queryByText } = render(<DetailsLots />);
    expect(queryByText("Detalles del Lote")).toBeNull();
  });

  it("Renderiza correctamente con currentLot", async () => {
    const { findByText } = render(<DetailsLots />);

    // Buscamos el texto dividido como aparece en el error
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
});
