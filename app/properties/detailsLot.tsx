/**
 * Componente DetailsLots
 * Muestra la información detallada de un lote específico
 * Incluye datos como nombre, ID, folio, extensión, tipo de cultivo, fechas, etc.
 */
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
import LotInfoCard from "@/components/LotInfoCard";
import { colors } from "@/config/theme";
import { typography } from "@/config/typography";
import { useRouter } from "expo-router";

export default function DetailsLots() {
  const router = useRouter();
  /**
   * Obtiene los parámetros pasados durante la navegación
   * Incluye información completa del lote seleccionado
   */
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
          <CustomHeader
            title="Detalles del Lote"
            backRoute={() => router.back()}
          />
          <View style={styles.innerContainer}>
            {/* Sección de descripción y tarjetas informativas */}
            <View style={styles.textContainer}>
              {/* Texto descriptivo de la sección */}
              <Text style={[typography.regular.big, { color: colors.gray }]}>
                En esta sección podrás visualizar información detallada sobre{" "}
                {name}.
              </Text>

              {/* Primera tarjeta: Información básica del lote */}
              <View style={styles.propContainer}>
                <LotCard
                  name={name as string}
                  id={id as string}
                  folio={real_estate_registration_number as string}
                  extension={extension as string}
                  latitud={latitude as string}
                  longitud={longitude as string}
                  minimal={false} // Controla la visibilidad de elementos adicionales
                  showCropType={false} // Oculta el tipo de cultivo en esta tarjeta
                />
              </View>

              {/* Segunda tarjeta: Información del cultivo y fechas */}
              <View style={styles.cropContainer}>
                <LotInfoCard
                  cropType={cropType as string}
                  paymentInterval={paymentInterval as string}
                  plantingDate={plantingDate as string}
                  estimatedHarvestDate={estimatedHarvestDate as string}
                  onEditPress={() => {
                    console.log("ID enviado a UpdateCrops:", id);

                    router.push({
                      pathname: "properties/updateCrops",
                      params: {
                        lotId: id,
                        name,
                        cropType,
                        paymentInterval,
                        plantingDate,
                        estimatedHarvestDate,
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

/**
 * Estilos para el componente DetailsLots
 * Define la apariencia y estructura de la pantalla de detalles
 */
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
  cropContainer: {
    marginTop: 12,
  },
});
