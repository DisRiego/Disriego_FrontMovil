import React from "react";
import { View, Text, Image, StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

const Header = () => {
  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width,
    height: 120,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: "white",
    paddingHorizontal: 10,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginHorizontal: 0,
    zIndex: 2,
    position: "relative",
  },
  logo: {
    width: "40%",
    position: "absolute",
    bottom: 30,
    left: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  greenText: {
    color: "#4CAF50",
  },
});

export default Header;
