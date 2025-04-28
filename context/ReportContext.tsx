import React, { createContext, useContext, useState } from "react";
import { API_URL_MAINT } from "@/services/config";
import { getUserData } from "@/services/auth";

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
}

interface ReportsContextProps {
  reports: Report[];
  loading: boolean;
  fetchUserReports: () => Promise<void>;
  fetchAssignedReports: () => Promise<void>;
  getReportById: (id: number) => Report | undefined;
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

      const res = await fetch(
        `${API_URL_MAINT}/maintenance/user/${user.id}/reports`
      );
      const data = await res.json();

      if (data.success) {
        const mapped: Report[] = data.data.map((r: any) => ({
          id: r.report_id,
          lot_id: r.lot_id,
          lot_name: r.lot_name,
          property_id: r.property_id,
          property_name: r.property_name,
          report_date: r.report_date,
          status: r.status,
          failure_type: r.failure_type,
          description_failure: r.description_failure,
        }));
        setReports(mapped);
      }
    } catch (error) {
      console.error("Error cargando reportes de usuario:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignedReports = async () => {
    try {
      setLoading(true);
      const user = await getUserData();
      if (!user) throw new Error("Usuario no autenticado");

      const res = await fetch(
        `${API_URL_MAINT}/maintenance/assigned/${user.id}/reports`
      );
      const data = await res.json();

      if (data.success) {
        const mapped: Report[] = data.data.map((r: any) => ({
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
        }));
        setReports(mapped);
      }
    } catch (error) {
      console.error("Error cargando reportes asignados:", error);
    } finally {
      setLoading(false);
    }
  };

  const getReportById = (id: number) => {
    return reports.find((r) => r.id === id);
  };

  return (
    <ReportsContext.Provider
      value={{
        reports,
        loading,
        fetchUserReports,
        fetchAssignedReports,
        getReportById,
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
