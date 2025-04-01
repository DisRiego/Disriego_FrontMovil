import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Platform,
  StatusBar,
} from "react-native";
import CustomHeader from "@/components/CustomHeader";
import { colors } from "@/config/theme";
import { typography } from "@/config/typography";
import { useRouter } from "expo-router";
import { useLotContext } from "@/context/LotContext";
import PropertyCard from "@/components/PropertyCard";
import LotCard from "@/components/LotCard";
import LotDetailsModal from "@/components/LotDetailsModal";
import SearchBar from "@/components/SearchBar";
import { useFocusEffect } from "@react-navigation/native";

export default function DetailsProperties() {
  const router = useRouter();
  const { currentProperty, lots, refreshLotsByProperty } = useLotContext();
  const [selectedLot, setSelectedLot] = useState<any | null>(null);
  const [searchText, setSearchText] = useState("");

  useFocusEffect(
    useCallback(() => {
      if (currentProperty?.id) {
        refreshLotsByProperty(currentProperty.id);
      }
    }, [currentProperty?.id])
  );

  if (!currentProperty) return null;

  const filteredLots = lots.filter((lot) =>
    [lot.name, lot.id, lot.real_estate_registration_number].some((value) =>
      value?.toLowerCase().includes(searchText.toLowerCase())
    )
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <CustomHeader
            title="Detalles del Predio"
            backRoute={() => router.push("/properties/myProperties")}
          />

          <View style={styles.innerContainer}>
            <Text style={[typography.regular.big, { color: colors.gray }]}>
              En esta sección podrás visualizar información detallada del predio{" "}
              {currentProperty.name}.
            </Text>

            <View style={styles.propContainer}>
              <PropertyCard
                name={currentProperty.name}
                id={currentProperty.id}
                folio={currentProperty.real_estate_registration_number}
                extension={currentProperty.extension}
                latitud={currentProperty.latitude}
                longitud={currentProperty.longitude}
              />
            </View>

            <Text style={styles.sectionTitle}>Lotes asociados:</Text>

            <View style={{ marginBottom: 12 }}>
              <SearchBar
                searchText={searchText}
                onSearchChange={setSearchText}
                placeholder="Búsqueda"
              />
            </View>

            {filteredLots.map((lot) => (
              <LotCard
                key={lot.id}
                name={lot.name}
                id={lot.id}
                folio={lot.real_estate_registration_number}
                extension={lot.extension}
                cropType={lot.cropType}
                minimal={true}
                showCropType={true}
                onPress={() => setSelectedLot(lot)}
              />
            ))}
          </View>
        </ScrollView>

        {selectedLot && (
          <LotDetailsModal
            isVisible={!!selectedLot}
            onClose={() => setSelectedLot(null)}
            name={selectedLot.name}
            id={selectedLot.id}
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
            propertyId={currentProperty.id}
            propertyName={currentProperty.name}
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
  container: {
    flex: 1,
    paddingBottom: 16,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  innerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  propContainer: {
    marginTop: 12,
  },
  sectionTitle: {
    ...typography.regular.big,
    color: colors.gray,
    marginVertical: 12,
  },
});
