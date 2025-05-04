import React from 'react';
import { render, waitFor, screen } from '@testing-library/react-native';
import CompletedReports from '@/app/maintenance/completedReports';
import { useRouter } from 'expo-router';

// Mocks básicos
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn()
  })
}));

jest.mock('@/components/CustomHeader', () => 'CustomHeader');
jest.mock('@/components/SearchBar', () => 'SearchBar');

// Mock mejorado de ReportCard con testID
jest.mock('@/components/ReportCard', () => {
  const { View } = require('react-native');
  return function MockReportCard() {
    return <View testID="report-card" />;
  };
});

// Mock del contexto
const mockFetchAssignedReports = jest.fn();
jest.mock('@/context/ReportContext', () => ({
  useReports: () => ({
    reports: [
      {
        id: 1,
        property_name: 'Finca Santa María',
        lot_name: 'Lote 5',
        status: 'Finalizado',
        report_date: '2023-05-15',
        failure_type: 'Falla eléctrica',
        description_failure: 'Observación de prueba',
        technician_assignment_id: 123
      }
    ],
    loading: false,
    fetchAssignedReports: mockFetchAssignedReports,
  })
}));

describe('CompletedReports', () => {
  beforeEach(() => {
    mockFetchAssignedReports.mockClear();
    jest.clearAllMocks();
  });

  it('Renderiza correctamente', async () => {
    render(<CompletedReports />);
    
    await waitFor(() => {
      expect(screen.getByText(/aquí puedes consultar/i)).toBeTruthy();
    });
  }, 10000);

  it('Muestra los reportes completados', async () => {
    render(<CompletedReports />);
    
    await waitFor(() => {
      expect(mockFetchAssignedReports).toHaveBeenCalled();
      expect(screen.getAllByTestId('report-card')).toHaveLength(1);
    });
  }, 10000);

  it('Muestra mensaje cuando no hay reportes', async () => {
    jest.spyOn(require('@/context/ReportContext'), 'useReports').mockReturnValueOnce({
      reports: [],
      loading: false,
      fetchAssignedReports: mockFetchAssignedReports
    });
    
    render(<CompletedReports />);
    
    await waitFor(() => {
      expect(screen.getByText(/no tienes reportes finalizados/i)).toBeTruthy();
    });
  });

  it('Muestra loading mientras carga', async () => {
    jest.spyOn(require('@/context/ReportContext'), 'useReports').mockReturnValueOnce({
      reports: [],
      loading: true,
      fetchAssignedReports: mockFetchAssignedReports
    });
    
    render(<CompletedReports />);
    
    expect(screen.UNSAFE_getByType(require('react-native').ActivityIndicator)).toBeTruthy();
  });
});