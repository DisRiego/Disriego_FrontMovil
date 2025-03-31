import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import MyProperties from '@/app/properties/myProperties';
import axios from 'axios';
import { useLotContext } from '@/context/LotContext';
import { getUserData } from '@/services/auth';

// Mocks mínimos pero funcionales
jest.mock('@/components/CustomHeader', () => 'CustomHeader');
jest.mock('@/components/SearchBar', () => 'SearchBar');
jest.mock('@/components/PropertyCard', () => 'PropertyCard');
jest.mock('@/components/PropertyDetailsModal', () => 'PropertyDetailsModal');

jest.mock('@/context/LotContext', () => ({
  useLotContext: jest.fn(() => ({
    currentProperty: null,
    setProperty: jest.fn()
  }))
}));

jest.mock('@/services/auth', () => ({
  getUserData: jest.fn(() => Promise.resolve({ id: 1 }))
}));

jest.mock('axios');

describe('MyProperties Screen - Pruebas Básicas', () => {
  const mockProperties = [{
    id: 'property-1',
    name: 'Finca Test',
    real_estate_registration_number: 'FOL-123',
    extension: '10 hectáreas'
  }];

  beforeEach(() => {
    (axios.get as jest.Mock).mockResolvedValue({ data: { data: mockProperties } });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Carga y muestra propiedades', async () => {
    const { findByText } = render(<MyProperties />);
    
    // Verificar que se hizo la llamada a la API
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/properties/user/1')
      );
    });
  });

  it('Muestra mensaje sin propiedades', async () => {
    (axios.get as jest.Mock).mockResolvedValue({ data: { data: [] } });
    const { findByText } = render(<MyProperties />);
    
    expect(await findByText('No hay propiedades registradas.')).toBeTruthy();
  });

  it('Maneja errores de carga', async () => {
    const consoleSpy = jest.spyOn(console, 'error');
    (axios.get as jest.Mock).mockRejectedValue(new Error('Error de red'));
    
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