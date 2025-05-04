import React from 'react';
import { render, waitFor, screen } from '@testing-library/react-native';
import MyProperties from '@/app/properties/myProperties';
import { useLotContext } from '@/context/LotContext';
import { getUserData } from '@/services/auth';

// Mocks mejorados
jest.mock('@/components/CustomHeader', () => 'CustomHeader');
jest.mock('@/components/SearchBar', () => 'SearchBar');
jest.mock('@/components/PropertyDetailsModal', () => 'PropertyDetailsModal');

// Mock mejorado de PropertyCard
jest.mock('@/components/PropertyCard', () => {
  const React = require('react');
  const { Text, View, TouchableOpacity } = require('react-native');
  return ({ name, folio, onPress }: any) => (
    <TouchableOpacity onPress={onPress} testID="property-card">
      <View>
        <Text testID="property-name">{name}</Text>
        <Text testID="property-folio">{folio}</Text>
      </View>
    </TouchableOpacity>
  );
});

// Mock del contexto
const mockFetchProperties = jest.fn();
jest.mock('@/context/LotContext', () => ({
  useLotContext: () => ({
    currentProperty: null,
    setProperty: jest.fn(),
    fetchPropertiesByUser: mockFetchProperties
  })
}));

jest.mock('@/services/auth', () => ({
  getUserData: jest.fn(() => Promise.resolve({ id: 1 }))
}));

describe('MyProperties Screen', () => {
  const mockProperties = [{
    id: 'property-1',
    name: 'Finca Test',
    real_estate_registration_number: 'FOL-123',
    extension: '10 hectáreas',
    latitude: 0,
    longitude: 0
  }];

  beforeEach(() => {
    mockFetchProperties.mockClear();
  });

  it('Carga y muestra propiedades correctamente', async () => {
    mockFetchProperties.mockResolvedValue(mockProperties);
    
    render(<MyProperties />);
    
    await waitFor(() => {
      expect(mockFetchProperties).toHaveBeenCalled();
    });

    // Verificar que se renderizan las propiedades
    const propertyCards = await screen.findAllByTestId('property-card');
    expect(propertyCards.length).toBe(1);
    
    // Verificar los datos usando los matchers correctos
    expect(screen.getByTestId('property-name').props.children).toBe('Finca Test');
    expect(screen.getByTestId('property-folio').props.children).toBe('FOL-123');
  }, 10000);

  it('Muestra mensaje cuando no hay propiedades', async () => {
    mockFetchProperties.mockResolvedValue([]);
    
    render(<MyProperties />);
    
    expect(await screen.findByText('No hay propiedades registradas.')).toBeTruthy();
  });

  it('Maneja errores de carga correctamente', async () => {
    const consoleSpy = jest.spyOn(console, 'error');
    mockFetchProperties.mockRejectedValue(new Error('Error de carga'));
    
    render(<MyProperties />);
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error cargando propiedades:', 
        expect.any(Error)
      );
    });
    
    consoleSpy.mockRestore();
  });
});