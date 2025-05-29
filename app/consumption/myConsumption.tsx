import React, { useState, useEffect } from "react";
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { colors } from "@/config/theme";
import { typography } from "@/config/typography";
import SearchBar from "@/components/SearchBar";
import CustomHeader from "@/components/CustomHeader";
import ConsumptionCard from "@/components/ConsumptionCard";
import ConsumptionDetailsModal from "@/components/ConsumptionDetailsModal";
import ConsumptionChart from "@/components/ConsumptionChart";
import { useConsumption } from "@/context/ConsumptionContext";
import MobileSummaryCard from "@/components/ConsumptionSummaryCard";

const formatDate = (iso: string): string => {
  return new Date(iso).toISOString().split("T")[0];
};

const formatDateTime = (iso: string): string => {
  const date = new Date(iso);
  return date.toLocaleString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function ConsumptionScreen() {
  const [searchText, setSearchText] = useState("");
  const router = useRouter();
  const {
    propertiesConsumption,
    recentMeasurements,
    projectedMonthlyAvg,
    loading,
    selectedProperty,
    setSelectedProperty,
  } = useConsumption();

  const [modalVisible, setModalVisible] = useState(false);
  const [labels, setLabels] = useState<string[]>([]);
  const [values, setValues] = useState<number[]>([]);
  const [average, setAverage] = useState<number>(0);
  const [realAnnualAverage, setRealAnnualAverage] = useState<number>(0);
  const [projected, setProjected] = useState<number>(0);

  useEffect(() => {
    const now = new Date();
    const last4 = Array.from({ length: 4 }).map((_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`;
      return { key, label: date.toLocaleString("es-CO", { month: "short" }) };
    });

    const groupedRecent: Record<string, { total: number; count: number }> = {};
    recentMeasurements.forEach((item) => {
      const date = new Date(item.measurement_date);
      const key = `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`;
      if (last4.some((m) => m.key === key)) {
        if (!groupedRecent[key]) groupedRecent[key] = { total: 0, count: 0 };
        groupedRecent[key].total += item.final_volume;
        groupedRecent[key].count += 1;
      }
    });

    const sorted = last4.reverse();
    const monthlyValues = sorted.map((m) =>
      groupedRecent[m.key]
        ? groupedRecent[m.key].total / groupedRecent[m.key].count
        : 0
    );

    setLabels(sorted.map((m) => m.label));
    setValues(monthlyValues);

    const avg =
      monthlyValues.reduce((acc, v) => acc + v, 0) /
      (monthlyValues.length || 1);
    setAverage(parseFloat(avg.toFixed(2)));
  }, [recentMeasurements]);

  useEffect(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const grouped: Record<number, { total: number; count: number }> = {};

    recentMeasurements.forEach((item) => {
      const date = new Date(item.measurement_date);
      const year = date.getFullYear();
      const month = date.getMonth();
      if (year === currentYear) {
        if (!grouped[month]) grouped[month] = { total: 0, count: 0 };
        grouped[month].total += item.final_volume;
        grouped[month].count += 1;
      }
    });

    const monthlyAverages = Object.values(grouped).map(
      (g) => g.total / g.count
    );
    const total = monthlyAverages.reduce((acc, v) => acc + v, 0);
    const avg = monthlyAverages.length > 0 ? total / monthlyAverages.length : 0;

    setRealAnnualAverage(parseFloat(avg.toFixed(2)));
  }, [recentMeasurements]);

  useEffect(() => {
    const values = Object.values(projectedMonthlyAvg).filter((v) => v > 0);
    const total = values.reduce((acc, v) => acc + v, 0);
    const avg = values.length ? total / values.length : 0;
    setProjected(parseFloat(avg.toFixed(2)));
  }, [projectedMonthlyAvg]);

  const variation = realAnnualAverage
    ? ((projected - realAnnualAverage) / realAnnualAverage) * 100
    : 0;

  const handleOpenModal = (item: (typeof propertiesConsumption)[0]) => {
    setSelectedProperty(item);
    setModalVisible(true);
  };

  const filteredData = propertiesConsumption.filter((item) =>
    item.property_name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <CustomHeader title="Mi consumo" backRoute="/(tabs)/home" />

        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loaderText}>Cargando datos...</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.textContainer}>
              <Text style={[typography.regular.big, { color: colors.gray }]}>
                Conoce los últimos cuatro meses de consumo.
              </Text>
            </View>

            <View style={styles.bannerContainer}>
              <ConsumptionChart
                values={values}
                labels={labels}
                title="Consumos promedios (m³)"
              />
            </View>

            <View style={styles.bannerContainer}>
              <MobileSummaryCard
                average={realAnnualAverage}
                projected={projected}
                variation={parseFloat(variation.toFixed(2))}
                title="Resumen anual de consumo"
              />
            </View>

            <View style={styles.textContainer}>
              <Text style={[typography.regular.big, { color: colors.gray }]}>
                Encuentra más detalles sobre el consumo de cada predio.
              </Text>
              <SearchBar
                searchText={searchText}
                onSearchChange={setSearchText}
              />
            </View>

            <View style={styles.bannerContainer}>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <ConsumptionCard
                    key={item.property_id}
                    name={item.property_name}
                    id={String(item.property_id)}
                    extension={String(item.extension)}
                    startDate={formatDate(item.measurement_date)}
                    endDate={formatDate(item.measurement_date)}
                    consumption={String(item.registered_consumption)}
                    onPress={() => handleOpenModal(item)}
                  />
                ))
              ) : (
                <Text
                  style={[
                    typography.regular.medium,
                    { color: colors.gray, marginTop: 10 },
                  ]}
                >
                  No se encontraron resultados.
                </Text>
              )}
            </View>
          </ScrollView>
        )}

        {selectedProperty && (
          <ConsumptionDetailsModal
            isVisible={modalVisible}
            onClose={() => setModalVisible(false)}
            name={selectedProperty.property_name}
            id={String(selectedProperty.property_id)}
            extension={String(selectedProperty.extension)}
            startDate={formatDateTime(selectedProperty.measurement_date)}
            endDate={formatDateTime(selectedProperty.measurement_date)}
            consumption={String(selectedProperty.registered_consumption)}
            onDownload={() => console.log("Descargar PDF")}
            onViewDetails={() => {
              setModalVisible(false);
              setTimeout(() => {
                router.push("/consumption/consumptionDetails");
              }, 100);
            }}
          />
        )}
      </View>
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
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: colors.base,
    paddingBottom: 16,
  },
  bannerContainer: {
    width: "100%",
    paddingHorizontal: 20,
    marginTop: 10,
  },
  textContainer: {
    gap: 14,
    width: "100%",
    paddingTop: 10,
    paddingHorizontal: 20,
    alignItems: "flex-start",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    minHeight: 300,
  },
  loaderText: {
    marginTop: 12,
    ...typography.regular.medium,
    color: colors.darkGray,
  },
});
