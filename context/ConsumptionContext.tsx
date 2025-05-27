import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { getUserData } from "@/services/auth";
import { API_URL_FACT } from "@/services/config";

// Tipo que representa el consumo por predio
export interface PropertyConsumption {
  property_id: number;
  property_name: string;
  extension: number;
  measurement_date: string;
  registered_consumption: number;
}

// Tipo que representa el consumo por lote
export interface LotConsumption {
  property_id: number;
  property_name: string;
  lot_id: number;
  lot_name: string;
  total_consumption: number;
  billing_start_date: string;
  billing_end_date: string;
}

// Tipo para mediciones recientes por lote
export interface LotMeasurement {
  property_id: number;
  property_name: string;
  lot_id: number;
  lot_name: string;
  measurement_date: string;
  final_volume: number;
}

interface ConsumptionContextType {
  loading: boolean;
  propertiesConsumption: PropertyConsumption[];
  fetchPropertiesConsumption: () => Promise<void>;
  selectedProperty: PropertyConsumption | null;
  setSelectedProperty: (property: PropertyConsumption | null) => void;
  lotsConsumption: LotConsumption[];
  fetchLotsConsumption: () => Promise<void>;
  fetchLotMeasurements: (lotId: number) => Promise<LotMeasurement[]>;
}

const ConsumptionContext = createContext<ConsumptionContextType>({
  loading: false,
  propertiesConsumption: [],
  fetchPropertiesConsumption: async () => {},
  selectedProperty: null,
  setSelectedProperty: () => {},
  lotsConsumption: [],
  fetchLotsConsumption: async () => {},
  fetchLotMeasurements: async () => [],
});

export const ConsumptionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [propertiesConsumption, setPropertiesConsumption] = useState<
    PropertyConsumption[]
  >([]);
  const [lotsConsumption, setLotsConsumption] = useState<LotConsumption[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProperty, setSelectedProperty] =
    useState<PropertyConsumption | null>(null);

  const fetchPropertiesConsumption = async () => {
    try {
      setLoading(true);
      const user = await getUserData();
      if (!user?.id) return;

      const res = await axios.get(
        `${API_URL_FACT}/consumption/users/${user.id}/properties/consumption_total`
      );
      setPropertiesConsumption(res.data.data);
    } catch (err) {
      console.error("Error al obtener consumo por predio:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLotsConsumption = async () => {
    try {
      setLoading(true);
      const user = await getUserData();
      if (!user?.id) return;

      const res = await axios.get(
        `${API_URL_FACT}/consumption/users/${user.id}/lots/consumptions`
      );
      setLotsConsumption(res.data);
    } catch (err) {
      console.error("Error al obtener consumo por lote:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLotMeasurements = async (
    lotId: number
  ): Promise<LotMeasurement[]> => {
    try {
      const res = await axios.get(
        `${API_URL_FACT}/consumption/lots/${lotId}/measurements/recent`
      );
      return res.data;
    } catch (err) {
      console.error("Error al obtener mediciones del lote:", err);
      return [];
    }
  };

  useEffect(() => {
    fetchPropertiesConsumption();
    fetchLotsConsumption();
  }, []);

  return (
    <ConsumptionContext.Provider
      value={{
        loading,
        propertiesConsumption,
        fetchPropertiesConsumption,
        selectedProperty,
        setSelectedProperty,
        lotsConsumption,
        fetchLotsConsumption,
        fetchLotMeasurements,
      }}
    >
      {children}
    </ConsumptionContext.Provider>
  );
};

export const useConsumption = () => useContext(ConsumptionContext);
