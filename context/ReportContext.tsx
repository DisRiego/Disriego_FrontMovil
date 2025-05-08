import React, { createContext, useContext, useState } from "react";
import { API_URL_MAINT } from "@/services/config";
import { getUserData } from "@/services/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Report {
  id: number;
  lot_id: number;
  lot_name: string;
  property_id: number;
  property_name: string;
  report_date: string;
  status: string;
  failure_type: string;
  description_failure?: string;
  technician_assignment_id?: number;
  pendingSync?: boolean;
  source?: "report" | "maintenance";
}

interface ReportsContextProps {
  reports: Report[];
  loading: boolean;
  fetchUserReports: () => Promise<void>;
  fetchAssignedReports: () => Promise<void>;
  getReportById: (id: number) => Report | undefined;
  getMaintenanceById: (id: number) => Promise<Report | null>;
  markReportAsPendingSync: (reportId: number) => void;
  clearReportsCache: () => Promise<void>;
}

const ReportsContext = createContext<ReportsContextProps | undefined>(
  undefined
);

export const ReportsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUserReports = async () => {
    try {
      setLoading(true);
      const user = await getUserData();
      if (!user) throw new Error("Usuario no autenticado");

      const [resReports, resMaintenances] = await Promise.all([
        fetch(`${API_URL_MAINT}/maintenance/user/${user.id}/reports`),
        fetch(`${API_URL_MAINT}/maintenance/user/${user.id}/maintenances`),
      ]);

      const [dataReports, dataMaintenances] = await Promise.all([
        resReports.json(),
        resMaintenances.json(),
      ]);

      const mappedReports: Report[] = dataReports.data.map((r: any) => ({
        id: r.report_id,
        lot_id: r.lot_id,
        lot_name: r.lot_name,
        property_id: r.property_id,
        property_name: r.property_name,
        report_date: r.report_date,
        status: r.status,
        failure_type: r.failure_type,
        description_failure: r.description_failure,
        technician_assignment_id: r.technician_assignment_id,
        pendingSync: false,
        source: "report",
      }));

      const mappedMaintenances: Report[] = dataMaintenances.data.map(
        (r: any) => ({
          id: r.maintenance_id,
          lot_id: r.lot_id,
          lot_name: r.lot_name,
          property_id: r.property_id,
          property_name: r.property_name,
          report_date: r.report_date?.includes("T")
            ? r.report_date
            : `${r.report_date}T00:00:00`,
          status: r.status,
          failure_type: r.failure_type,
          description_failure: r.description_failure,
          technician_assignment_id: r.technician_assignment_id,
          pendingSync: false,
          source: "maintenance",
        })
      );

      const allCombined = [...mappedReports, ...mappedMaintenances];
      setReports(allCombined);
      await AsyncStorage.setItem("userReports", JSON.stringify(allCombined));
    } catch (error) {
      console.error(
        "Error cargando reportes y mantenimientos de usuario:",
        error
      );
      const cached = await AsyncStorage.getItem("userReports");
      if (cached) {
        setReports(JSON.parse(cached));
        console.log("Cargado reportes de usuario desde cache local.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignedReports = async () => {
    try {
      setLoading(true);
      const user = await getUserData();
      if (!user) throw new Error("Usuario no autenticado");

      const [resReports, resMaintenances] = await Promise.all([
        fetch(`${API_URL_MAINT}/maintenance/assigned/${user.id}/reports`),
        fetch(`${API_URL_MAINT}/maintenance/assigned/${user.id}/maintenances`),
      ]);

      const [dataReports, dataMaintenances] = await Promise.all([
        resReports.json(),
        resMaintenances.json(),
      ]);

      const mappedReports: Report[] = dataReports.data.map((r: any) => ({
        id: r.report_id,
        lot_id: r.lot_id,
        lot_name: r.lot_name,
        property_id: r.property_id,
        property_name: r.property_name,
        report_date: r.report_date,
        status: r.status,
        failure_type: r.failure_type,
        description_failure: r.description_failure,
        technician_assignment_id: r.technician_assignment_id,
        pendingSync: false,
        source: "report",
      }));

      const mappedMaintenances: Report[] = dataMaintenances.data.map(
        (r: any) => ({
          id: r.maintenance_id,
          lot_id: r.lot_id,
          lot_name: r.lot_name,
          property_id: r.property_id,
          property_name: r.property_name,
          report_date: r.report_date?.includes("T")
            ? r.report_date
            : `${r.report_date}T00:00:00`,
          status: r.status,
          failure_type: r.failure_type,
          description_failure: r.description_failure,
          technician_assignment_id: r.technician_assignment_id,
          pendingSync: false,
          source: "maintenance",
        })
      );

      const allCombined = [...mappedReports, ...mappedMaintenances];
      setReports(allCombined);
      await AsyncStorage.setItem(
        "assignedReports",
        JSON.stringify(allCombined)
      );
    } catch (error) {
      console.error(
        "Error cargando reportes y mantenimientos asignados:",
        error
      );
      const cached = await AsyncStorage.getItem("assignedReports");
      if (cached) {
        setReports(JSON.parse(cached));
        console.log("Cargado reportes asignados desde cache local.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getReportById = (id: number) => {
    return reports.find((r) => r.id === id);
  };

  const getMaintenanceById = async (id: number): Promise<Report | null> => {
    const localMatch = reports.find((r) => r.id === id);
    if (localMatch) return localMatch;

    try {
      const res = await fetch(`${API_URL_MAINT}/maintenance/${id}/detail`);
      const data = await res.json();

      if (data.success) {
        const r = data.data;
        const maintenance: Report = {
          id: r.id,
          lot_id: r.lot_id,
          lot_name: r.lot_name,
          property_id: r.property_id,
          property_name: r.property_name,
          report_date: r.date,
          status: r.status,
          failure_type: r.failure_type,
          description_failure: r.description_failure,
          technician_assignment_id: r.technician_assignment_id,
          pendingSync: false,
          source: "maintenance",
        };

        setReports((prev) => [...prev, maintenance]);
        return maintenance;
      } else {
        console.warn("Detalle de mantenimiento no encontrado:", data);
        return null;
      }
    } catch (error) {
      console.error("Error obteniendo detalle del mantenimiento:", error);
      return null;
    }
  };

  const markReportAsPendingSync = async (reportId: number) => {
    setReports((prevReports) => {
      const updated = prevReports.map((r) =>
        r.id === reportId ? { ...r, pendingSync: true } : r
      );
      AsyncStorage.setItem("assignedReports", JSON.stringify(updated)).catch(
        (err) => console.error("Error guardando assignedReports:", err)
      );
      return updated;
    });
  };

  const clearReportsCache = async () => {
    try {
      await AsyncStorage.removeItem("assignedReports");
      await AsyncStorage.removeItem("userReports");
      console.log("Cache de reportes limpiado.");
    } catch (error) {
      console.error("Error limpiando cache de reportes:", error);
    }
  };

  return (
    <ReportsContext.Provider
      value={{
        reports,
        loading,
        fetchUserReports,
        fetchAssignedReports,
        getReportById,
        getMaintenanceById,
        markReportAsPendingSync,
        clearReportsCache,
      }}
    >
      {children}
    </ReportsContext.Provider>
  );
};

export const useReports = () => {
  const context = useContext(ReportsContext);
  if (!context) {
    throw new Error("useReports debe usarse dentro de un ReportsProvider");
  }
  return context;
};
