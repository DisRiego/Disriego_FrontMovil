import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { getUserData } from "@/services/auth";
import { API_URL_FACT } from "@/services/config";

export interface PropertyConsumption {
  property_id: number;
  property_name: string;
  extension: number;
  measurement_date: string;
  registered_consumption: number;
}

export interface LotConsumption {
  property_id: number;
  property_name: string;
  lot_id: number;
  lot_name: string;
  total_consumption: number;
  billing_start_date: string;
  billing_end_date: string;
}

export interface LotMeasurement {
  property_id: number;
  property_name: string;
  lot_id: number;
  lot_name: string;
  measurement_date: string;
  final_volume: number;
}

type ProjectedAvg = Record<string, number>;

interface ConsumptionContextType {
  loading: boolean;
  propertiesConsumption: PropertyConsumption[];
  fetchPropertiesConsumption: () => Promise<void>;
  selectedProperty: PropertyConsumption | null;
  setSelectedProperty: (property: PropertyConsumption | null) => void;
  lotsConsumption: LotConsumption[];
  fetchLotsConsumption: () => Promise<void>;
  fetchLotMeasurements: (lotId: number) => Promise<LotMeasurement[]>;
  predictLotConsumption: (lotId: number) => Promise<number>;
  selectedLot: LotConsumption | null;
  setSelectedLot: (lot: LotConsumption | null) => void;
  recentMeasurements: LotMeasurement[];
  fetchRecentMeasurements: () => Promise<void>;
  projectedMonthlyAvg: ProjectedAvg;
  fetchProjectedMonthlyAvg: () => Promise<void>;
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
  predictLotConsumption: async () => 0,
  selectedLot: null,
  setSelectedLot: () => {},
  recentMeasurements: [],
  fetchRecentMeasurements: async () => {},
  projectedMonthlyAvg: {},
  fetchProjectedMonthlyAvg: async () => {},
});

export const ConsumptionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [propertiesConsumption, setPropertiesConsumption] = useState<
    PropertyConsumption[]
  >([]);
  const [lotsConsumption, setLotsConsumption] = useState<LotConsumption[]>([]);
  const [recentMeasurements, setRecentMeasurements] = useState<
    LotMeasurement[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [selectedProperty, setSelectedProperty] =
    useState<PropertyConsumption | null>(null);
  const [selectedLot, setSelectedLot] = useState<LotConsumption | null>(null);
  const [projectedMonthlyAvg, setProjectedMonthlyAvg] = useState<ProjectedAvg>(
    {}
  );

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

  const fetchRecentMeasurements = async () => {
    try {
      const user = await getUserData();
      if (!user?.id) return;
      const res = await axios.get(
        `${API_URL_FACT}/consumption/users/${user.id}/lots/measurements`
      );
      setRecentMeasurements(res.data);
    } catch (err) {
      console.error("Error al obtener mediciones recientes:", err);
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

  const predictLotConsumption = async (lotId: number): Promise<number> => {
    try {
      const res = await axios.post(
        `${API_URL_FACT}/facturations/predict-consumption`,
        { lot_id: lotId }
      );
      return res.data.consumo_ajustado_final;
    } catch (err) {
      console.error("Error al predecir consumo del lote:", err);
      return 0;
    }
  };

  const fetchProjectedMonthlyAvg = async () => {
    try {
      const user = await getUserData();
      if (!user?.id) return;
      const currentYear = new Date().getFullYear();
      const res = await axios.get(
        `${API_URL_FACT}/consumption/users/${user.id}/projected_avg_by_month/${currentYear}`
      );
      setProjectedMonthlyAvg(res.data.projected_monthly_avg || {});
    } catch (err) {
      console.error("Error al obtener promedio proyectado mensual:", err);
    }
  };

  useEffect(() => {
    fetchPropertiesConsumption();
    fetchLotsConsumption();
    fetchRecentMeasurements();
    fetchProjectedMonthlyAvg();
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
        predictLotConsumption,
        selectedLot,
        setSelectedLot,
        recentMeasurements,
        fetchRecentMeasurements,
        projectedMonthlyAvg,
        fetchProjectedMonthlyAvg,
      }}
    >
      {children}
    </ConsumptionContext.Provider>
  );
};

export const useConsumption = () => useContext(ConsumptionContext);
