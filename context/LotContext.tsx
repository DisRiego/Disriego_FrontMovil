import React, { createContext, useContext, useState } from "react";
import { Alert } from "react-native";
import axios from "axios";
import { API_URL, API_URL_IOT } from "@/services/config";
import { colors } from "@/config/theme";
import moment from "moment";

interface Property {
  id: string;
  name: string;
  latitude: string;
  longitude: string;
  extension: string;
  real_estate_registration_number: string;
}

interface Lot {
  id: string;
  name: string;
  latitude: string;
  longitude: string;
  extension: string;
  real_estate_registration_number: string;
  cropType: string;
  paymentInterval: string;
  plantingDate: string;
  estimatedHarvestDate: string;
}

interface Device {
  id: number;
  lot_id: number;
  maintenance_interval_id: number | null;
  status: number;
  data_device: any;
  serial_number: number;
  model: string;
  installation_date: string;
  estimated_maintenance_date: string;
  devices_id: number;
  status_name: string;
}

interface CropType {
  id: number;
  name: string;
  harvest_time: number;
  payment_interval_id: number;
}

interface PaymentInterval {
  id: number;
  name: string;
  interval_days: number;
}

interface StatusBadge {
  text: string;
  color: string;
  bg: string;
}

interface LotContextType {
  currentProperty: Property | null;
  currentLot: Lot | null;
  lots: Lot[];
  cropTypes: CropType[];
  paymentIntervals: PaymentInterval[];
  devices: Device[];
  setProperty: (prop: Property) => void;
  setLot: (lot: Lot) => void;
  updateLotField: (key: keyof Lot, value: any) => void;
  updateLotInList: (updatedLot: Lot) => void;
  clearLot: () => void;
  refreshLotsByProperty: (propertyId: string) => Promise<void>;
  fetchCropOptions: () => Promise<void>;
  fetchDevicesByLot: (lotId: string) => Promise<void>;
  saveLotToBackend: (
    lotId: string,
    data: {
      typeCropId: number;
      paymentIntervalId: number;
      plantingDate: string;
      estimatedHarvestDate: string;
    }
  ) => Promise<boolean>;
  getStatusBadge: (status: string) => StatusBadge;
}

const LotContext = createContext<LotContextType | undefined>(undefined);

