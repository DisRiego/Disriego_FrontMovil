import React, { useEffect, useState } from "react";
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import axios from "axios";
import { colors } from "@/config/theme";
import { typography } from "@/config/typography";
import { API_URL } from "@/services/config";
import CustomHeader from "@/components/CustomHeader";
import SearchBar from "@/components/SearchBar";
import FilterButton from "@/components/FilterButton";
import PropertyCard from "@/components/PropertyCard";
import PropertyDetailsModal from "@/components/PropertyDetailsModal";

// 📌 Definimos la interfaz para los datos de propiedad
interface Property {
  id: string;
  name: string;
  real_estate_registration_number: string;
  latitude: string;
  longitude: string;
  extension: string;
}

export default function MyProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [searchText, setSearchText] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );

  // 🚀 Cargar propiedades desde el backend
  useEffect(() => {
    axios
      .get(`${API_URL}/properties`)
      .then((response) => {
        //console.log("Datos recibidos:", response.data.data);
        setProperties(response.data.data as Property[]);
      })
      .catch((error) => console.error("Error cargando propiedades", error));
  }, []);

  // 📌 Filtrar propiedades según búsqueda por nombre, folio o ID
  const filteredProperties = properties.filter((property) =>
    [property.name, property.real_estate_registration_number, property.id].some(
      (value) =>
        value && String(value).toLowerCase().includes(searchText.toLowerCase())
    )
  );

  // 📌 Funciones para abrir/cerrar el modal
  const openModal = (property: Property) => {
    setSelectedProperty(property);
    setModalVisible(true);
  };

  const closeModal = () => {
    setSelectedProperty(null);
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
              <FilterButton onPress={() => console.log("Abrir filtros")} />
            </View>
            <View style={styles.formContainer}>
              {filteredProperties.length > 0 ? (
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
                <Text style={typography.regular.medium}>
                  No hay propiedades registradas.
                </Text>
              )}
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Modal de detalles */}
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.base,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 24,
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
  },
  searchContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
});
