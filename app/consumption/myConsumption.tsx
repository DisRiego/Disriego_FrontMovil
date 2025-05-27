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
import SearchBar from "@/components/SearchBar";
import CustomHeader from "@/components/CustomHeader";
import ConsumptionSummary from "@/components/ConsumptionSummary";
import ConsumptionCard from "@/components/ConsumptionCard";
import ConsumptionDetailsModal from "@/components/ConsumptionDetailsModal";
import { useConsumption } from "@/context/ConsumptionContext";

// Función para mostrar solo la fecha (YYYY-MM-DD)
const formatDate = (iso: string): string => {
  return new Date(iso).toISOString().split("T")[0];
};

// Función para mostrar fecha + hora:minuto (local)
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
    loading,
    selectedProperty,
    setSelectedProperty,
  } = useConsumption();

  const [modalVisible, setModalVisible] = useState(false);

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

        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.textContainer}>
            <Text style={[typography.regular.big, { color: colors.gray }]}>
              Conoce los últimos cuatro meses de consumo.
            </Text>
          </View>

          <View style={styles.bannerContainer}>
            <ConsumptionSummary average={18} projected={10} variation={5} />
          </View>

          <View style={styles.textContainer}>
            <Text style={[typography.regular.big, { color: colors.gray }]}>
              Encuentra más detalles sobre el consumo de cada predio.
            </Text>
            <SearchBar searchText={searchText} onSearchChange={setSearchText} />
          </View>

          <View style={styles.bannerContainer}>
            {loading ? (
              <Text style={typography.regular.medium}>Cargando...</Text>
            ) : filteredData.length > 0 ? (
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
});
