import React, { useEffect, useState } from "react";
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { colors } from "@/config/theme";
import { typography } from "@/config/typography";
import { useLocalSearchParams } from "expo-router";
import CustomHeader from "@/components/CustomHeader";
import ConsumptionSummary from "@/components/ConsumptionSummary";
import LotConsumptionCard from "@/components/LotConsumptionCard";
import ConsumptionHistoryCardList from "@/components/ConsumptionHistoryCardList";
import { useConsumption } from "@/context/ConsumptionContext";

interface HistoryItem {
  date: string;
  recorded: string;
}

export default function LotConsumptionDetailsScreen() {
  const { id, name, extension, cropType, consumption } = useLocalSearchParams();
  const { fetchLotMeasurements } = useConsumption();

  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
  const [average, setAverage] = useState(0);
  const [latestDate, setLatestDate] = useState("");
  const [latestConsumption, setLatestConsumption] = useState("");

  useEffect(() => {
    if (!id) return;

    const loadMeasurements = async () => {
      try {
        const data = await fetchLotMeasurements(Number(id));

        // Ordenar por fecha descendente
        const sorted = data.sort(
          (a, b) =>
            new Date(b.measurement_date).getTime() -
            new Date(a.measurement_date).getTime()
        );

        // Preparar datos para historial
        const parsed = sorted.map((item) => ({
          date: new Date(item.measurement_date).toLocaleDateString("es-CO"),
          recorded: item.final_volume.toString(),
        }));

        setHistoryData(parsed);

        const volumes = data.map((item) => item.final_volume);
        const avg = volumes.reduce((sum, v) => sum + v, 0) / volumes.length;
        setAverage(Number(avg.toFixed(2)));

        if (sorted.length > 0) {
          setLatestDate(sorted[0].measurement_date);
          setLatestConsumption(sorted[0].final_volume.toString());
        }
      } catch (err) {
        console.error("Error cargando historial:", err);
      }
    };

    loadMeasurements();
  }, [id]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <CustomHeader
          title="Detalles consumo del lote"
          backRoute="/consumption/consumptionDetails"
        />
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.textContainer}>
            <Text style={[typography.regular.big, { color: colors.gray }]}>
              Consulta la información y consumo registrado para el lote {name}.
            </Text>
          </View>

          <View style={styles.bannerContainer}>
            <LotConsumptionCard
              id={String(id)}
              name={String(name)}
              consumption={latestConsumption || String(consumption)}
              billingEndDate={latestDate || new Date().toISOString()}
            />
          </View>

          <View style={styles.textContainer}>
            <Text style={[typography.regular.big, { color: colors.gray }]}>
              Consumo total registrado en los últimos 6 meses.
            </Text>
          </View>

          <View style={styles.bannerContainer}>
            <ConsumptionSummary average={average} projected={0} variation={0} />
          </View>

          <View style={styles.textContainer}>
            <Text style={[typography.regular.big, { color: colors.gray }]}>
              Historial de consumo de los últimos 6 meses.
            </Text>
          </View>

          <View style={styles.bannerContainer}>
            <ConsumptionHistoryCardList data={historyData} />
          </View>
        </ScrollView>
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
    paddingHorizontal: 16,
    marginTop: 6,
  },
  textContainer: {
    gap: 8,
    width: "100%",
    paddingTop: 6,
    paddingHorizontal: 20,
    alignItems: "flex-start",
  },
});
