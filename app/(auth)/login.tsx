import React, { useState } from "react";
import { View, Text, Alert, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { colors } from "../../config/theme";
import { typography } from "../../config/typography";
import Button from "../../components/Button";
import CustomInput from "../../components/CustomInput";
import Header from "../../components/Header";

const API_URL = "https://disriego-backend.onrender.com";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Por favor ingresa un correo y una contraseña");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Éxito", "Login exitoso");
        router.replace("/(protected)");
      } else {
        Alert.alert("Error", data.detail || "Datos inválidos");
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo conectar con el servidor");
    }

    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={[typography.semibold.big, { color: colors.darkGray }]}>
          Iniciar Sesión
        </Text>
        <Text style={[typography.medium.regular, { color: colors.gray }]}>
          Por favor, introduce tu correo y contraseña para acceder a tu cuenta
        </Text>

        <CustomInput
          placeholder="Correo Electrónico"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <CustomInput
          placeholder="Contraseña"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {/* Ajuste para centrar el texto */}
        <View style={styles.forgotPasswordContainer}>
          <Text style={[typography.medium.regular, { color: colors.gray }]}>
            Olvidaste la contraseña?
            <Text
              style={[typography.medium.regular, styles.link]}
              onPress={() => router.push("/forgotPassword")}
            >
              {" "}
              Haz clic aquí
            </Text>
          </Text>
        </View>
      </View>

      <View style={styles.footerContainer}>
        <Button
          text={loading ? "Cargando..." : "Iniciar Sesión"}
          onPress={handleLogin}
          disabled={loading}
        />

        <Text style={[typography.medium.regular, { color: colors.gray }]}>
          No tienes una cuenta?
          <Text style={styles.link} onPress={() => router.push("/register")}>
            {" "}
            Regístrate aquí
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
  forgotPasswordContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },
  footerContainer: {
    width: "100%",
    marginTop: 2,
    paddingTop: 24,
    paddingBottom: 32,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  link: {
    ...typography.bold.regular,
    color: colors.accent,
  },
});
