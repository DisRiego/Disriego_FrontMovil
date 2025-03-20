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
import LotCard from "@/components/LotCard";
import LotInfoCard from "@/components/LotInfoCard"; // Nuevo componente
import { colors } from "@/config/theme";
import { typography } from "@/config/typography";

export default function DetailsLots() {
  // Obtener los parámetros pasados en la navegación
  const {
    id,
    name,
    longitude,
    latitude,
    real_estate_registration_number,
    extension,
    cropType,
    paymentInterval,
    plantingDate,
    estimatedHarvestDate,
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

            {/* Primera tarjeta: Nombre, ID, Folio, Extensión */}
            <View style={styles.propContainer}>
              <LotCard
                name={name as string}
                id={id as string}
                folio={real_estate_registration_number as string}
                extension={extension as string}
                latitud={latitude as string}
                longitud={longitude as string}
                minimal={false} // Esto controla otras partes visibles
                showCropType={false} // Nueva prop para ocultar cropType
              />
            </View>

            {/* Segunda tarjeta: Intervalo pago, Tipo cultivo, Fechas */}
            <View style={styles.cropContainer}>
              <LotInfoCard
                cropType={cropType as string}
                paymentInterval={paymentInterval as string}
                plantingDate={plantingDate as string}
                estimatedHarvestDate={estimatedHarvestDate as string}
                onEditPress={() => console.log("Abrir formulario de edición")}
              />
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
  cropContainer: {
    marginTop: 12,
  },
});
