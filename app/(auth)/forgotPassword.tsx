import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import CustomInput from "../../components/CustomInput";
import Button from "../../components/Button";
import Header from "../../components/Header";
import { useRouter } from "expo-router";
import { colors } from "../../config/theme";
import { typography } from "../../config/typography";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Header />
      <View style={{ height: 20 }} />
      <Text style={styles.title}>¿Olvidaste tu contraseña?</Text>
      <Text style={styles.subtitle}>
        No te preocupes, Ingresa tu correo para recibir un enlace de recuperación.
      </Text>

      <CustomInput
        placeholder="Ingresa tu correo electrónico"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <Button text="Enviar enlace" onPress={() => console.log("Enviar email")} />

      {/* ⬇️ Ubicar en la parte inferior */}
      <View style={styles.footerContainer}>
        <Text style={[typography.medium.regular, { color: colors.gray }]}>
        Volver al inicio de sesión?{" "}
        <Text style={styles.link} onPress={() => router.replace("/login")}>
        Haz clic aquí
        </Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 40,
    backgroundColor: colors.base,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    alignSelf: "flex-start",
    marginBottom: 10,
    marginLeft: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "left",
    marginBottom: 20,
  },
  footerContainer: {
    position: "absolute",
    bottom: 20,
    width: "100%",
    alignItems: "center",
  },
  link: {
    ...typography.bold.regular,
    color: colors.accent,
  },
});
