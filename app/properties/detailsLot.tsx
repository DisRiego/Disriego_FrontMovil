import React from "react";
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
import LotCard from "@/components/LotCard";
import LotInfoCard from "@/components/LotInfoCard";
import { colors } from "@/config/theme";
import { typography } from "@/config/typography";
import { useRouter } from "expo-router";
import { useLotContext } from "@/context/LotContext";

export default function DetailsLots() {
  const router = useRouter();
  const { currentLot } = useLotContext();

  if (!currentLot) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <CustomHeader
            title="Detalles del Lote"
            backRoute={() => router.replace("/properties/detailsProperties")}
          />

          <View style={styles.innerContainer}>
            <View style={styles.textContainer}>
              <Text style={[typography.regular.big, { color: colors.gray }]}>
                En esta sección podrás visualizar información detallada sobre{" "}
                {currentLot.name}.
              </Text>

              <View style={styles.propContainer}>
                <LotCard
                  name={currentLot.name}
                  id={currentLot.id}
                  folio={currentLot.real_estate_registration_number}
                  extension={currentLot.extension}
                  latitud={currentLot.latitude}
                  longitud={currentLot.longitude}
                  minimal={false}
                  showCropType={false}
                />
              </View>

              <View style={styles.cropContainer}>
                <LotInfoCard
                  onEditPress={() => {
                    router.push({
                      pathname: "/properties/updateCrops",
                      params: {
                        lotId: currentLot.id,
                        name: currentLot.name,
                        cropType: currentLot.cropType,
                        paymentInterval: currentLot.paymentInterval,
                        plantingDate: currentLot.plantingDate,
                        estimatedHarvestDate: currentLot.estimatedHarvestDate,
                      },
                    });
                  }}
                />
              </View>
            </View>
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
  container: { flex: 1, paddingBottom: 16 },
  scrollContainer: { flexGrow: 1 },
  innerContainer: { paddingHorizontal: 20 },
  textContainer: { marginVertical: 10 },
  propContainer: { marginTop: 12 },
  cropContainer: { marginTop: 12 },
});
