import React from 'react';
import { render, fireEvent, waitFor, screen, act } from '@testing-library/react-native';
import { Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import ReportFailureForm from '@/app/maintenance/formFinishReport';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';

// 1. Mocks mejorados con tipos correctos
jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    back: jest.fn(),
  })),
  useLocalSearchParams: jest.fn(),
}));

// Mock de CustomHeader
jest.mock('@/components/CustomHeader', () => ({
  __esModule: true,
  default: ({ title, backRoute }: { title: string; backRoute: () => void }) => (
    <View testID="custom-header">
      <Text>{title}</Text>
    </View>
  )
}));

// Mock de Button con todos los componentes necesarios
jest.mock('@/components/Button', () => {
  const React = require('react');
  const { Text, TouchableOpacity, ActivityIndicator, View } = require('react-native');
  
  return {
    __esModule: true,
    default: ({ text, onPress, loading }: { text: string; onPress: () => void; loading?: boolean }) => (
      <TouchableOpacity 
        onPress={onPress} 
        disabled={loading}
        testID={loading ? 'loading-button' : 'normal-button'}
      >
        <View>
          <Text>{text}</Text>
          {loading && <ActivityIndicator testID="loading-indicator" />}
        </View>
      </TouchableOpacity>
    )
  };
});

// Mock de DropdownPicker
jest.mock('@/components/Dropdown', () => ({
  __esModule: true,
  default: ({ selectedValue, onValueChange, options }: any) => (
    <View testID="dropdown">
      <Text>{selectedValue}</Text>
    </View>
  )
}));

// Mock de DocumentPicker con tipo correcto
jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn(() => Promise.resolve({
    assets: [{
      uri: 'file://test.jpg',
      name: 'test.jpg',
      mimeType: 'image/jpeg',
      size: 500000,
    }],
    canceled: false,
  })),
}));

// Mock de View para React Native
jest.mock('react-native/Libraries/Components/View/View', () => {
  const View = jest.requireActual('react-native/Libraries/Components/View/View');
  return View;
});

// Mock de fetch con tipo completo
const mockFetch = jest.fn();
global.fetch = mockFetch as jest.MockedFunction<typeof fetch>;

// Interface para mock response
interface MockResponse extends Response {
  json: jest.Mock<Promise<any>>;
}

const createMockResponse = (body: any): MockResponse => ({
  ok: true,
  status: 200,
  statusText: 'OK',
  headers: new Headers(),
  redirected: false,
  type: 'basic' as ResponseType,
  url: '',
  clone: jest.fn(),
  blob: jest.fn(),
  formData: jest.fn(),
  json: jest.fn(() => Promise.resolve(body)),
  text: jest.fn(),
  arrayBuffer: jest.fn(),
  body: null,
  bodyUsed: false,
});

