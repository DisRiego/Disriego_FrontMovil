import React, { useState } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
} from "react-native";
import axios from "axios";
import { colors } from "@/config/theme";
import { typography } from "@/config/typography";
import Button from "@/components/Button";
import CustomInput from "@/components/CustomInput";
import Header from "@/components/Header";
import { API_FRONT, API_URL } from "@/services/config";

/**
 * Pantalla de recuperación de contraseña
 * Permite al usuario solicitar un correo con un enlace para restablecer su contraseña
 */
export default function ForgotPasswordScreen() {
  // Estado para el correo electrónico
  const [email, setEmail] = useState("");
  const router = useRouter();

  /**
   * Maneja el proceso de solicitud de restablecimiento de contraseña
   * Obtiene un token del backend y envía un correo electrónico con un enlace de recuperación
   */
  const handleSendEmail = async () => {
    // Expresión regular para validar un correo electrónico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Validación del campo de correo
    if (!email) {
      Alert.alert("Error", "Por favor, ingresa tu correo electrónico.");
      return;
    }

    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Por favor, ingresa un correo válido.");
      return;
    }

    try {
      // Paso 1: Obtener el token de recuperación desde el backend
      const response = await axios.post(
        `${API_URL}/auth/request-reset-password`,
        { email }
      );

      const resetToken = response.data.token;

      // Paso 2: Preparar datos para el servicio de correo (EmailJS)
      const payload = {
        service_id: "service_c35ss8k",
        template_id: "template_wbz1eil",
        user_id: "hMGKOWPvqqS5l9Qsf",
        accessToken: "Qm3WiVQBa3J59N-sE7iKa",
        template_params: {
          to_name: "Usuario",
          to_email: email,
          message: `${API_FRONT}/login/resetpassword/${resetToken}`,
          reply_to: email,
        },
      };

      // Paso 3: Enviar correo a través de la API de EmailJS
      const emailResponse = await fetch(
        "https://api.emailjs.com/api/v1.0/email/send",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (emailResponse.ok) {
        Alert.alert(
          "Éxito",
          "Se ha enviado un enlace de recuperación a tu correo."
        );
      } else {
        throw new Error(await emailResponse.text());
      }
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", "No se pudo enviar el correo. Intenta de nuevo.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Contenedor del formulario */}
          <View style={styles.formContainer}>
            <Text style={[typography.semibold.big, { color: colors.darkGray }]}>
              ¿Olvidaste tu contraseña?
            </Text>
            <Text style={[typography.medium.regular, { color: colors.gray }]}>
              No te preocupes, ingresa tu correo para recibir un enlace de
              recuperación.
            </Text>

            {/* Campo de entrada para el correo */}
            <CustomInput
              placeholder="Ingresa tu correo electrónico"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            {/* Botón para enviar solicitud */}
            <Button text="Enviar enlace" onPress={handleSendEmail} />
          </View>

          {/* Pie de página con enlace para volver al login */}
          <View style={styles.footerContainer}>
            <Text style={[typography.medium.regular, { color: colors.gray }]}>
              ¿Volver al inicio de sesión?{" "}
              <Text
                style={styles.link}
                onPress={() => router.replace("/login")}
              >
                Haz clic aquí
              </Text>
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

/**
 * Estilos para los componentes de la pantalla de recuperación de contraseña
 */
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.base,
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
