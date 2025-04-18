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
  date: string;
  status: string;
}

export default function SeeReportsScreen() {
  const [reports, setReports] = useState<Report[]>([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        // Simulación de datos mientras no hay endpoint
        const mockReports: Report[] = [
          {
            id: 101,
            lot_id: "L-001",
            date: "2025-04-13",
            status: "En mantenimiento",
          },
          {
            id: 102,
            lot_id: "L-002",
            date: "2025-04-11",
            status: "Pendiente",
          },
        ];
        setReports(mockReports);
      } catch (error) {
        console.error("Error cargando reportes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const filteredReports = reports.filter((report) =>
    String(report.id).toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <CustomHeader title="Reportes de fallos" backRoute="/(tabs)/home" />

        <View style={styles.textContainer}>
          <Text style={[typography.regular.big, { color: colors.gray }]}>
            En esta sección puedes visualizar y generar reportes de fallos.
          </Text>

          <SearchBar searchText={searchText} onSearchChange={setSearchText} />

          <View style={styles.formContainer}>
            {loading ? (
              <ActivityIndicator size="large" color={colors.primary} />
            ) : filteredReports.length > 0 ? (
              filteredReports.map((report) => (
                <ReportCard
                  key={report.id}
                  type="report"
                  id={`#${report.id}`}
                  lotId={report.lot_id}
                  date={report.date}
                  status={report.status}
                  onPress={() => router.push(`/reports/details/${report.id}`)}
                />
              ))
            ) : (
              <Text style={typography.regular.medium}>
                No hay reportes registrados.
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
    gap: 12,
    width: "100%",
    paddingTop: 8,
    alignItems: "stretch",
    justifyContent: "center",
  },
});
