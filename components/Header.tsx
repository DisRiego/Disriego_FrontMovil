import { colors } from "@/config/theme";
import React from "react";
import { View, Image, StyleSheet, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const Header = () => {
  return (
    <SafeAreaView edges={["top"]} style={styles.safeContainer}>
      <View style={styles.container}>
        <Image
          source={require("../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    backgroundColor: colors.white, // Para que el SafeAreaView respete el color
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  container: {
    height: 90, // Ajusta según necesidad
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  logo: {
    width: "35%",
    marginLeft: 0,
  },
});

export default Header;
