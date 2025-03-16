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
import { colors } from "@/config/theme";
import { typography } from "@/config/typography";

export default function DetailsLots() {
  // Obtener los parámetros pasados en la navegación
  const {
    id,
    name,
    real_estate_registration_number,
    latitude,
    longitude,
    extension,
    cropType,
    paymentInterval,
  } = useLocalSearchParams();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Encabezado personalizado con botón de volver */}
          <CustomHeader title="Detalles del Lote" backRoute="/(tabs)/home" />

          {/* Descripción */}
          <View style={styles.textContainer}>
            <Text style={[typography.regular.big, { color: colors.gray }]}>
              En esta sección podrás visualizar información detallada sobre{" "}
              {name}.
            </Text>

            {/* Tarjeta con la información del lote */}
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

            {/* Detalles adicionales del lote */}
            <View style={styles.detailsContainer}>
              <View style={styles.row}>
                <Text style={styles.label}>Tipo de Cultivo</Text>
                <Text style={styles.value}>{cropType}</Text>
              </View>

              <View style={styles.separator} />

              <View style={styles.row}>
                <Text style={styles.label}>Intervalo de Pago</Text>
                <Text style={styles.value}>{paymentInterval}</Text>
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
  propContainer: {
    marginTop: 12,
  },
  detailsContainer: {
    backgroundColor: colors.white,
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  label: {
    color: colors.darkGray,
    fontSize: 14,
  },
  value: {
    color: colors.darkGray,
    fontWeight: "600",
    fontSize: 14,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
});
