// detailsProperties.tsx actualizado para refrescar al enfocar pantalla
import React, { useState, useCallback } from "react";
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
import { useFocusEffect } from "@react-navigation/native";

export default function DetailsProperties() {
  const router = useRouter();
  const { currentProperty, lots, refreshLotsByProperty } = useLotContext();
  const [selectedLot, setSelectedLot] = useState<any | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (currentProperty?.id) {
        refreshLotsByProperty(currentProperty.id);
      }
    }, [currentProperty?.id])
  );

  if (!currentProperty) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <CustomHeader
            title="Detalles del Predio"
            backRoute={() => router.push("/properties/myProperties")}
          />

          <View style={styles.innerContainer}>
            <View style={styles.textContainer}>
              <Text style={[typography.regular.big, { color: colors.gray }]}>
                En esta sección podrás visualizar información detallada del
                predio {currentProperty.name}.
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

              <Text
                style={[
                  typography.regular.big,
                  { color: colors.gray, marginTop: 20 },
                ]}
              >
                Lotes asociados:
              </Text>

              {lots.map((lot) => (
                <LotCard
                  key={lot.id}
                  name={lot.name}
                  id={lot.id}
                  folio={lot.real_estate_registration_number}
                  extension={lot.extension}
                  latitud={lot.latitude}
                  longitud={lot.longitude}
                  cropType={lot.cropType}
                  paymentInterval={lot.paymentInterval}
                  plantingDate={lot.plantingDate}
                  estimatedHarvestDate={lot.estimatedHarvestDate}
                  onPress={() => setSelectedLot(lot)}
                />
              ))}
            </View>
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
  },
  textContainer: {
    marginVertical: 10,
  },
  propContainer: {
    marginTop: 12,
  },
});
