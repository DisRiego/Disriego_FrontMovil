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
import { colors } from "@/config/theme";
import { typography } from "@/config/typography";
import CustomHeader from "@/components/CustomHeader";
import SearchBar from "@/components/SearchBar";
import PropertyCard from "@/components/PropertyCard";
import PropertyDetailsModal from "@/components/PropertyDetailsModal";
import { useLotContext } from "@/context/LotContext";
import type { Property } from "@/context/LotContext";

export default function MyProperties(): JSX.Element {
  const [properties, setProperties] = useState<Property[]>([]);
  const [searchText, setSearchText] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const { currentProperty, setProperty, fetchPropertiesByUser } =
    useLotContext();

  useEffect(() => {
    const loadProperties = async () => {
      try {
        setLoading(true);
        const data = await fetchPropertiesByUser();
        setProperties(data);
      } catch (error) {
        console.error("Error cargando propiedades:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProperties();
  }, []);

  const filteredProperties = properties.filter((property) =>
    [property.name, property.real_estate_registration_number, property.id].some(
      (value) =>
        value && String(value).toLowerCase().includes(searchText.toLowerCase())
    )
  );

  const openModal = (property: Property): void => {
    setProperty(property);
    setModalVisible(true);
  };

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
