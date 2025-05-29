import React, { useState } from "react";
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { colors } from "@/config/theme";
import { typography } from "@/config/typography";
import CustomHeader from "@/components/CustomHeader";
import ConsumptionCard from "@/components/ConsumptionCard";
import LotConsumptionCard from "@/components/LotConsumptionCard";
import LotConsumptionDetailsModal from "@/components/LotConsumptionDetailsModal";
import { useConsumption } from "@/context/ConsumptionContext";
import { LotConsumption } from "@/context/ConsumptionContext"; // para tipado

const formatDate = (iso: string): string => {
  return new Date(iso).toLocaleDateString("es-CO");
};

export default function ConsumptionDetailsScreen() {
  const router = useRouter();
  const {
    selectedProperty,
    lotsConsumption,
    setSelectedLot, // ahora desde el contexto
  } = useConsumption();

  const [modalLot, setModalLot] = useState<LotConsumption | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleOpenLotModal = (lot: LotConsumption) => {
    setModalLot(lot);
    setModalVisible(true);
  };

  const filteredLots = lotsConsumption.filter(
    (lot) =>
      selectedProperty && lot.property_id === selectedProperty.property_id
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <CustomHeader
            title="Detalles consumo del predio"
            backRoute="/consumption/myConsumption"
          />

          {selectedProperty && (
            <>
              <View style={styles.textContainer}>
                <Text style={[typography.regular.big, { color: colors.gray }]}>
                  En esta sección podrás visualizar información detallada sobre{" "}
                  {selectedProperty.property_name}.
                </Text>
              </View>

              <View style={styles.bannerContainer}>
                <ConsumptionCard
                  name={selectedProperty.property_name}
                  id={String(selectedProperty.property_id)}
                  extension={String(selectedProperty.extension)}
                  startDate={formatDate(selectedProperty.measurement_date)}
                  endDate={formatDate(selectedProperty.measurement_date)}
                  consumption={String(selectedProperty.registered_consumption)}
                />
              </View>
            </>
          )}

          <View style={styles.textContainer}>
            <Text style={[typography.regular.big, { color: colors.gray }]}>
              Lotes asignados al predio
            </Text>
          </View>

          <View style={styles.bannerContainer}>
            {filteredLots.length > 0 ? (
              filteredLots.map((lot) => (
                <LotConsumptionCard
                  key={lot.lot_id}
                  id={String(lot.lot_id)}
                  name={lot.lot_name}
                  consumption={String(lot.total_consumption)}
                  billingEndDate={lot.billing_end_date}
                  onPress={() => handleOpenLotModal(lot)}
                />
              ))
            ) : (
              <Text
                style={[
                  typography.regular.medium,
                  { color: colors.gray, marginTop: 10 },
                ]}
              >
                No hay lotes registrados para este predio.
              </Text>
            )}
          </View>
        </ScrollView>

        {modalLot && (
          <LotConsumptionDetailsModal
            isVisible={modalVisible}
            onClose={() => setModalVisible(false)}
            name={modalLot.lot_name}
            id={String(modalLot.lot_id)}
            consumption={String(modalLot.total_consumption)}
            billingEndDate={modalLot.billing_end_date}
            onDownload={() => console.log("Descargar PDF")}
            onViewDetails={() => {
              setModalVisible(false);
              setSelectedLot(modalLot);
              router.push("/consumption/lotConsumptionDetails");
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
});
