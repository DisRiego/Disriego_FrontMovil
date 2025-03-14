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
import emailjs from "@emailjs/react-native";
import { colors } from "@/config/theme";
import { typography } from "@/config/typography";
import Button from "@/components/Button";
import CustomInput from "@/components/CustomInput";
import Header from "@/components/Header";
import { API_FRONT, API_URL } from "@/services/config";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const router = useRouter();

  const handleSendEmail = async () => {
    if (!email) {
      Alert.alert("Error", "Por favor, ingresa tu correo electrónico.");
      return;
    }

    try {
      // Primero, obtener el token de recuperación desde el backend
      const response = await axios.post(
        `${API_URL}/auth/request-reset-password`,
        {
          email,
        }
      );

      const resetToken = response.data.token; // Extraer el token desde la respuesta del backend

      // Enviar correo a través de EmailJS
      const payload = {
        service_id: "service_c35ss8k", // Reemplaza con tu Service ID
        template_id: "template_wbz1eil", // Reemplaza con tu Template ID
        user_id: "hMGKOWPvqqS5l9Qsf", // Reemplaza con tu Public Key
        accessToken: "Qm3WiVQBa3J59N-sE7iKa", // Aquí reemplazas con tu Private Key
        template_params: {
          to_name: "Usuario",
          to_email: email,
          message: `${API_FRONT}/login/resetpassword/${resetToken}`,

          reply_to: email,
        },
      };

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
          <View style={styles.formContainer}>
            <Text style={[typography.semibold.big, { color: colors.darkGray }]}>
              ¿Olvidaste tu contraseña?
            </Text>
            <Text style={[typography.medium.regular, { color: colors.gray }]}>
              No te preocupes, ingresa tu correo para recibir un enlace de
              recuperación.
            </Text>

            <CustomInput
              placeholder="Ingresa tu correo electrónico"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            <Button text="Enviar enlace" onPress={handleSendEmail} />
          </View>

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
  link: { ...typography.bold.regular, color: colors.accent },
});
