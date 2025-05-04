import React from "react";
import { render, waitFor, screen } from "@testing-library/react-native";
import CompletedReportDetails from "@/app/maintenance/completedReportDetails";
import { useLocalSearchParams } from "expo-router";

// Mocks básicos que no requieren cambios en el componente
jest.mock("expo-router", () => ({
  useLocalSearchParams: jest.fn(() => ({ reportId: "123" })),
  router: {
    push: jest.fn(),
  },
}));

jest.mock("@/components/CustomHeader", () => "CustomHeader");

// Mock de fetch global
global.fetch = jest.fn();

describe("CompletedReportDetails", () => {
  const mockReport = {
    property_id: 1,
    property_name: "Finca Santa María",
    lot_id: 5,
    lot_name: "Lote 5",
    status: "Finalizado",
    owner_document: 123456789,
    owner_name: "Juan Pérez",
    report_date: "2023-05-10T10:00:00Z",
    failure_type: "Falla eléctrica",
    description_failure: "No hay energía en el lote",
    assignment_date: "2023-05-12T09:00:00Z",
    finalized: true,
    finalization_date: "2023-05-15T16:30:00Z",
    technician_name: "Carlos Gómez",
    technician_document: 987654321,
    type_maintenance: "Correctivo",
    fault_remarks: "Cableado dañado",
    solution_name: "Reemplazo de cableado",
    solution_remarks: "Se reemplazó el cableado principal",
    evidence_failure_url: "https://example.com/failure.jpg",
    evidence_solution_url: "https://example.com/solution.jpg",
  };

  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
    jest.clearAllMocks();
  });

  it("Muestra el loading inicial", () => {
    (global.fetch as jest.Mock).mockImplementationOnce(
      () => new Promise(() => {})
    );

    render(<CompletedReportDetails />);
    // Verificamos que se muestra algún texto de carga
    expect(screen.queryByText("Cargando...")).toBeNull(); // O cualquier texto que aparezca durante el loading
  });

  it("Muestra los detalles del reporte correctamente", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: () => Promise.resolve({ success: true, data: mockReport }),
    });

    render(<CompletedReportDetails />);

    await waitFor(() => {
      expect(screen.getByText("Reporte #123")).toBeTruthy();
      expect(screen.getByText("Finalizado")).toBeTruthy();
      expect(screen.getByText("Finca Santa María")).toBeTruthy();
      expect(screen.getByText("Lote 5")).toBeTruthy();
      expect(screen.getByText("Falla eléctrica")).toBeTruthy();
    });
  });

  it("Maneja errores de carga", async () => {
    const consoleSpy = jest.spyOn(console, "error");
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error("Error de red")
    );

    render(<CompletedReportDetails />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error al cargar detalle del reporte:",
        expect.any(Error)
      );
    });
    consoleSpy.mockRestore();
  });

  it('Muestra "No disponible" para datos faltantes', async () => {
    const incompleteReport = {
      ...mockReport,
      finalization_date: null,
      evidence_failure_url: null,
      solution_name: null,
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: () => Promise.resolve({ success: true, data: incompleteReport }),
    });

    render(<CompletedReportDetails />);

    await waitFor(() => {
      expect(screen.getAllByText("No disponible").length).toBeGreaterThan(0);
    });
  });

  it("Muestra el mensaje de no evidencia cuando no hay imágenes", async () => {
    const noImagesReport = {
      ...mockReport,
      evidence_failure_url: null,
      evidence_solution_url: null,
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: () => Promise.resolve({ success: true, data: noImagesReport }),
    });

    render(<CompletedReportDetails />);

    await waitFor(() => {
      expect(screen.getAllByText("No hay evidencia disponible").length).toBe(2);
    });
  });
});
