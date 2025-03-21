import React, { useState } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Alert,
} from "react-native";
import { colors } from "@/config/theme";
import { typography } from "@/config/typography";
import Button from "@/components/Button";
import CustomInput from "@/components/CustomInput";
import Header from "@/components/Header";
import { usePasswordValidation } from "@/hooks/passwordValidation";
import { AntDesign } from "@expo/vector-icons";
import axios from "axios";
import { API_URL } from "@/services/config";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { errors, handlePasswordChange, handleConfirmPasswordChange } =
    usePasswordValidation();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleRegister = async () => {
    Keyboard.dismiss();

    if (!email || !newPassword || !confirmPassword) {
      Alert.alert(
        "Error",
        "Por favor, completa todos los campos obligatorios."
      );
      return;
    }

    if (!validateEmail(email)) {
      setEmailError(true);
      Alert.alert("Error", "El correo ingresado no es válido.");
      return;
    }

    if (errors.password || errors.confirmPassword) {
      Alert.alert(
        "Error",
        "Verifica que la contraseña cumpla con los requisitos."
      );
      return;
    }

    setLoading(true);

    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("Error", "No se encontró el token de validación.");
        setLoading(false);
        return;
      }

      const response = await axios.post(
        `${API_URL}/users/pre-register/complete`,
        {
          token,
          email,
          password: newPassword,
          password_confirmation: confirmPassword,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (response.status === 200) {
        const activationToken = response.data.activation_token;
        if (activationToken) {
          await sendActivationEmail(email, activationToken);
        }

        Alert.alert(
          "Registro exitoso",
          "Tu cuenta ha sido creada correctamente. Se ha enviado un correo de activación.",
          [{ text: "OK", onPress: () => router.push("/home") }]
        );
      } else {
        Alert.alert("Error", "Ocurrió un problema al registrar la cuenta.");
      }
    } catch (error) {
      console.error("Error en la solicitud:", error);
      Alert.alert("Error", "No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  // Enviar el correo de activación
  const sendActivationEmail = async (
    email: string,
    activationToken: string
  ) => {
    try {
      const activationUrl = `https://tu-frontend.com/activate-account/${activationToken}`;

      const payload = {
        service_id: "service_c35ss8k",
        template_id: "template_wbz1eil",
        user_id: "hMGKOWPvqqS5l9Qsf",
        accessToken: "Qm3WiVQBa3J59N-sE7iKa",
        template_params: {
          to_name: "Usuario",
          to_email: email,
          message: `Para activar tu cuenta, haz clic en el siguiente enlace: ${activationUrl}`,
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

      if (!emailResponse.ok) {
        throw new Error(await emailResponse.text());
      }
    } catch (error) {
      console.error("Error al enviar el correo:", error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.flex}
          >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
              <View style={styles.formContainer}>
                <Text
                  style={[typography.semibold.big, { color: colors.darkGray }]}
                >
                  Registrarse
                </Text>
                <Text
                  style={[typography.medium.regular, { color: colors.gray }]}
                >
                  Por favor, proporcione la siguiente información para confirmar
                  su registro en el sistema.
                </Text>

                {/* Email Input */}
                <View style={styles.inputContainer}>
                  <CustomInput
                    placeholder="Correo Electrónico"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      setEmailError(false);
                    }}
                    placeholderTextColor={
                      emailError ? colors.error : colors.gray
                    }
                    style={[emailError && styles.errorInput]}
                  />
                  {emailError && (
                    <Text style={styles.errorText}>Correo inválido</Text>
                  )}
                </View>

                {/* Nueva Contraseña */}
                <View style={styles.inputContainer}>
                  <CustomInput
                    placeholder="Contraseña nueva"
                    value={newPassword}
                    onChangeText={(text) =>
                      handlePasswordChange(text, setNewPassword)
                    }
                    secureTextEntry
                    style={errors.password ? styles.errorInput : undefined}
                    placeholderTextColor={
                      errors.password ? colors.error : colors.gray
                    }
                  />
                  {errors.password && newPassword.length > 0 && (
                    <Text style={styles.errorText}>
                      La contraseña no cumple con los requisitos.
                    </Text>
                  )}
                </View>

                {/* Confirmar Contraseña */}
                <View style={styles.inputContainer}>
                  <CustomInput
                    placeholder="Confirmar contraseña"
                    value={confirmPassword}
                    onChangeText={(text) =>
                      handleConfirmPasswordChange(
                        text,
                        newPassword,
                        setConfirmPassword
                      )
                    }
                    secureTextEntry
                    style={
                      errors.confirmPassword ? styles.errorInput : undefined
                    }
                    placeholderTextColor={
                      errors.confirmPassword ? colors.error : colors.gray
                    }
                  />
                  {errors.confirmPassword && confirmPassword.length > 0 && (
                    <Text style={styles.errorText}>
                      Las contraseñas no coinciden.
                    </Text>
                  )}
                </View>

                <View style={styles.validationContainer}>
                  <Text style={styles.validationText}>
                    <AntDesign
                      name="exclamationcircle"
                      size={14}
                      color={colors.gray}
                    />{" "}
                    Al menos 12 caracteres
                  </Text>
                  <Text style={styles.validationText}>
                    <AntDesign
                      name="exclamationcircle"
                      size={14}
                      color={colors.gray}
                    />{" "}
                    Al menos 1 número
                  </Text>
                  <Text style={styles.validationText}>
                    <AntDesign
                      name="exclamationcircle"
                      size={14}
                      color={colors.gray}
                    />{" "}
                    Mayúsculas y minúsculas
                  </Text>
                  <Text style={styles.validationText}>
                    <AntDesign
                      name="exclamationcircle"
                      size={14}
                      color={colors.gray}
                    />{" "}
                    Minimo un caracter especial
                  </Text>
                </View>
              </View>
              <View style={styles.footerContainer}>
                <Button
                  text={
                    loading ? (
                      <ActivityIndicator size={28} color={colors.primary} />
                    ) : (
                      "Registrarse"
                    )
                  }
                  onPress={handleRegister}
                  disabled={loading}
                />
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.base },
  scrollContainer: { flexGrow: 1, paddingBottom: 24 },
  container: {
    flex: 1,
    justifyContent: "flex-start",
    backgroundColor: colors.base,
  },
  formContainer: {
    flex: 1,
    gap: 14,
    width: "100%",
    paddingTop: 24,
    paddingHorizontal: 20,
  },
  inputContainer: {
    width: "100%",
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    marginTop: 4,
  },
  errorInput: {
    borderColor: colors.error,
  },
  flex: { flex: 1 },
  validationContainer: {
    marginLeft: 4,
    gap: 4,
  },
  validationText: {
    ...typography.medium.regular,
    marginBottom: 4,
    color: colors.gray,
  },
  footerContainer: {
    width: "100%",
    marginTop: 2,
    paddingTop: 24,
    paddingBottom: 24,
    paddingHorizontal: 20,
    alignItems: "center",
  },
});
