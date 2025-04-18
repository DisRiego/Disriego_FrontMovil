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

interface Report {
  id: number;
  lot_id: string;
  property_id: string;
  date: string;
  status: string;
}

export default function AssignedReportsScreen() {
  const [reports, setReports] = useState<Report[]>([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchAssignedReports = async () => {
      try {
        setLoading(true);
        // Simulación de datos mientras no hay endpoint real
        const mockReports: Report[] = [
          {
            id: 201,
            lot_id: "L-010",
            property_id: "P-001",
            date: "2025-04-12",
            status: "Asignado",
          },
          {
            id: 202,
            lot_id: "L-015",
            property_id: "P-002",
            date: "2025-04-10",
            status: "En progreso",
          },
        ];
        setReports(mockReports);
      } catch (error) {
        console.error("Error al cargar reportes asignados:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignedReports();
  }, []);

  const filteredReports = reports.filter((report) =>
    String(report.id).toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <CustomHeader title="Reportes asignados" backRoute="/(tabs)/home" />

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
                  key={report.id}
                  type="maintenance"
                  id={`#${report.id}`}
                  lotId={report.lot_id}
                  propertyId={report.property_id}
                  date={report.date}
                  status={report.status}
                  onPress={() => router.push(`/reports/details/${report.id}`)}
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
