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
  device_type_name: string;
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
  fetchValveOpeningTypes: () => Promise<
    { label: string; value: string; id: number }[]
  >;
  createValveRequest: (params: {
    typeOpeningId: number;
    lotId: string;
    userId: number;
    deviceIotId: number;
    openDate: string;
    closeDate: string;
    volumeWater: number | null;
  }) => Promise<boolean>;
  getRequestByDeviceId: (deviceId: number) => Promise<any[]>;
  canCreateValveRequest: (deviceId: number) => Promise<boolean>;
  currentDeviceId: number | null;
  setCurrentDeviceId: (id: number | null) => void;
  currentValveId: number | null;
  setCurrentValveId: (id: number | null) => void;
}

const getDeviceTypeName = (device: any): string => {
  const deviceTypeMap: Record<number, string> = {
    1: "Válvula",
    2: "Medidor",
    3: "Controlador",
    4: "Adaptador",
    5: "Inversor",
    6: "Batería",
    7: "Panel",
    8: "Antena",
    9: "Breaker",
    10: "DPS",
    11: "Portafusible",
    12: "Fusible",
    13: "Fuente de poder",
    14: "Relé",
  };

  return deviceTypeMap[device.devices_id] || "Dispositivo desconocido";
};

const LotContext = createContext<LotContextType | undefined>(undefined);

export const LotProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentProperty, setCurrentProperty] = useState<Property | null>(null);
  const [currentLot, setCurrentLot] = useState<Lot | null>(null);
  const [lots, setLots] = useState<Lot[]>([]);
  const [cropTypes, setCropTypes] = useState<CropType[]>([]);
  const [paymentIntervals, setPaymentIntervals] = useState<PaymentInterval[]>(
    []
  );
  const [currentDeviceId, setCurrentDeviceId] = useState<number | null>(null);
  const [currentValveId, setCurrentValveId] = useState<number | null>(null);
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
      const res = await fetch(`${API_URL}/properties/${propertyId}/lots`);
      const data = await res.json();

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

      if (data.success) {
        console.log(
          "Raw response completa del backend:",
          JSON.stringify(data, null, 2)
        );
        const formattedDevices = data.data.devices.map((device: any) => {
          console.log("Dispositivo recibido desde backend:", device);
          return {
            ...device,
            installation_date: device.installation_date
              ? moment(device.installation_date).format("YYYY-MM-DD")
              : "",
            estimated_maintenance_date: device.estimated_maintenance_date
              ? moment(device.estimated_maintenance_date).format("YYYY-MM-DD")
              : "",
            device_type_name: getDeviceTypeName(device),
          };
        });

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

      await axios.put(
        `${API_URL}/properties/lot/${lotId}/edit-crop`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return true;
    } catch (error) {
      console.error("Error al guardar lote:", error);
      return false;
    }
  };

  const fetchValveOpeningTypes = async (): Promise<
    { label: string; value: string; id: number }[]
  > => {
    try {
      const res = await axios.get(`${API_URL_IOT}/devices-request/type-open/`);
      if (res.data.success) {
        return res.data.data.map((item: any) => ({
          label: item.type_opening,
          value: item.type_opening,
          id: item.id,
        }));
      }
      return [];
    } catch (error) {
      console.error("Error al obtener tipos de apertura:", error);
      return [];
    }
  };

  const createValveRequest = async ({
    typeOpeningId,
    lotId,
    userId,
    deviceIotId,
    openDate,
    closeDate,
    volumeWater,
  }: {
    typeOpeningId: number;
    lotId: string;
    userId: number;
    deviceIotId: number;
    openDate: string;
    closeDate: string;
    volumeWater: number | null;
  }): Promise<boolean> => {
    try {
      const formatDate = (date: string) => date.split(".")[0];

      const payload = {
        type_opening_id: typeOpeningId,
        lot_id: Number(lotId),
        user_id: userId,
        device_iot_id: deviceIotId,
        open_date: formatDate(openDate),
        close_date: formatDate(closeDate),
        volume_water: volumeWater,
      };

      console.log(
        "Payload enviado a create-request:",
        JSON.stringify(payload, null, 2)
      );

      const res = await axios.post(
        `${API_URL_IOT}/devices-request/create-request/`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (res.data?.success) {
        Alert.alert("Éxito", "La solicitud fue enviada correctamente.");
        return true;
      } else {
        Alert.alert(
          "Error",
          res.data?.message || "No se pudo enviar la solicitud."
        );
        return false;
      }
    } catch (error: any) {
      console.error(
        "Error al crear solicitud de apertura:",
        error.response?.data || error.message
      );
      Alert.alert("Error", "Hubo un problema al enviar la solicitud.");
      return false;
    }
  };

  const getRequestByDeviceId = async (deviceId: number): Promise<any[]> => {
    try {
      const res = await axios.get(`${API_URL_IOT}/devices-request/request/`);
      if (res.data.success) {
        return res.data.data.filter((r: any) => r.device_iot_id === deviceId);
      }
      return [];
    } catch (error) {
      console.error("Error al obtener solicitudes por dispositivo:", error);
      return [];
    }
  };

  const canCreateValveRequest = async (deviceId: number): Promise<boolean> => {
    const request = await getRequestByDeviceId(deviceId);
    return request === null;
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
        fetchValveOpeningTypes,
        createValveRequest,
        getRequestByDeviceId,
        canCreateValveRequest,
        currentDeviceId,
        setCurrentDeviceId,
        currentValveId,
        setCurrentValveId,
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
