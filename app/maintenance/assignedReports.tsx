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
  TouchableOpacity,
} from "react-native";
import { colors } from "@/config/theme";
import { typography } from "@/config/typography";
import CustomHeader from "@/components/CustomHeader";
import SearchBar from "@/components/SearchBar";
import ReportCard from "@/components/ReportCard";
import { useRouter } from "expo-router";
import ReportDetailsModal from "@/components/ReportDetailsModal";
import { useReports } from "@/context/ReportContext";

export default function AssignedReportsScreen() {
  const { reports, loading, fetchAssignedReports } = useReports();
  const [searchText, setSearchText] = useState("");
  const router = useRouter();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);

  useEffect(() => {
    fetchAssignedReports();
  }, []);

  const formatDate = (dateStr: string | null | undefined) => {
    const date = new Date(dateStr ?? "");
    return !isNaN(date.getTime())
      ? date.toISOString().split("T")[0]
      : "Fecha inválida";
  };

  const filteredReports = reports
    .filter((r) => r.status !== "Finalizado" && !r.pendingSync)
    .filter((report) => {
      const query = searchText.toLowerCase();
      return (
        String(report.id).toLowerCase().includes(query) ||
        report.property_name.toLowerCase().includes(query) ||
        report.lot_name.toLowerCase().includes(query) ||
        report.failure_type.toLowerCase().includes(query) ||
        report.status.toLowerCase().includes(query) ||
        (report.source === "report" && "reporte".includes(query)) ||
        (report.source === "maintenance" && "fallo sistema".includes(query))
      );
    });

  const openModal = (report: any) => {
    setSelectedReport(report);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedReport(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <CustomHeader
          title="Reportes asignados"
          backRoute={() => router.push("/(tabs)/home")}
        />

        <View style={styles.textContainer}>
          <Text style={[typography.regular.big, { color: colors.gray }]}>
            Aquí puedes gestionar los reportes que te han sido asignados.
          </Text>

          <SearchBar searchText={searchText} onSearchChange={setSearchText} />

          <View style={styles.formContainer}>
            {loading ? (
              <ActivityIndicator size="large" color={colors.primary} />
            ) : filteredReports.length > 0 ? (
              filteredReports.map((report) => (
                <ReportCard
                  key={`${report.source}-${report.id}`}
                  type={report.source ?? "report"}
                  id={`#${report.id}`}
                  lotName={report.lot_name}
                  propertyName={report.property_name}
                  date={formatDate(report.report_date)}
                  status={report.status}
                  onPress={() => openModal(report)}
                />
              ))
            ) : (
              <Text style={typography.regular.medium}>
                No tienes reportes asignados.
              </Text>
            )}
          </View>
        </View>
      </ScrollView>

      {selectedReport && (
        <ReportDetailsModal
          isVisible={modalVisible}
          onClose={closeModal}
          reportId={selectedReport.id}
          reportDate={formatDate(selectedReport.report_date)}
          propertyName={selectedReport.property_name}
          lotName={selectedReport.lot_name}
          failureType={selectedReport.failure_type}
          source={selectedReport.source}
          onViewDetails={() => {
            closeModal();
            router.push({
              pathname: "/maintenance/reportDetails",
              params: {
                reportId: selectedReport.id,
                technicianAssignmentId: selectedReport.technician_assignment_id,
                propertyName: selectedReport.property_name,
                lotName: selectedReport.lot_name,
                fallo: selectedReport.failure_type,
                observacion: selectedReport.description_failure,
                source: selectedReport.source,
              },
            });
          }}
          onFinalize={() => {
            closeModal();
            router.push({
              pathname: "/maintenance/formFinishReport",
              params: {
                reportId: selectedReport.id,
                technicianAssignmentId: selectedReport.technician_assignment_id,
                propertyName: selectedReport.property_name,
                lotName: selectedReport.lot_name,
                fallo: selectedReport.failure_type,
                observacion: selectedReport.description_failure,
              },
            });
          }}
          mode="assigned"
        />
      )}
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
    paddingBottom: 40,
  },
  textContainer: {
    gap: 14,
    width: "100%",
    paddingTop: 10,
    paddingHorizontal: 20,
    alignItems: "flex-start",
  },
  formContainer: {
    gap: 14,
    width: "100%",
    paddingTop: 8,
    alignItems: "stretch",
    justifyContent: "center",
  },
});
