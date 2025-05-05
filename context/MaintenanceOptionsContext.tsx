import React, { createContext, useContext, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL_MAINT } from "@/services/config";

interface Option {
  label: string;
  value: string;
}

interface MaintenanceOptionsContextProps {
  failureTypes: Option[];
  solutions: Option[];
  maintenanceTypes: Option[];
  loading: boolean;
  fetchMaintenanceOptions: () => Promise<void>;
  fetchSolutionsByMaintenanceType: (maintenanceTypeId: string) => Promise<void>;
}

const MaintenanceOptionsContext = createContext<
  MaintenanceOptionsContextProps | undefined
>(undefined);

export const MaintenanceOptionsProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [failureTypes, setFailureTypes] = useState<Option[]>([]);
  const [solutions, setSolutions] = useState<Option[]>([]);
  const [maintenanceTypes, setMaintenanceTypes] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMaintenanceOptions = async () => {
    setLoading(true);
    try {
      // --- Fallos ---
      const resFailures = await fetch(
        `${API_URL_MAINT}/maintenance/failure-types`
      );
      const dataFailures = await resFailures.json();
      if (dataFailures.success) {
        const formattedFailures = dataFailures.data.map((item: any) => ({
          label: item.name,
          value: item.id.toString(),
        }));
        setFailureTypes(formattedFailures);
        await AsyncStorage.setItem(
          "failureTypes",
          JSON.stringify(formattedFailures)
        );
      }

      // --- Soluciones generales ---
      const resSolutions = await fetch(
        `${API_URL_MAINT}/maintenance/failure-solutions`
      );
      const dataSolutions = await resSolutions.json();
      if (dataSolutions.success) {
        const formattedSolutions = dataSolutions.data.map((item: any) => ({
          label: item.name,
          value: item.id.toString(),
        }));
        setSolutions([
          { label: "Selecciona una opción", value: "" },
          ...formattedSolutions,
        ]);
        await AsyncStorage.setItem(
          "failureSolutions",
          JSON.stringify(formattedSolutions)
        );
      }

      // --- Tipos de mantenimiento ---
      const resMaintenanceTypes = await fetch(
        `${API_URL_MAINT}/maintenance/maintenance-types`
      );
      const dataMaintenanceTypes = await resMaintenanceTypes.json();
      if (Array.isArray(dataMaintenanceTypes)) {
        const formattedMaintenance = dataMaintenanceTypes.map((item: any) => ({
          label: item.name,
          value: item.id.toString(),
        }));
        const withDefault = [
          { label: "Selecciona una opción", value: "" },
          ...formattedMaintenance,
        ];
        setMaintenanceTypes(withDefault);
        await AsyncStorage.setItem(
          "maintenanceTypes",
          JSON.stringify(formattedMaintenance)
        );
      }
    } catch (error) {
      console.error("Error cargando opciones de mantenimiento:", error);

      const cachedFailures = await AsyncStorage.getItem("failureTypes");
      const cachedSolutions = await AsyncStorage.getItem("failureSolutions");
      const cachedMaintenance = await AsyncStorage.getItem("maintenanceTypes");

      if (cachedFailures) setFailureTypes(JSON.parse(cachedFailures));
      if (cachedSolutions) {
        const parsed = JSON.parse(cachedSolutions);
        setSolutions([
          { label: "Selecciona una opción", value: "" },
          ...parsed,
        ]);
      }
      if (cachedMaintenance) {
        const parsed = JSON.parse(cachedMaintenance);
        setMaintenanceTypes([
          { label: "Selecciona una opción", value: "" },
          ...parsed,
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchSolutionsByMaintenanceType = async (maintenanceTypeId: string) => {
    const cacheKey = `failureSolutionsByType_${maintenanceTypeId}`;
    try {
      const cached = await AsyncStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        setSolutions([
          { label: "Selecciona una opción", value: "" },
          ...parsed,
        ]);
        return;
      }

      const res = await fetch(
        `${API_URL_MAINT}/maintenance/failure-solutions/by-maintenance-type/${maintenanceTypeId}`
      );
      const data = await res.json();
      if (data.success) {
        const formatted = data.data.map((item: any) => ({
          label: item.name,
          value: item.id.toString(),
        }));
        setSolutions([
          { label: "Selecciona una opción", value: "" },
          ...formatted,
        ]);
        await AsyncStorage.setItem(cacheKey, JSON.stringify(formatted));
      }
    } catch (error) {
      console.error(
        "Error cargando soluciones por tipo de mantenimiento:",
        error
      );
      setSolutions([]);
    }
  };

  return (
    <MaintenanceOptionsContext.Provider
      value={{
        failureTypes,
        solutions,
        maintenanceTypes,
        loading,
        fetchMaintenanceOptions,
        fetchSolutionsByMaintenanceType,
      }}
    >
      {children}
    </MaintenanceOptionsContext.Provider>
  );
};

export const useMaintenanceOptions = () => {
  const context = useContext(MaintenanceOptionsContext);
  if (!context) {
    throw new Error(
      "useMaintenanceOptions debe usarse dentro de un MaintenanceOptionsProvider"
    );
  }
  return context;
};
