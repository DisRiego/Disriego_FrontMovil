import React, { createContext, useContext, useEffect, useState } from "react";
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

        // Precargar soluciones por tipo
        for (const tipo of formattedMaintenance) {
          const id = tipo.value;
          const cacheKey = `failureSolutionsByType_${id}`;

          try {
            const res = await fetch(
              `${API_URL_MAINT}/maintenance/failure-solutions/by-maintenance-type/${id}`
            );
            const data = await res.json();
            if (data.success) {
              const formatted = data.data.map((item: any) => ({
                label: item.name,
                value: item.id.toString(),
              }));
              await AsyncStorage.setItem(cacheKey, JSON.stringify(formatted));
              console.log(`Soluciones cacheadas para tipo ${id}`);
            }
          } catch (err) {
            console.log(`No se pudo cachear soluciones para tipo ${id}`);
          }
        }
      }
    } catch (error) {
      // --- Recuperar desde cache local ---
      const cachedFailures = await AsyncStorage.getItem("failureTypes");
      const cachedMaintenance = await AsyncStorage.getItem("maintenanceTypes");

      if (cachedFailures) {
        try {
          setFailureTypes(JSON.parse(cachedFailures));
        } catch (e) {
          console.log("Error parseando fallos desde cache:", e);
        }
      }

      if (cachedMaintenance) {
        try {
          const parsed = JSON.parse(cachedMaintenance);
          setMaintenanceTypes([
            { label: "Selecciona una opción", value: "" },
            ...parsed,
          ]);
        } catch (e) {
          console.log("Error parseando tipos mantenimiento desde cache:", e);
        }
      }

      if (!cachedFailures && !cachedMaintenance) {
        console.error("Error cargando opciones de mantenimiento:", error);
      } else {
        console.log("Opciones cargadas desde caché tras error de red.");
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

  useEffect(() => {
    if (failureTypes.length === 0 || maintenanceTypes.length === 0) {
      const cargarOpciones = async () => {
        try {
          await fetchMaintenanceOptions();
        } catch (e) {
          console.log("Error ignorado al cargar opciones automáticamente:", e);
        }
      };

      cargarOpciones();
    }
  }, []);

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
