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
import { useLocalSearchParams } from "expo-router";
import CustomHeader from "@/components/CustomHeader";
import PropertyCard from "@/components/PropertyCard";
import LotCard from "@/components/LotCard"; // 🔹 Importamos LotCard
import { colors } from "@/config/theme";
import { typography } from "@/config/typography";

export default function DetailsProperties() {
  // Obtener los parámetros pasados en la navegación
  const {
    id,
    name,
    real_estate_registration_number,
    latitude,
    longitude,
    extension,
    lots, // Se espera un array de lotes
  } = useLocalSearchParams();

  // Depuración: Mostrar el valor original de `lots`
  console.log("Valor de lots antes de parsear:", lots);

  // Asegurar que `lots` sea un array (puede venir como string en la navegación)
  let lotsArray = [];
  try {
    lotsArray = lots ? JSON.parse(lots as string) : [];
  } catch (error) {
    console.error("Error al parsear lots:", error);
  }

  // Depuración: Mostrar el valor después de parsear
  console.log("Valor de lotsArray después de parsear:", lotsArray);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Encabezado personalizado con botón de volver */}
          <CustomHeader title="Detalles del predio" backRoute="/(tabs)/home" />

          {/* Descripción */}
          <View style={styles.textContainer}>
            <Text style={[typography.regular.big, { color: colors.gray }]}>
              En esta sección podrás visualizar información sobre el predio{" "}
              {name}.
            </Text>

            {/* Tarjeta con la información del predio */}
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

            {/* Tarjetas de los lotes */}
            <View style={styles.lotContainer}>
              {lotsArray.length > 0 ? (
                lotsArray.map((lot: any) => (
                  <LotCard
                    key={lot.id}
                    id={lot.id}
                    extension={lot.extension}
                    cropType={lot.cropType}
                    name={""}
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
  container: {
    flex: 1,
    paddingHorizontal: 20,
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
});
