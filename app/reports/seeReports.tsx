import React, { useState, useEffect, useMemo } from "react";
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
  Animated,
} from "react-native";
import { colors } from "@/config/theme";
import { typography } from "@/config/typography";
import CustomHeader from "@/components/CustomHeader";
import SearchBar from "@/components/SearchBar";
import ReportCard from "@/components/ReportCard";
import { useRouter } from "expo-router";
import { useReports } from "@/context/ReportContext";
import { Ionicons } from "@expo/vector-icons";

/** Botón flotante para crear nuevo reporte */
function FloatingButton() {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={floatingButtonStyles.fab}
      onPress={() => router.push("/reports/formClientReport")}
    >
      <Ionicons name="add" size={30} color="white" />
    </TouchableOpacity>
  );
}

const floatingButtonStyles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 30,
    right: 30,
    backgroundColor: colors.primary,
    width: 50,
    height: 50,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 1,
  },
});

export default function SeeReportsScreen() {
  const { reports, loading, fetchUserReports } = useReports();
  const [searchText, setSearchText] = useState("");
  const [viewType, setViewType] = useState<"pending" | "completed">("pending");
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const searchAnim = useState(new Animated.Value(0))[0];
  const router = useRouter();

  useEffect(() => {
    fetchUserReports();
  }, []);

  const filteredReports = useMemo(() => {
    const query = searchText.toLowerCase();

    let filteredByStatus: any[] = [];
    if (viewType === "pending") {
      filteredByStatus = reports.filter(
        (report) =>
          report.status === "Pendiente" || report.status === "Sin asignar"
      );
    } else if (viewType === "completed") {
      filteredByStatus = reports.filter(
        (report) => report.status === "Finalizado"
      );
    }

    const filtered = filteredByStatus.filter((report) => {
      return (
        String(report.id).includes(query) ||
        String(report.lot_id).includes(query) ||
        String(report.property_id).includes(query) ||
        report.lot_name.toLowerCase().includes(query) ||
        report.property_name.toLowerCase().includes(query) ||
        report.status.toLowerCase().includes(query) ||
        (report.source === "report" && "reporte".includes(query)) ||
        (report.source === "maintenance" && "fallo sistema".includes(query))
      );
    });

    return filtered.sort((a, b) => {
      const dateA = new Date(a.report_date).getTime();
      const dateB = new Date(b.report_date).getTime();
      return dateB - dateA;
    });
  }, [reports, viewType, searchText]);

  const animateSearchIn = () => {
    Animated.timing(searchAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const animateSearchOut = () => {
    Animated.timing(searchAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <CustomHeader title="Reportes de fallos" backRoute="/(tabs)/home" />

        <View style={styles.textContainer}>
          <Text style={[typography.regular.big, { color: colors.gray }]}>
            En esta sección puedes visualizar y generar reportes de fallos.
          </Text>

          <View style={styles.tabAndSearch}>
            <View style={styles.tabRow}>
              <View style={styles.tabGroup}>
                <TouchableOpacity
                  style={[
                    styles.tab,
                    viewType === "pending" && styles.tabActive,
                  ]}
                  onPress={() => setViewType("pending")}
                >
                  <Text
                    style={[
                      styles.tabText,
                      viewType === "pending" && styles.tabTextActive,
                    ]}
                  >
                    Pendientes
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.tab,
                    viewType === "completed" && styles.tabActive,
                  ]}
                  onPress={() => setViewType("completed")}
                >
                  <Text
                    style={[
                      styles.tabText,
                      viewType === "completed" && styles.tabTextActive,
                    ]}
                  >
                    Finalizados
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={() => {
                  setIsSearchVisible(!isSearchVisible);
                  if (isSearchVisible) {
                    setSearchText("");
                    animateSearchOut();
                  } else {
                    animateSearchIn();
                  }
                }}
                style={styles.searchButton}
              >
                <Ionicons
                  name={isSearchVisible ? "close" : "search"}
                  size={18}
                  color={colors.primary}
                />
              </TouchableOpacity>
            </View>

            {isSearchVisible && (
              <Animated.View
                style={{
                  opacity: searchAnim,
                  transform: [
                    {
                      translateY: searchAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-10, 0],
                      }),
                    },
                  ],
                  marginTop: 10,
                  width: "100%",
                }}
              >
                <View style={styles.searchBarContainer}>
                  <SearchBar
                    searchText={searchText}
                    onSearchChange={setSearchText}
                    placeholder="Buscar reportes"
                  />
                </View>
              </Animated.View>
            )}
          </View>

          <View style={styles.formContainer}>
            {loading ? (
              <ActivityIndicator size="large" color={colors.primary} />
            ) : filteredReports.length > 0 ? (
              filteredReports.map((report) => {
                const isFinalizado =
                  report?.status?.toLowerCase() === "finalizado";
                return (
                  <ReportCard
                    key={`${report.source}-${report.id}`}
                    type={report.source}
                    id={`#${report.id}`}
                    lotName={report.lot_name}
                    propertyName={report.property_name}
                    date={
                      new Date(report.report_date).toISOString().split("T")[0]
                    }
                    status={report.status}
                    onPress={() => {
                      router.push({
                        pathname: isFinalizado
                          ? "/reports/completedReportDetails"
                          : "/reports/reportDetails",
                        params: {
                          reportId: report.id,
                          technicianAssignmentId:
                            report.technician_assignment_id,
                          propertyName: report.property_name,
                          lotName: report.lot_name,
                          fallo: report.failure_type,
                          observacion: report.description_failure,
                          source: report.source,
                        },
                      });
                    }}
                  />
                );
              })
            ) : (
              <Text style={typography.regular.medium}>
                No hay reportes registrados.
              </Text>
            )}
          </View>
        </View>
      </ScrollView>

      <FloatingButton />
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
    gap: 8,
    width: "100%",
    paddingTop: 10,
    paddingHorizontal: 20,
    alignItems: "flex-start",
  },
  tabAndSearch: {
    marginTop: 6,
    width: "100%",
  },
  tabRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  tabGroup: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 4,
    gap: 6,
    flex: 1,
  },
  tab: {
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: "center",
    flexShrink: 0,
    flex: 1,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    color: colors.gray,
    fontWeight: "500",
  },
  tabTextActive: {
    color: colors.white,
    fontWeight: "bold",
  },
  searchButton: {
    marginLeft: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  searchBarContainer: {
    width: "100%",
  },
  formContainer: {
    gap: 8,
    width: "100%",
    paddingTop: 8,
    alignItems: "stretch",
    justifyContent: "center",
  },
});
