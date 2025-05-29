import React, { useEffect, useState } from "react";
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
import { colors } from "@/config/theme";
import { typography } from "@/config/typography";
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
  const { selectedLot, fetchLotMeasurements, predictLotConsumption } =
    useConsumption();

  const [loading, setLoading] = useState(true);
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
  const [latestDate, setLatestDate] = useState("");
  const [latestConsumption, setLatestConsumption] = useState("");
  const [projected, setProjected] = useState(0);
  const [variation, setVariation] = useState(0);

  useEffect(() => {
    if (!selectedLot) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const lotId = selectedLot.lot_id;
        const totalConsumption = selectedLot.total_consumption || 0;

        const measurements = await fetchLotMeasurements(lotId);
        const sorted = measurements.sort(
          (a, b) =>
            new Date(b.measurement_date).getTime() -
            new Date(a.measurement_date).getTime()
        );

        const parsed = sorted.map((item) => ({
          date: new Date(item.measurement_date).toLocaleDateString("es-CO"),
          recorded: item.final_volume.toString(),
        }));
        setHistoryData(parsed);

        if (sorted.length > 0) {
          setLatestDate(sorted[0].measurement_date);
          setLatestConsumption(sorted[0].final_volume.toString());
        }

        const predicted = await predictLotConsumption(lotId);
        setProjected(Number(predicted.toFixed(2)));

        if (totalConsumption > 0) {
          const v = ((predicted - totalConsumption) / totalConsumption) * 100;
          setVariation(Number(v.toFixed(2)));
        } else {
          setVariation(0);
        }
      } catch (err) {
        console.error("Error cargando datos del lote:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedLot]);

  if (!selectedLot) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <CustomHeader
            title="Detalles consumo del lote"
            backRoute="/consumption/consumptionDetails"
          />
          <Text style={styles.loaderText}>
            No hay información del lote seleccionado.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const totalConsumption = selectedLot.total_consumption || 0;
  //console.log("Total consumo recibido del lote:", totalConsumption);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <CustomHeader
          title="Detalles consumo del lote"
          backRoute="/consumption/consumptionDetails"
        />
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loaderText}>Cargando datos...</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.textContainer}>
              <Text style={[typography.regular.big, { color: colors.gray }]}>
                Consulta la información y consumo registrado para el lote{" "}
                {selectedLot.lot_name}.
              </Text>
            </View>

            <View style={styles.bannerContainer}>
              <LotConsumptionCard
                id={String(selectedLot.lot_id)}
                name={selectedLot.lot_name}
                consumption={latestConsumption || String(totalConsumption)}
                billingEndDate={latestDate || new Date().toISOString()}
              />
            </View>

            <View style={styles.textContainer}>
              <Text style={[typography.regular.big, { color: colors.gray }]}>
                Resumen y consumo proyectado.
              </Text>
            </View>

            <View style={styles.bannerContainer}>
              <ConsumptionSummary
                average={totalConsumption}
                projected={projected}
                variation={variation}
              />
            </View>

            <View style={styles.textContainer}>
              <Text style={[typography.regular.big, { color: colors.gray }]}>
                Historial de consumos registrados.
              </Text>
            </View>

            <View style={styles.bannerContainer}>
              <ConsumptionHistoryCardList data={historyData} />
            </View>
          </ScrollView>
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
    paddingHorizontal: 16,
    marginTop: 4,
  },
  textContainer: {
    gap: 8,
    width: "100%",
    paddingTop: 6,
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
    textAlign: "center",
  },
});
