import {
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { Component } from "react";
import { colors } from "@/config/theme";
import { AntDesign } from "@expo/vector-icons";
import { router } from "expo-router";
import { typography } from "@/config/typography";
import CustomHeader from "@/components/CustomHeader";
import SearchBar from "@/components/SearchBar";
import FilterButton from "@/components/FilterButton";
import PropertyCard from "@/components/PropertyCard";

export class MyProperties extends Component {
  state = {
    searchText: "",
  };

  render() {
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
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <SearchBar
                  searchText={this.state.searchText}
                  onSearchChange={(text) => this.setState({ searchText: text })}
                />
                <FilterButton onPress={() => console.log("Abrir filtros")} />
              </View>
              <View style={styles.formContainer}>
                <PropertyCard
                  name={"Nombre del Predio"}
                  id={"123"}
                  folio={"Matrícula Inmobiliaria"}
                  extension={"200 m²"}
                  onPress={function (): void {
                    throw new Error("Function not implemented.");
                  }}
                />
              </View>
            </View>
          </ScrollView>
        </View>
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