export const LotProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentProperty, setCurrentProperty] = useState<Property | null>(null);
  const [currentLot, setCurrentLot] = useState<Lot | null>(null);
  const [lots, setLots] = useState<Lot[]>([]);
  const [cropTypes, setCropTypes] = useState<CropType[]>([]);
  const [paymentIntervals, setPaymentIntervals] = useState<PaymentInterval[]>(
    []
  );
  const [devices, setDevices] = useState<Device[]>([]);

  const setProperty = (prop: Property) => setCurrentProperty(prop);
  const setLot = (lot: Lot) => setCurrentLot(lot);

  const updateLotField = (key: keyof Lot, value: any) => {
    setCurrentLot((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const updateLotInList = (updatedLot: Lot) => {
    setLots((prev) =>
      prev.map((lot) =>
        lot.id === updatedLot.id ? { ...lot, ...updatedLot } : lot
      )
    );
  };

  const clearLot = () => setCurrentLot(null);

  const refreshLotsByProperty = async (propertyId: string) => {
    try {
      console.log("Solicitando lotes del predio con ID:", propertyId);
      const res = await fetch(`${API_URL}/properties/${propertyId}/lots`);
      const data = await res.json();
      console.log("Respuesta del backend:", JSON.stringify(data, null, 2));

      if (data.success) {
        const mappedLots: Lot[] = data.data.map((item: any) => ({
          id: item.id.toString(),
          name: item.name,
          latitude: item.latitude.toString(),
          longitude: item.longitude.toString(),
          extension: item.extension.toString(),
          real_estate_registration_number: item.real_estate_registration_number,
          cropType: item.nombre_tipo_cultivo || "",
          paymentInterval: item.nombre_intervalo_pago || "",
          plantingDate: item.planting_date || "",
          estimatedHarvestDate: item.estimated_harvest_date || "",
        }));

        setLots(mappedLots);
      } else {
        Alert.alert("Error", "No se pudieron obtener los lotes del predio.");
      }
    } catch (error) {
      console.error("Error al obtener lotes:", error);
      Alert.alert("Error", "Hubo un problema al cargar los lotes del predio.");
    }
  };

  const fetchDevicesByLot = async (lotId: string) => {
    try {
      const res = await fetch(`${API_URL_IOT}/devices/lot/${lotId}`);
      const data = await res.json();

      console.log(
        "Dispositivos recibidos del backend:",
        JSON.stringify(data, null, 2)
      );

      if (data.success) {
        const formattedDevices = data.data.devices.map((device: any) => ({
          ...device,
          installation_date: device.installation_date
            ? moment(device.installation_date).format("YYYY-MM-DD")
            : "",
          estimated_maintenance_date: device.estimated_maintenance_date
            ? moment(device.estimated_maintenance_date).format("YYYY-MM-DD")
            : "",
        }));

        setDevices(formattedDevices);
      } else {
        Alert.alert(
          "Error",
          "No se pudieron obtener los dispositivos del lote."
        );
      }
    } catch (error) {
      console.error("Error al obtener dispositivos:", error);
      Alert.alert("Error", "Hubo un problema al cargar los dispositivos.");
    }
  };

  const fetchCropOptions = async () => {
    try {
      const [cropRes, intervalRes] = await Promise.all([
        fetch(`${API_URL}/my-company/type-crops`),
        fetch(`${API_URL}/my-company/payment-intervals`),
      ]);

      const cropData = await cropRes.json();
      const intervalData = await intervalRes.json();

      console.log("Tipos de cultivo recibidos:", cropData.data);
      console.log("Intervalos de pago recibidos:", intervalData.data);

      if (cropData.success && intervalData.success) {
        setCropTypes(cropData.data);
        setPaymentIntervals(intervalData.data);
      } else {
        Alert.alert("Error", "No se pudieron obtener las opciones de cultivo.");
      }
    } catch (error) {
      console.error("Error al obtener opciones:", error);
      Alert.alert("Error", "Ocurrió un problema al cargar las opciones.");
    }
  };

  const saveLotToBackend = async (
    lotId: string,
    data: {
      typeCropId: number;
      paymentIntervalId: number;
      plantingDate: string;
      estimatedHarvestDate: string;
    }
  ): Promise<boolean> => {
    try {
      const formData = new FormData();
      formData.append("type_crop_id", String(data.typeCropId));
      formData.append("payment_interval", String(data.paymentIntervalId));
      formData.append(
        "planting_date",
        moment(data.plantingDate).format("YYYY-MM-DD")
      );
      formData.append(
        "estimated_harvest_date",
        moment(data.estimatedHarvestDate).format("YYYY-MM-DD")
      );

      console.log("Enviando a backend (FormData):", {
        type_crop_id: data.typeCropId,
        payment_interval: data.paymentIntervalId,
        planting_date: data.plantingDate,
        estimated_harvest_date: data.estimatedHarvestDate,
      });

      await axios.put(
        `${API_URL}/properties/lot/${lotId}/edit-crop`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Lote guardado en el backend");
      return true;
    } catch (error) {
      console.error("Error al guardar lote:", error);
      return false;
    }
  };

  const getStatusBadge = (status: string): StatusBadge => {
    const map: Record<string, StatusBadge> = {
      operativo: { text: "Operativo", color: "#27AE60", bg: "#E8F9F0" },
      "no operativo": { text: "No Operativo", color: "#E74C3C", bg: "#FCEAEA" },
      "fallo detectado": {
        text: "Fallo detectado",
        color: "#E74C3C",
        bg: "#FCEAEA",
      },
      "en mantenimiento": {
        text: "En mantenimiento",
        color: "#F39C12",
        bg: "#FFF6E0",
      },
      "sin instalar": {
        text: "Sin instalar",
        color: colors.gray,
        bg: "#F4F4F4",
      },
    };

    return (
      map[status.toLowerCase()] ?? {
        text: status,
        color: colors.gray,
        bg: colors.base,
      }
    );
  };

  return (
    <LotContext.Provider
      value={{
        currentProperty,
        currentLot,
        lots,
        cropTypes,
        paymentIntervals,
        devices,
        setProperty,
        setLot,
        updateLotField,
        updateLotInList,
        clearLot,
        refreshLotsByProperty,
        fetchCropOptions,
        fetchDevicesByLot,
        saveLotToBackend,
        getStatusBadge,
      }}
    >
      {children}
    </LotContext.Provider>
  );
};

export const useLotContext = () => {
  const context = useContext(LotContext);
  if (!context) {
    throw new Error("useLotContext debe usarse dentro de LotProvider");
  }
  return context;
};
