import {
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { Component } from "react";
import { colors } from "@/config/theme";
import { typography } from "@/config/typography";
import CustomHeader from "@/components/CustomHeader";
import SearchBar from "@/components/SearchBar";
import FilterButton from "@/components/FilterButton";
import PropertyCard from "@/components/PropertyCard";
import PropertyDetailsModal from "@/components/PropertyDetailsModal";

export class MyProperties extends Component {
  state = {
    searchText: "",
    modalVisible: false,
    selectedProperty: null,
  };

  openModal = (property: {
    name: string;
    id: string;
    folio: string;
    latitud: string;
    longitud: string;
    extension: string;
  }) => {
    this.setState({ modalVisible: true, selectedProperty: property });
  };

  closeModal = () => {
    this.setState({ modalVisible: false, selectedProperty: null });
  };

  render() {
    const { searchText, modalVisible, selectedProperty } = this.state;

    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <CustomHeader
              title="Mis predios y lotes"
              backRoute="/(tabs)/home"
            />
            <View style={styles.textContainer}>
              <Text style={[typography.regular.big, { color: colors.gray }]}>
                En esta sección podrás visualizar la información de los predios
                y lotes vinculados a su documento.
              </Text>
              <View style={styles.searchContainer}>
                <SearchBar
                  searchText={searchText}
                  onSearchChange={(text) => this.setState({ searchText: text })}
                />
                <FilterButton onPress={() => console.log("Abrir filtros")} />
              </View>
              <View style={styles.formContainer}>
                <PropertyCard
                  name="Nombre del Predio"
                  id="123"
                  folio="Matrícula Inmobiliaria"
                  extension="200 m²"
                  onPress={() =>
                    this.openModal({
                      name: "Nombre del Predio",
                      id: "123",
                      folio: "Matrícula Inmobiliaria",
                      latitud: "4.123456",
                      longitud: "-74.123456",
                      extension: "200 m²",
                    })
                  }
                />
              </View>
            </View>
          </ScrollView>
        </View>

        {/* Renderiza el modal cuando hay un predio seleccionado */}
        {selectedProperty && (
          <PropertyDetailsModal
            name={""}
            id={""}
            folio={""}
            latitud={""}
            longitud={""}
            extension={""}
            isVisible={modalVisible}
            onClose={this.closeModal}
            {...(selectedProperty && typeof selectedProperty === "object"
              ? selectedProperty
              : {})}
          />
        )}
      </SafeAreaView>
    );
  }
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
  },
  textContainer: {
    gap: 14,
    width: "100%",
    paddingTop: 8,
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
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
});

export default MyProperties;
