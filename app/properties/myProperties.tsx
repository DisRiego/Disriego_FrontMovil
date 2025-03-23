/**
 * Componente MyProperties
 * Muestra un listado de predios asociados al usuario actual
 * Permite buscar predios por nombre, folio o ID
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
import { API_URL } from "@env";
import { getUserData } from "@/services/auth";
import CustomHeader from "@/components/CustomHeader";
import SearchBar from "@/components/SearchBar";
import PropertyCard from "@/components/PropertyCard";
import PropertyDetailsModal from "@/components/PropertyDetailsModal";

/**
 * Interfaz para los datos de propiedad
 * Define la estructura de un predio en la aplicación
 */
interface Property {
  id: string;
  name: string;
  real_estate_registration_number: string;
  latitude: string;
  longitude: string;
  extension: string;
  user_id: number;
}

export default function MyProperties() {
  // Estados para manejar las propiedades y la interfaz
  const [properties, setProperties] = useState<Property[]>([]);
  const [searchText, setSearchText] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Efecto para obtener los datos del usuario y sus propiedades
   * Se ejecuta al montar el componente
   */
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);

        // Obtener datos del usuario actual
        const user = await getUserData();
        if (!user) throw new Error("No se pudo obtener el usuario");

        setUserId(user.id);
        console.log(`Obteniendo propiedades para user_id: ${user.id}`);

        // Realizar petición para obtener las propiedades del usuario
        const response = await axios.get(
          `${API_URL}/properties/user/${user.id}`
        );

        // Registro para depuración
        console.log("Datos recibidos:", response.data);

        // Guardar propiedades en el estado
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
   * Filtra las propiedades según el texto de búsqueda
   * Busca coincidencias en nombre, folio o ID
   */
  const filteredProperties = properties.filter((property) =>
    [property.name, property.real_estate_registration_number, property.id].some(
      (value) =>
        value && String(value).toLowerCase().includes(searchText.toLowerCase())
    )
  );

  /**
   * Abre el modal con los detalles de la propiedad seleccionada
   */
  const openModal = (property: Property) => {
    setSelectedProperty(property);
    setModalVisible(true);
  };

  /**
   * Cierra el modal de detalles
   */
  const closeModal = () => {
    setSelectedProperty(null);
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Encabezado de la pantalla */}
          <CustomHeader title="Mis predios y lotes" backRoute="/(tabs)/home" />

          <View style={styles.textContainer}>
            {/* Texto descriptivo de la sección */}
            <Text style={[typography.regular.big, { color: colors.gray }]}>
              En esta sección podrás visualizar la información de los predios y
              lotes vinculados a su documento.
            </Text>

            {/* Barra de búsqueda */}
            <View style={styles.searchContainer}>
              <SearchBar
                searchText={searchText}
                onSearchChange={setSearchText}
              />
              {/* <FilterButton onPress={() => console.log("Abrir filtros")} /> */}
            </View>

            {/* Listado de propiedades */}
            <View style={styles.formContainer}>
              {loading ? (
                // Indicador de carga mientras se obtienen los datos
                <ActivityIndicator size="large" color={colors.primary} />
              ) : filteredProperties.length > 0 ? (
                // Mapeo de propiedades si existen resultados
                filteredProperties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    name={property.name}
                    id={property.id}
                    folio={property.real_estate_registration_number}
                    extension={property.extension}
                    onPress={() => openModal(property)}
                  />
                ))
              ) : (
                // Mensaje cuando no hay propiedades
                <Text style={typography.regular.medium}>
                  No hay propiedades registradas.
                </Text>
              )}
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Modal de detalles de la propiedad */}
      {selectedProperty && (
        <PropertyDetailsModal
          isVisible={modalVisible}
          onClose={closeModal}
          {...selectedProperty}
        />
      )}
    </SafeAreaView>
  );
}

/**
 * Estilos para el componente MyProperties
 */
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
