import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import DetailsProperties from "@/app/properties/detailsProperties";
import { useLotContext } from "@/context/LotContext";
import { useRouter } from "expo-router";

// Mocks mejorados
jest.mock("@/components/CustomHeader", () => ({
  __esModule: true,
  default: ({ title }: { title: string }) => <>{title}</>,
}));

jest.mock("@/components/PropertyCard", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("@/components/LotCard", () => ({
  __esModule: true,
  default: ({ onPress }: { onPress: () => void }) => (
    <div onClick={onPress} data-testid="lot-card-mock">
      Lot Card Mock
    </div>
  ),
}));

jest.mock("@/components/LotDetailsModal", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("@/components/SearchBar", () => ({
  __esModule: true,
  default: () => <input type="text" placeholder="Búsqueda" />,
}));

jest.mock("expo-router", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

jest.mock("@/context/LotContext", () => ({
  useLotContext: jest.fn(),
}));

jest.mock("@react-navigation/native", () => ({
  useFocusEffect: jest.fn(),
}));

describe("DetailsProperties Screen", () => {
  const mockCurrentProperty = {
    id: "property-123",
    name: "Predio de Prueba",
    real_estate_registration_number: "FOL-456",
    extension: "10 hectáreas",
    latitude: "23.4567",
    longitude: "-76.5432",
  };

  const mockLots = [
    {
      id: "lot-123",
      name: "Lote 1",
      real_estate_registration_number: "FOL-789",
      extension: "5 hectáreas",
      latitude: "23.4567",
      longitude: "-76.5432",
      cropType: "Maíz",
      paymentInterval: "Mensual",
      plantingDate: "2023-01-15",
      estimatedHarvestDate: "2023-07-20",
    },
  ];

  const mockRefreshLotsByProperty = jest.fn();
  const mockSetSelectedLot = jest.fn();
  const mockRouter = {
    push: jest.fn(),
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useLotContext as jest.Mock).mockReturnValue({
      currentProperty: mockCurrentProperty,
      lots: mockLots,
      refreshLotsByProperty: mockRefreshLotsByProperty,
      setSelectedLot: mockSetSelectedLot,
    });

    require("@react-navigation/native").useFocusEffect.mockImplementation(
      (callback: any) => callback()
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("No renderiza nada cuando no hay currentProperty", () => {
    (useLotContext as jest.Mock).mockReturnValueOnce({ currentProperty: null });
    const { queryByText } = render(<DetailsProperties />);
    expect(queryByText("Detalles del Predio")).toBeNull();
  });

  it("Renderiza correctamente con currentProperty", () => {
    const { getByText } = render(<DetailsProperties />);
    expect(
      getByText(
        `En esta sección podrás visualizar información detallada del predio ${mockCurrentProperty.name}.`
      )
    ).toBeTruthy();
    expect(getByText("Lotes asociados:")).toBeTruthy();
  });

  it("Llama a refreshLotsByProperty al enfocar la pantalla", () => {
    render(<DetailsProperties />);
    expect(mockRefreshLotsByProperty).toHaveBeenCalledWith(
      mockCurrentProperty.id
    );
  });

  it("Navegación al presionar atrás", () => {
    render(<DetailsProperties />);
    mockRouter.push("/properties/myProperties");
    expect(mockRouter.push).toHaveBeenCalledWith("/properties/myProperties");
  });
});
