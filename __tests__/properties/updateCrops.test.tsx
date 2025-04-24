import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import UpdateCrops from '@/app/properties/updateCrops';
import { useLotContext } from '@/context/LotContext';
import { useRouter } from 'expo-router';
import moment from 'moment';

// Configuración inicial de mocks 
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/context/LotContext', () => ({
  useLotContext: jest.fn(),
}));

jest.mock('@react-native-community/datetimepicker', () => ({
  __esModule: true,
  default: 'DateTimePicker',
}));

jest.mock('@/components/CustomHeader', () => 'CustomHeader');

jest.mock('@/components/CustomInput', () => {
  const React = require('react');
  const { TextInput } = require('react-native');
  return ({ value, editable }: any) => (
    <TextInput 
      value={value} 
      editable={editable}
      testID="custom-input"
    />
  );
});

jest.mock('@/components/Dropdown', () => {
  const React = require('react');
  const { View, Text, TouchableOpacity } = require('react-native');
  return ({ selectedValue, onValueChange, options }: any) => (
    <View testID="dropdown-picker">
      <Text>Dropdown: {selectedValue}</Text>
      {options.map((option: any) => (
        <TouchableOpacity
          key={option.value}
          onPress={() => onValueChange(option.value)}
          testID={`dropdown-option-${option.value}`}
        >
          <Text>{option.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
});

jest.mock('@/components/Button', () => {
  const React = require('react');
  const { TouchableOpacity, Text } = require('react-native');
  return ({ text, onPress }: any) => (
    <TouchableOpacity onPress={onPress} testID="save-button">
      <Text>{text}</Text>
    </TouchableOpacity>
  );
});

describe('UpdateCrops Component', () => {
  const plantingDateUTC = '2023-01-15T00:00:00.000Z';
  const plantingDateFormatted = '2023-01-15';
  const estimatedHarvestDate = '2023-06-15';

  const mockCurrentLot = {
    id: 'lot-123',
    name: 'Lote de Prueba',
    cropType: 'Maíz',
    paymentInterval: 'Mensual',
    plantingDate: plantingDateUTC,
    estimatedHarvestDate
  };

  const mockCropTypes = [
    {
      id: 1,
      name: 'Maíz',
      payment_interval_id: 1,
      harvest_time: 150
    },
    {
      id: 2,
      name: 'Trigo',
      payment_interval_id: 2,
      harvest_time: 120
    }
  ];

  const mockPaymentIntervals = [
    { id: 1, name: 'Mensual' },
    { id: 2, name: 'Trimestral' }
  ];

  const mockUpdateLotField = jest.fn();
  const mockUpdateLotInList = jest.fn();
  const mockSaveLotToBackend = jest.fn().mockResolvedValue(true);
  const mockFetchCropOptions = jest.fn();
  const mockRouter = { replace: jest.fn() };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useLotContext as jest.Mock).mockReturnValue({
      currentLot: mockCurrentLot,
      cropTypes: mockCropTypes,
      paymentIntervals: mockPaymentIntervals,
      updateLotField: mockUpdateLotField,
      updateLotInList: mockUpdateLotInList,
      saveLotToBackend: mockSaveLotToBackend,
      fetchCropOptions: mockFetchCropOptions.mockResolvedValue(true),
    });
    
    jest.spyOn(moment.prototype, 'format').mockImplementation(function() {
      if (this.isSame(moment(plantingDateUTC))) {
        return plantingDateFormatted;
      }
      if (this.isSame(moment(plantingDateUTC).add(150, 'days'))) {
        return estimatedHarvestDate;
      }
      return this.toISOString();
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });
  it("Muestra estado de carga cuando no hay datos", async () => {
    (useLotContext as jest.Mock).mockReturnValueOnce({
      currentLot: null,
      cropTypes: [],
      fetchCropOptions: jest.fn(),
    });

    const { getByText } = render(<UpdateCrops />);
    expect(getByText("Cargando opciones...")).toBeTruthy();
  });

  it("Renderiza correctamente con datos del lote", async () => {
    const { getByText } = render(<UpdateCrops />);

    await waitFor(() => {
      expect(
        getByText(`Edita los detalles del lote ${mockCurrentLot.name}.`)
      ).toBeTruthy();
      expect(getByText("Tipo de cultivo")).toBeTruthy();
      expect(getByText("Intervalo de Pago")).toBeTruthy();
      expect(getByText("Fecha de siembra")).toBeTruthy();
      expect(getByText("Fecha estimada de cosecha")).toBeTruthy();
    });
  });

  it("Muestra los valores actuales del lote", async () => {
    render(<UpdateCrops />);

    await waitFor(() => {
      const inputs = screen.getAllByTestId("custom-input");
      expect(inputs[0].props.value).toBe(mockCurrentLot.paymentInterval);
      expect(inputs[1].props.value).toBe(plantingDateFormatted);
      expect(inputs[2].props.value).toBe(estimatedHarvestDate);

      expect(
        screen.getByText(`Dropdown: ${mockCurrentLot.cropType}`)
      ).toBeTruthy();
    });
  });

  it("Actualiza fechas al cambiar cultivo", async () => {
    render(<UpdateCrops />);

    await waitFor(() => {
      fireEvent.press(screen.getByTestId("dropdown-option-Trigo"));

      const newHarvestDate = moment(new Date(mockCurrentLot.plantingDate))
        .add(120, "days")
        .format("YYYY-MM-DD");

      const inputs = screen.getAllByTestId("custom-input");
      expect(inputs[2].props.value).toBe(newHarvestDate);
    });
  });

  it("Maneja el guardado exitoso", async () => {
    render(<UpdateCrops />);

    await waitFor(() => {
      fireEvent.press(screen.getByTestId("save-button"));

      expect(mockSaveLotToBackend).toHaveBeenCalledWith(mockCurrentLot.id, {
        typeCropId: 1,
        paymentIntervalId: 1,
        plantingDate: plantingDateUTC,
        estimatedHarvestDate: estimatedHarvestDate,
      });

      expect(mockRouter.replace).toHaveBeenCalledWith("/properties/detailsLot");
    });
  });

  it("Maneja error en el guardado", async () => {
    mockSaveLotToBackend.mockResolvedValueOnce(false);
    jest.spyOn(global, "alert").mockImplementation(() => {});

    render(<UpdateCrops />);

    await waitFor(() => {
      fireEvent.press(screen.getByTestId("save-button"));
      expect(global.alert).toHaveBeenCalledWith(
        "Hubo un error al guardar los cambios en el servidor."
      );
    });
  });
});
