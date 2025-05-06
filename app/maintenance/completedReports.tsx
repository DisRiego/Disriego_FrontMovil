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
} from "react-native";
import { colors } from "@/config/theme";
import { typography } from "@/config/typography";
import CustomHeader from "@/components/CustomHeader";
import SearchBar from "@/components/SearchBar";
import ReportCard from "@/components/ReportCard";
import { useRouter } from "expo-router";
import { useReports } from "@/context/ReportContext";

export default function CompletedReportsScreen() {
  const { reports, loading, fetchAssignedReports } = useReports();
  const [searchText, setSearchText] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchAssignedReports();
  }, []);

  const filteredReports = reports
    .filter((r) => r.status === "Finalizado")
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <CustomHeader
          title="Historial de reportes"
          backRoute={() => router.push("/(tabs)/home")}
        />

        <View style={styles.textContainer}>
          <Text style={[typography.regular.big, { color: colors.gray }]}>
            Aquí puedes consultar los reportes que has finalizado.
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
                  date={
                    new Date(report.report_date).toISOString().split("T")[0]
                  }
                  status={report.status}
                  onPress={() =>
                    router.push({
                      pathname: "/maintenance/completedReportDetails",
                      params: {
                        reportId: report.id,
                        technicianAssignmentId: report.technician_assignment_id,
                        propertyName: report.property_name,
                        lotName: report.lot_name,
                        fallo: report.failure_type,
                        observacion: report.description_failure,
                        source: report.source,
                      },
                    })
                  }
                />
              ))
            ) : (
              <Text style={typography.regular.medium}>
                No tienes reportes finalizados.
              </Text>
            )}
          </View>
        </View>
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
    gap: 8,
    width: "100%",
    paddingTop: 8,
    alignItems: "stretch",
    justifyContent: "center",
  },
});
