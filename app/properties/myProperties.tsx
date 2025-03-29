/**
 * Pantalla MyProperties
 *
 * Muestra una lista de propiedades del usuario actual, permitiendo buscarlas
 * y visualizar sus detalles en un modal.
 */

import React, { useEffect, useState } from "react";
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import { colors } from "@/config/theme";
import { typography } from "@/config/typography";
import { API_URL } from "@/services/config";
import { getUserData } from "@/services/auth";
import CustomHeader from "@/components/CustomHeader";
import SearchBar from "@/components/SearchBar";
import PropertyCard from "@/components/PropertyCard";
import PropertyDetailsModal from "@/components/PropertyDetailsModal";
import { useLotContext } from "@/context/LotContext";

/**
 * Representa una propiedad registrada por un usuario.
 */
interface Property {
  /** ID único de la propiedad */
  id: string;
  /** Nombre del predio */
  name: string;
  /** Número de folio de matrícula inmobiliaria */
  real_estate_registration_number: string;
  /** Coordenada de latitud */
  latitude: string;
  /** Coordenada de longitud */
  longitude: string;
  /** Extensión del predio en hectáreas o unidad definida */
  extension: string;
  /** ID del usuario al que pertenece la propiedad */
  user_id: number;
}

/**
 * Componente principal de la pantalla "Mis propiedades".
 *
 * Permite consultar, buscar y visualizar propiedades del usuario autenticado.
 *
 * @returns {JSX.Element} El componente renderizado de la pantalla.
 */
export default function MyProperties(): JSX.Element {
  const [properties, setProperties] = useState<Property[]>([]);
  const [searchText, setSearchText] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const { currentProperty, setProperty } = useLotContext();

  /**
   * Obtiene las propiedades asociadas al usuario actual desde la API.
   */
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const user = await getUserData();
        if (!user) throw new Error("No se pudo obtener el usuario");
        setUserId(user.id);
        const response = await axios.get(
          `${API_URL}/properties/user/${user.id}`
        );
        setProperties(response.data.data);
      } catch (error) {
        console.error("Error cargando propiedades:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  /**
   * Filtro de propiedades basado en el texto de búsqueda ingresado.
   */
  const filteredProperties = properties.filter((property) =>
    [property.name, property.real_estate_registration_number, property.id].some(
      (value) =>
        value && String(value).toLowerCase().includes(searchText.toLowerCase())
    )
  );

  /**
   * Abre el modal con los detalles de la propiedad seleccionada.
   *
   * @param property La propiedad seleccionada para mostrar en detalle.
   */
  const openModal = (property: Property): void => {
    setProperty(property);
    setModalVisible(true);
  };

  /**
   * Cierra el modal de detalles de propiedad.
   */
  const closeModal = (): void => {
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <CustomHeader title="Mis predios y lotes" backRoute="/(tabs)/home" />

          <View style={styles.textContainer}>
            <Text style={[typography.regular.big, { color: colors.gray }]}>
              En esta sección podrás visualizar la información de los predios y
              lotes vinculados a su documento.
            </Text>

            <View style={styles.searchContainer}>
              <SearchBar
                searchText={searchText}
                onSearchChange={setSearchText}
              />
            </View>

            <View style={styles.formContainer}>
              {loading ? (
                <ActivityIndicator size="large" color={colors.primary} />
              ) : filteredProperties.length > 0 ? (
                filteredProperties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    name={property.name}
                    id={property.id}
                    folio={property.real_estate_registration_number}
                    extension={property.extension}
                    latitud={property.latitude}
                    longitud={property.longitude}
                    onPress={() => openModal(property)}
                  />
                ))
              ) : (
                <Text style={typography.regular.medium}>
                  No hay propiedades registradas.
                </Text>
              )}
            </View>
          </View>
        </ScrollView>
      </View>

      {currentProperty && (
        <PropertyDetailsModal
          isVisible={modalVisible}
          onClose={closeModal}
          {...currentProperty}
        />
      )}
    </SafeAreaView>
  );
}

// Estilos de la pantalla
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
  textContainer: {
    gap: 14,
    width: "100%",
    paddingTop: 10,
    paddingHorizontal: 20,
    alignItems: "flex-start",
  },
  formContainer: {
    gap: 14,
    width: "100%",
    paddingTop: 8,
    alignItems: "stretch",
    justifyContent: "center",
  },
  searchContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
});
