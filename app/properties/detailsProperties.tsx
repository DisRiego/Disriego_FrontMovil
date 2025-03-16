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
import { colors } from "@/config/theme";
import { typography } from "@/config/typography";
import { API_URL } from "@/services/config";

export default function DetailsProperties() {
  // Obtener los parámetros pasados en la navegación
  const {
    id,
    name,
    real_estate_registration_number,
    latitude,
    longitude,
    extension,
  } = useLocalSearchParams();

  // Estado para almacenar los lotes
  const [lotsArray, setLotsArray] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener los lotes del predio desde el backend
  const fetchLots = async () => {
    try {
      const response = await axios.get(`${API_URL}/properties/${id}/lots/`);
      setLotsArray(response.data.data || []); // Asignar los lotes al estado
    } catch (err) {
      console.error("Error al obtener los lotes:", err);
      setError("No se pudieron cargar los lotes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLots();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Encabezado con botón de volver */}
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

          {/* Sección de lotes */}
          <View style={styles.subtContainer}>
            <Text style={[typography.medium.large, { color: colors.darkGray }]}>
              Lotes asignados al predio
            </Text>

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
                {lotsArray.length > 0 ? (
                  lotsArray.map((lot) => (
                    <LotCard
                      key={lot.id}
                      id={lot.id}
                      extension={lot.extension}
                      cropType={lot.cropType}
                      name={lot.name}
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
