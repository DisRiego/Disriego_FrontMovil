import React from 'react';
import { 
  render, 
  waitFor, 
  screen, 
  fireEvent
} from '@testing-library/react-native';
import AssignedReportsScreen from '@/app/maintenance/assignedReports';
import { useReports } from '@/context/ReportContext';

// Mock mejorado de CustomHeader
jest.mock('@/components/CustomHeader', () => {
  const React = require('react');
  const { Text, View } = require('react-native');
  return ({ title }: any) => (
    <View testID="custom-header">
      <Text testID="header-title">{title}</Text>
    </View>
  );
});

// Mock mejorado de SearchBar con testID
jest.mock('@/components/SearchBar', () => {
  const React = require('react');
  const { TextInput, View } = require('react-native');
  return ({ searchText, onSearchChange }: any) => (
    <View testID="search-bar">
      <TextInput
        testID="search-input"
        value={searchText}
        onChangeText={onSearchChange}
      />
    </View>
  );
});

// Mock mejorado de ReportDetailsModal con testID
jest.mock('@/components/ReportDetailsModal', () => {
  const React = require('react');
  const { View } = require('react-native');
  return () => <View testID="report-details-modal" />;
});

// Mock de ReportCard
jest.mock('@/components/ReportCard', () => {
  const React = require('react');
  const { Text, View, TouchableOpacity } = require('react-native');
  return ({ id, lotName, propertyName, onPress }: any) => (
    <TouchableOpacity onPress={onPress} testID="report-card">
      <View>
        <Text testID="report-id">{id}</Text>
        <Text testID="report-lot">{lotName}</Text>
        <Text testID="report-property">{propertyName}</Text>
      </View>
    </TouchableOpacity>
  );
});

// Mock del contexto de reportes
const mockFetchAssignedReports = jest.fn();
jest.mock('@/context/ReportContext', () => ({
  useReports: () => ({
    reports: [
      {
        id: 1,
        property_name: 'Finca Santa María',
        lot_name: 'Lote 5',
        failure_type: 'Falla eléctrica',
        status: 'Pendiente',
        report_date: '2023-05-15',
        description_failure: 'Descripción de la falla',
        technician_assignment_id: 10
      }
    ],
    loading: false,
    fetchAssignedReports: mockFetchAssignedReports
  })
}));

// Mock de expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn()
  })
}));

describe('AssignedReportsScreen', () => {
  beforeEach(() => {
    mockFetchAssignedReports.mockClear();
    jest.clearAllMocks();
  });

  it('Renderiza correctamente y carga los reportes', async () => {
    render(<AssignedReportsScreen />);
    
    await waitFor(() => {
      expect(mockFetchAssignedReports).toHaveBeenCalled();
    });

    expect(screen.getByTestId('header-title').props.children).toBe('Reportes asignados');
    expect(screen.getByText('Aquí puedes gestionar los reportes que te han sido asignados.')).toBeTruthy();
  });

  it('Muestra los reportes no finalizados', async () => {
    render(<AssignedReportsScreen />);
    
    await waitFor(() => {
      const reportCards = screen.getAllByTestId('report-card');
      expect(reportCards.length).toBe(1);
      expect(screen.getByTestId('report-id').props.children).toBe('#1');
    });
  });

  it('Filtra reportes por búsqueda', async () => {
    render(<AssignedReportsScreen />);
    
    fireEvent.changeText(screen.getByTestId('search-input'), 'Santa');
    
    await waitFor(() => {
      expect(screen.getByTestId('report-property').props.children).toBe('Finca Santa María');
    });
  });

  it('Muestra el modal al seleccionar un reporte', async () => {
    render(<AssignedReportsScreen />);
    
    fireEvent.press(screen.getByTestId('report-card'));
    
    await waitFor(() => {
      expect(screen.getByTestId('report-details-modal')).toBeTruthy();
    });
  });
});