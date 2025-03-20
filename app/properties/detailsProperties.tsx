import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Platform,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import axios from "axios";
import CustomHeader from "@/components/CustomHeader";
import PropertyCard from "@/components/PropertyCard";
import LotCard from "@/components/LotCard";
import LotDetailsModal from "@/components/LotDetailsModal";
import { colors } from "@/config/theme";
import { typography } from "@/config/typography";
import { API_URL } from "@/services/config";
import SearchBar from "@/components/SearchBar";
import FilterButton from "@/components/FilterButton";

export default function DetailsProperties() {
  const {
    id,
    name,
    real_estate_registration_number,
    latitude,
    longitude,
    extension,
  } = useLocalSearchParams();

  const [searchText, setSearchText] = useState("");

  const [typeCrops, setTypeCrops] = useState<Record<number, string>>({});
  const [paymentIntervals, setPaymentIntervals] = useState<
    Record<number, string>
  >({});
  const [lotsArray, setLotsArray] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLot, setSelectedLot] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchCatalogs = async () => {
    try {
      const [cropsResponse, paymentsResponse] = await Promise.all([
        axios.get(`${API_URL}/my-company/type-crops`),
        axios.get(`${API_URL}/my-company/payment-intervals`),
      ]);

      const cropsMap = cropsResponse.data.data.reduce((acc: any, crop: any) => {
        acc[crop.id] = crop.name;
        return acc;
      }, {});

      const paymentsMap = paymentsResponse.data.data.reduce(
        (acc: any, payment: any) => {
          acc[payment.id] = payment.name;
          return acc;
        },
        {}
      );

      setTypeCrops(cropsMap);
      setPaymentIntervals(paymentsMap);
    } catch (error) {
      console.error("Error al obtener los catálogos:", error);
    }
  };

  const fetchLots = async () => {
    try {
      const response = await axios.get(`${API_URL}/properties/${id}/lots/`);
      console.log("Lotes recibidos:", response.data.data);
      setLotsArray(response.data.data || []);
    } catch (err) {
      console.error("Error al obtener los lotes:", err);
      setError("No se pudieron cargar los lotes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalogs();
    fetchLots();
  }, []);

  // 📌 Transformar los lotes para reemplazar IDs por nombres
  const transformedLots = lotsArray.map((lot) => ({
    ...lot,
    cropType: typeCrops[lot.type_crop_id] || "Desconocido",
    paymentInterval: paymentIntervals[lot.payment_interval] || "No definido",
    plantingDate: lot.planting_date || "No disponible",
    estimatedHarvestDate: lot.estimated_harvest_date || "No disponible",
  }));

  // 📌 Filtrar lotes según búsqueda por nombre, folio o ID
  const filteredLots = transformedLots.filter((lot) =>
    [lot.name, lot.real_estate_registration_number, lot.id].some(
      (value) =>
        value && String(value).toLowerCase().includes(searchText.toLowerCase())
    )
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <CustomHeader
            title="Detalles del predio"
            backRoute="/properties/myProperties"
          />

          <View style={styles.textContainer}>
            <Text style={[typography.regular.big, { color: colors.gray }]}>
              En esta sección podrás visualizar información sobre el predio{" "}
              {name}.
            </Text>

            <View style={styles.propContainer}>
              <PropertyCard
                name={name as string}
                id={id as string}
                folio={real_estate_registration_number as string}
                extension={extension as string}
                latitud={latitude as string}
                longitud={longitude as string}
              />
            </View>
          </View>

          <View style={styles.subtContainer}>
            <Text style={[typography.medium.large, { color: colors.darkGray }]}>
              Lotes asignados al predio
            </Text>

            <View style={styles.searchContainer}>
              <SearchBar
                searchText={searchText}
                onSearchChange={setSearchText}
              />
              <FilterButton onPress={() => console.log("Abrir filtros")} />
            </View>

            {loading ? (
              <ActivityIndicator size="large" color={colors.primary} />
            ) : error ? (
              <Text
                style={[typography.regular.medium, { color: colors.error }]}
              >
                {error}
              </Text>
            ) : (
              <View style={styles.lotContainer}>
                {filteredLots.length > 0 ? (
                  filteredLots.map((lot) => (
                    <LotCard
                      key={lot.id}
                      id={lot.id}
                      extension={lot.extension}
                      cropType={lot.cropType}
                      name={lot.name}
                      plantingDate={lot.plantingDate} // 📌 Nueva prop
                      estimatedHarvestDate={lot.estimatedHarvestDate} // 📌 Nueva prop
                      minimal={true}
                      onPress={() => {
                        setSelectedLot(lot);
                        setModalVisible(true);
                      }}
                    />
                  ))
                ) : (
                  <Text
                    style={[typography.regular.medium, { color: colors.gray }]}
                  >
                    No hay lotes asignados a este predio.
                  </Text>
                )}
              </View>
            )}
          </View>
        </ScrollView>
      </View>

      {modalVisible && selectedLot && (
        <LotDetailsModal
          isVisible={modalVisible}
          onClose={() => setModalVisible(false)}
          id={selectedLot.id}
          name={selectedLot.name}
          real_estate_registration_number={
            selectedLot.real_estate_registration_number
          }
          latitude={selectedLot.latitude}
          longitude={selectedLot.longitude}
          extension={selectedLot.extension}
          cropType={selectedLot.cropType}
          paymentInterval={selectedLot.paymentInterval}
          plantingDate={selectedLot.plantingDate}
          estimatedHarvestDate={selectedLot.estimatedHarvestDate}
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
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  textContainer: {
    marginVertical: 10,
  },
  subtContainer: {
    marginVertical: 4,
  },
  propContainer: {
    marginTop: 12,
  },
  lotContainer: {
    marginTop: 12,
  },
  searchContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 10,
  },
});
