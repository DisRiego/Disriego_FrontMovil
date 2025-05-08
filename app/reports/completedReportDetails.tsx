import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  Image,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { colors } from "@/config/theme";
import { typography } from "@/config/typography";
import CustomHeader from "@/components/CustomHeader";
import { API_URL_MAINT } from "@/services/config";

interface ReportDetail {
  property_id: number;
  property_name: string;
  lot_id: number;
  lot_name: string;
  status: string;
  status_id: number;
  owner_document: string;
  owner_name: string;
  owner_email: string;
  owner_phone: string;
  report_date: string;
  description_failure: string;
  assignment_date: string;
  finalized: boolean;
  finalization_date: string;
  technician_name: string;
  technician_document: string;
  type_maintenance_id: number;
  type_maintenance_name: string;
  fault_remarks: string;
  solution_name: string;
  solution_remarks: string;
  evidence_failure_url: string;
  evidence_solution_url: string;
  failure_type_report: string;
  failure_type_detail: string;
  failure_solution_id: number;
  type_failure_id: number;
  detail_id: number;
  technician_assignment_id: number;
}

export default function CompletedReportDetails() {
  const { reportId, source = "report" } = useLocalSearchParams<{
    reportId: string;
    source?: "report" | "maintenance";
  }>();

  const [report, setReport] = useState<ReportDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [failureImageError, setFailureImageError] = useState(false);
  const [solutionImageError, setSolutionImageError] = useState(false);

  useEffect(() => {
    const fetchReportDetail = async () => {
      try {
        setLoading(true);
        const endpoint =
          source === "maintenance"
            ? `${API_URL_MAINT}/maintenance/${reportId}/detail`
            : `${API_URL_MAINT}/maintenance/reports/${reportId}/detail`;
        const res = await fetch(endpoint);
        const json = await res.json();
        if (json.success) setReport(json.data);
      } catch (error) {
        console.error("Error al cargar detalle:", error);
      } finally {
        setLoading(false);
      }
    };
    if (reportId) fetchReportDetail();
  }, [reportId]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "No disponible";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("es-CO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <CustomHeader
        title="Detalle del reporte"
        backRoute="/reports/seeReports"
      />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : (
          <View style={styles.content}>
            <Text style={[typography.regular.big, { color: colors.gray }]}>
              Consulta aquí los detalles y actualizaciones de tus reportes
              realizados.
            </Text>

            {/* Información general del reporte */}
            <View style={styles.card}>
              <Text style={[typography.bold.medium, { marginBottom: 10 }]}>
                Reporte #{reportId}
              </Text>
              <View style={styles.row}>
                <Text style={styles.label}>Estado</Text>
                <View style={styles.badge}>
                  <View style={styles.statusDot} />
                  <Text
                    style={[typography.bold.regular, { color: colors.success }]}
                  >
                    {" "}
                    {report?.status || "No disponible"}{" "}
                  </Text>
                </View>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Fecha de finalización</Text>
                <Text style={styles.value}>
                  {report
                    ? formatDate(report.finalization_date)
                    : "No disponible"}
                </Text>
              </View>
            </View>

            {/* Predio y lote */}
            <View style={styles.card}>
              <Text style={[typography.bold.medium, { marginBottom: 10 }]}>
                Predio y lote
              </Text>
              <View style={styles.row}>
                <Text style={styles.label}>Predio #{report?.property_id}</Text>
                <Text style={styles.value}>
                  {report?.property_name || "No disponible"}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Lote #{report?.lot_id}</Text>
                <Text style={styles.value}>
                  {report?.lot_name || "No disponible"}
                </Text>
              </View>
            </View>

            {/* Información del usuario */}
            <View style={styles.card}>
              <Text style={[typography.bold.medium, { marginBottom: 10 }]}>
                Información del usuario
              </Text>

              <Text style={styles.label}>Nombres</Text>
              <Text style={styles.valueLeft}>
                {report?.owner_name || "No disponible"}
              </Text>

              <Text style={[styles.label, { marginTop: 10 }]}>
                Correo electrónico
              </Text>
              <Text style={styles.valueLeft}>
                {report?.owner_email || "No disponible"}
              </Text>

              <Text style={[styles.label, { marginTop: 10 }]}>
                No. de documento
              </Text>
              <Text style={styles.valueLeft}>
                {report?.owner_document || "No disponible"}
              </Text>

              <Text style={[styles.label, { marginTop: 10 }]}>
                No. de celular
              </Text>
              <Text style={styles.valueLeft}>
                {report?.owner_phone || "No disponible"}
              </Text>
            </View>

            {/* Reporte del usuario */}
            <View style={styles.card}>
              <Text style={[typography.bold.medium, { marginBottom: 10 }]}>
                Reporte realizado por el usuario
              </Text>
              <View style={styles.row}>
                <Text style={styles.label}>Fecha del reporte</Text>
                <Text style={styles.value}>
                  {report ? formatDate(report.report_date) : "No disponible"}
                </Text>
              </View>
              <Text style={[styles.label, { marginTop: 10 }]}>
                Posible fallo
              </Text>
              <Text style={styles.valueLeft}>
                {report?.failure_type_report || "No disponible"}
              </Text>
              <Text style={[styles.label, { marginTop: 10 }]}>
                Observaciones
              </Text>
              <Text style={styles.valueLeft}>
                {report?.description_failure || "No disponible"}
              </Text>
            </View>

            {/* Fallo detectado por el técnico */}
            <View style={styles.card}>
              <Text style={[typography.bold.medium, { marginBottom: 10 }]}>
                Fallo detectado por el técnico
              </Text>
              <View style={styles.row}>
                <Text style={styles.label}>Fecha de revisión</Text>
                <Text style={styles.value}>
                  {report
                    ? formatDate(report.assignment_date)
                    : "No disponible"}
                </Text>
              </View>
              <Text style={[styles.label, { marginTop: 10 }]}>
                Nombre del técnico
              </Text>
              <Text style={styles.valueLeft}>
                {report?.technician_name || "No disponible"}
              </Text>
              <Text style={[styles.label, { marginTop: 10 }]}>
                Fallo confirmado
              </Text>
              <Text style={styles.valueLeft}>
                {report?.failure_type_detail || "No disponible"}
              </Text>
              <Text style={[styles.label, { marginTop: 10 }]}>
                Observaciones
              </Text>
              <Text style={styles.valueLeft}>
                {report?.fault_remarks || "No disponible"}
              </Text>
              <Text style={[styles.label, { marginTop: 10 }]}>
                Evidencia del fallo
              </Text>
              <View style={styles.imageContainer}>
                {report?.evidence_failure_url && !failureImageError ? (
                  <Image
                    source={{ uri: report.evidence_failure_url }}
                    style={styles.evidenceImage}
                    onError={() => setFailureImageError(true)}
                  />
                ) : (
                  <Text style={styles.noEvidenceText}>
                    {failureImageError
                      ? "No se pudo cargar la evidencia"
                      : "No hay evidencia disponible"}
                  </Text>
                )}
              </View>
            </View>

            {/* Solución aplicada */}
            <View style={styles.card}>
              <Text style={[typography.bold.medium, { marginBottom: 10 }]}>
                Solución aplicada
              </Text>

              <Text style={[styles.label, { marginTop: 10 }]}>
                Tipo de mantenimiento
              </Text>
              <Text style={styles.valueLeft}>
                {report?.type_maintenance_name || "No disponible"}
              </Text>

              <Text style={[styles.label, { marginTop: 10 }]}>
                Tipo de solución
              </Text>
              <Text style={styles.valueLeft}>
                {report?.solution_name || "No disponible"}
              </Text>
              <Text style={[styles.label, { marginTop: 10 }]}>
                Observaciones
              </Text>
              <Text style={styles.valueLeft}>
                {report?.solution_remarks || "No disponible"}
              </Text>
              <Text style={[styles.label, { marginTop: 10 }]}>
                Evidencia de la solución
              </Text>
              <View style={styles.imageContainer}>
                {report?.evidence_solution_url && !solutionImageError ? (
                  <Image
                    source={{ uri: report.evidence_solution_url }}
                    style={styles.evidenceImage}
                    onError={() => setSolutionImageError(true)}
                  />
                ) : (
                  <Text style={styles.noEvidenceText}>
                    {solutionImageError
                      ? "No se pudo cargar la evidencia"
                      : "No hay evidencia disponible"}
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.base,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 26,
    paddingTop: 12,
    paddingBottom: 40,
  },
  content: {
    gap: 16,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    shadowColor: "#B0B0B0",
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
    gap: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  label: {
    ...typography.medium.regular,
    color: colors.darkGray,
  },
  value: {
    ...typography.regular.medium,
    color: colors.gray,
    textAlign: "right",
  },
  valueLeft: {
    ...typography.regular.medium,
    color: colors.gray,
    textAlign: "left",
    marginTop: 4,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "#E6F9F0",
    gap: 6,
  },
  statusDot: {
    width: 5,
    height: 5,
    backgroundColor: colors.success,
    borderRadius: 3,
  },
  imageContainer: {
    width: 160,
    height: 120,
    borderRadius: 10,
    marginTop: 8,
    backgroundColor: colors.base,
    alignItems: "center",
    justifyContent: "center",
  },
  evidenceImage: {
    width: 160,
    height: 120,
    borderRadius: 10,
  },
  noEvidenceText: {
    ...typography.regular.medium,
    color: colors.gray,
    textAlign: "center",
    paddingHorizontal: 6,
  },
});
