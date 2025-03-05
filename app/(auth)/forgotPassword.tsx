import React, { useState } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { colors } from "@/config/theme";
import { typography } from "@/config/typography";
import Button from "@/components/Button";
import CustomInput from "@/components/CustomInput";
import Header from "@/components/Header";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />
      <View style={styles.container}>
        <View style={styles.formContainer}>
          <Text style={[typography.semibold.big, { color: colors.darkGray }]}>
            ¿Olvidaste tu contraseña?
          </Text>
          <Text style={[typography.medium.regular, { color: colors.gray }]}>
            No te preocupes, Ingresa tu correo para recibir un enlace de
            recuperación.
          </Text>

          <CustomInput
            placeholder="Ingresa tu correo electrónico"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <Button
            text="Enviar enlace"
            onPress={() => console.log("Enviar email")}
          />
        </View>

        {/* Ubicar en la parte inferior */}

        <View style={styles.footerContainer}>
          <Text style={[typography.medium.regular, { color: colors.gray }]}>
            Volver al inicio de sesión?{" "}
            <Text style={styles.link} onPress={() => router.replace("/login")}>
              Haz clic aquí
            </Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.base,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: colors.base,
  },
  formContainer: {
    flex: 1,
    gap: 14,
    width: "100%",
    paddingTop: 24,
    paddingHorizontal: 20,
    alignItems: "flex-start",
    justifyContent: "flex-start",
    backgroundColor: colors.base,
  },
  footerContainer: {
    position: "absolute",
    bottom: 32,
    width: "100%",
    alignItems: "center",
  },
  link: {
    ...typography.bold.regular,
    color: colors.accent,
  },
});
