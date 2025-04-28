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
import { router, useLocalSearchParams } from "expo-router";
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
  owner_document: number;
  owner_name: string;
  report_date: string;
  failure_type: string;
  description_failure: string;
  assignment_date: string;
  finalized: boolean;
  finalization_date: string;
  technician_name: string;
  technician_document: number;
  type_maintenance: string;
  fault_remarks: string;
  solution_name: string;
  solution_remarks: string;
  evidence_failure_url: string;
  evidence_solution_url: string;
}

export default function CompletedReportDetails() {
  const { reportId } = useLocalSearchParams();
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [failureImageError, setFailureImageError] = useState(false);
  const [solutionImageError, setSolutionImageError] = useState(false);

  useEffect(() => {
    const fetchReportDetail = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${API_URL_MAINT}/maintenance/reports/${reportId}/detail`
        );
        const json = await res.json();
        if (json.success) {
          setReport(json.data);
        }
      } catch (error) {
        console.error("Error al cargar detalle del reporte:", error);
      } finally {
        setLoading(false);
      }
    };

    if (reportId) {
      fetchReportDetail();
    }
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
        backRoute={() => router.push("/maintenance/completedReports")}
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

            {/* Card: Reporte #ID */}
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
                    {report ? report.status : "No disponible"}
                  </Text>
                </View>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Fecha de revisión</Text>
                <Text style={styles.value}>
                  {report
                    ? formatDate(report.assignment_date)
                    : "No disponible"}
                </Text>
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

            {/* Card: Datos del usuario */}
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

              <View style={styles.row}>
                <Text style={styles.label}>Documento del propietario</Text>
                <Text style={styles.value}>
                  {report ? report.owner_document : "No disponible"}
                </Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>
                  Predio #{report?.property_id ?? "N/A"}
                </Text>
                <Text style={styles.value}>
                  {report ? report.property_name : "No disponible"}
                </Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>
                  Lote #{report?.lot_id ?? "N/A"}
                </Text>
                <Text style={styles.value}>
                  {report ? report.lot_name : "No disponible"}
                </Text>
              </View>

              <Text style={[styles.label, { marginTop: 10 }]}>
                Posible fallo
              </Text>
              <Text style={styles.valueLeft}>
                {report ? report.failure_type : "No disponible"}
              </Text>

              <Text style={[styles.label, { marginTop: 10 }]}>
                Observaciones
              </Text>
              <Text style={styles.valueLeft}>
                {report ? report.description_failure : "No disponible"}
              </Text>

              <Text style={[styles.label, { marginTop: 10 }]}>
                Evidencia subida
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

            {/* Card: Datos de mantenimiento */}
            <View style={styles.card}>
              <Text style={[typography.bold.medium, { marginBottom: 10 }]}>
                Trabajo realizado por mantenimiento
              </Text>

              <View style={styles.row}>
                <Text style={styles.label}>Nombre del técnico</Text>
                <Text style={styles.value}>
                  {report ? report.technician_name : "No disponible"}
                </Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Tipo de mantenimiento</Text>
                <Text style={styles.value}>
                  {report ? report.type_maintenance : "No disponible"}
                </Text>
              </View>

              <Text style={[styles.label, { marginTop: 10 }]}>
                Fallo detectado
              </Text>
              <Text style={styles.valueLeft}>
                {report ? report.fault_remarks : "No disponible"}
              </Text>

              <Text style={[styles.label, { marginTop: 10 }]}>
                Solución aplicada
              </Text>
              <Text style={styles.valueLeft}>
                {report ? report.solution_name : "No disponible"}
              </Text>

              <Text style={[styles.label, { marginTop: 10 }]}>
                Observaciones de la solución
              </Text>
              <Text style={styles.valueLeft}>
                {report ? report.solution_remarks : "No disponible"}
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