describe('ReportFailureForm', () => {
  const mockParams = {
    propertyName: 'Finca Santa María',
    lotName: 'Lote 5',
    fallo: 'Falla eléctrica',
    observacion: 'Observación de prueba',
    technicianAssignmentId: '123',
  };

  beforeEach(() => {
    (useLocalSearchParams as jest.Mock).mockReturnValue(mockParams);
    
    mockFetch.mockImplementation((url) => {
      if (url.includes('failure-types')) {
        return Promise.resolve(createMockResponse({
          success: true,
          data: [{ id: 1, name: 'Falla eléctrica' }],
        }));
      }
      if (url.includes('failure-solutions')) {
        return Promise.resolve(createMockResponse({
          success: true,
          data: [{ id: 1, name: 'Reparación de cables' }],
        }));
      }
      return Promise.resolve(createMockResponse({ success: true }));
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('1. Renderiza correctamente el paso 1', async () => {
    await act(async () => {
      render(<ReportFailureForm />);
    });

    await waitFor(() => {
      expect(screen.getByText('Detalles del fallo')).toBeTruthy();
      expect(screen.getByText('Finca Santa María')).toBeTruthy();
      expect(screen.getByText('Lote 5')).toBeTruthy();
      expect(screen.getByText('Falla eléctrica')).toBeTruthy();
      expect(screen.getByText('Observación de prueba')).toBeTruthy();
    }, { timeout: 10000 });
  });

  it('2. Permite navegar al paso 2', async () => {
    await act(async () => {
      render(<ReportFailureForm />);
    });

    await waitFor(() => {
      expect(screen.getByText('Siguiente')).toBeTruthy();
    });

    await act(async () => {
      fireEvent.press(screen.getByText('Siguiente'));
    });

    await waitFor(() => {
      expect(screen.getByText('Detalles de la solución')).toBeTruthy();
    });
  });

  it('3. Permite seleccionar archivos para evidencia', async () => {
    await act(async () => {
      render(<ReportFailureForm />);
    });

    await act(async () => {
      fireEvent.press(screen.getByText('Selecciona un archivo aquí'));
    });

    await waitFor(() => {
      expect(screen.getByText('1 archivo seleccionado')).toBeTruthy();
    });
  });

  it('4. Muestra error si no se completan todos los campos en paso 2', async () => {
    await act(async () => {
      render(<ReportFailureForm />);
    });

    await act(async () => {
      fireEvent.press(screen.getByText('Siguiente'));
    });

    await act(async () => {
      fireEvent.press(screen.getByText('Confirmar'));
    });

    expect(screen.queryByText('Mantenimiento finalizado correctamente')).toBeNull();
  });

  it('5. Muestra loading durante el envío del formulario', async () => {
    mockFetch.mockImplementationOnce(() => 
      new Promise((resolve) => setTimeout(() => resolve(
        createMockResponse({ success: true })
      ), 1000))
    );

    await act(async () => {
      render(<ReportFailureForm />);
    });

    await act(async () => {
      fireEvent.press(screen.getByText('Selecciona un archivo aquí'));
    });

    await act(async () => {
      fireEvent.press(screen.getByText('Siguiente'));
    });

    await act(async () => {
      fireEvent.press(screen.getAllByText('Selecciona un archivo aquí')[0]);
    });

    await act(async () => {
      fireEvent.press(screen.getByText('Dar por finalizado el mantenimiento'));
    });

    await act(async () => {
      fireEvent.press(screen.getByText('Confirmar'));
    });

    expect(screen.getByTestId('loading-indicator')).toBeTruthy();
  });

  it('6. Maneja errores al cargar tipos de fallo y soluciones', async () => {
    mockFetch.mockImplementationOnce(() => 
      Promise.reject(new Error('Network error'))
    );

    await act(async () => {
      render(<ReportFailureForm />);
    });

    await waitFor(() => {
      expect(screen.getByText('Siguiente')).toBeTruthy();
    });
  });

  it('7. Permite volver al paso 1 desde el paso 2', async () => {
    await act(async () => {
      render(<ReportFailureForm />);
    });

    await act(async () => {
      fireEvent.press(screen.getByText('Siguiente'));
    });

    await act(async () => {
      fireEvent.press(screen.getByText('Volver'));
    });

    await waitFor(() => {
      expect(screen.getByText('Detalles del fallo')).toBeTruthy();
    });
  });

  it('8. Valida el tamaño máximo del archivo', async () => {
    (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValueOnce({
      assets: [{
        uri: 'file://large.jpg',
        name: 'large.jpg',
        mimeType: 'image/jpeg',
        size: 2 * 1024 * 1024, // 2MB
      }],
      canceled: false,
    });

    await act(async () => {
      render(<ReportFailureForm />);
    });

    await act(async () => {
      fireEvent.press(screen.getByText('Selecciona un archivo aquí'));
    });

    await waitFor(() => {
      expect(screen.queryByText('1 archivo seleccionado')).toBeNull();
    });
  });

  it('9. Envía el formulario correctamente cuando todos los campos están completos', async () => {
    await act(async () => {
      render(<ReportFailureForm />);
    });

    await act(async () => {
      fireEvent.press(screen.getByText('Selecciona un archivo aquí'));
    });

    await act(async () => {
      fireEvent.press(screen.getByText('Siguiente'));
    });

    await waitFor(() => {
      expect(screen.getByText('Detalles de la solución')).toBeTruthy();
    });

    await act(async () => {
      fireEvent.press(screen.getAllByText('Selecciona un archivo aquí')[0]);
    });

    await act(async () => {
      fireEvent.press(screen.getByText('Dar por finalizado el mantenimiento'));
    });

    await act(async () => {
      fireEvent.press(screen.getByText('Confirmar'));
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/maintenance/finalize'),
        expect.anything()
      );
    });
  });
});