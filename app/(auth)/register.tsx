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
import { API_URL } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Pantalla de registro de usuarios
 * Permite completar el registro con email y contraseña después de la validación previa
 */
export default function RegisterScreen() {
  const router = useRouter();

  // Estados para los campos del formulario
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Hook personalizado para validación de contraseñas
  const { errors, handlePasswordChange, handleConfirmPasswordChange } =
    usePasswordValidation();

  /**
   * Valida el formato del correo electrónico
   * @param email Correo electrónico a validar
   * @returns true si el formato es válido, false en caso contrario
   */
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * Navega a la pantalla de inicio
   */
  const navigateToHome = () => {
    router.push("/home");
  };

  /**
   * Actualiza el correo electrónico y reinicia el estado de error
   * @param text Nuevo valor del correo electrónico
   */
  const handleEmailChange = (text: string) => {
    setEmail(text);
    setEmailError(false);
  };

  /**
   * Envía un correo electrónico de activación al usuario
   * @param email Correo electrónico del destinatario
   * @param activationToken Token de activación para incluir en el enlace
   */
  const sendActivationEmail = async (
    email: string,
    activationToken: string
  ) => {
    try {
      console.log("Token de activación generado:", activationToken);

      // URL de activación que se incluirá en el correo
      const activationUrl = `http://localhost:5173/signup/${activationToken}`;

      // Configuración del servicio de correo EmailJS
      const payload = {
        service_id: "service_c35ss8k", // ID del servicio EmailJS
        template_id: "template_redcikh", // ID de la plantilla EmailJS
        user_id: "hMGKOWPvqqS5l9Qsf", // Clave pública de EmailJS
        accessToken: "Qm3WiVQBa3J59N-sE7iKa", // Clave privada de EmailJS
        template_params: {
          to_name: "Usuario",
          to_email: email,
          message: `Para activar tu cuenta, haz clic en el siguiente enlace: ${activationUrl}`,
          reply_to: email,
        },
      };

      console.log("Correo a enviar:", JSON.stringify(payload, null, 2));

      // Envío del correo a través de la API de EmailJS
      const emailResponse = await fetch(
        "https://api.emailjs.com/api/v1.0/email/send",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const responseText = await emailResponse.text();
      console.log("Respuesta del servidor de correo:", responseText);

      if (!emailResponse.ok) {
        throw new Error(responseText);
      }

      console.log("Correo enviado exitosamente.");
    } catch (error) {
      console.error("Error al enviar el correo:", error);
    }
  };

  /**
   * Valida los campos y procesa el registro del usuario
   */
  const handleRegister = async () => {
    Keyboard.dismiss();

    // Validación de campos obligatorios
    if (!email || !newPassword || !confirmPassword) {
      Alert.alert(
        "Error",
        "Por favor, completa todos los campos obligatorios."
      );
      return;
    }

    // Validación del formato de correo electrónico
    if (!validateEmail(email)) {
      setEmailError(true);
      Alert.alert("Error", "El correo ingresado no es válido.");
      return;
    }

    // Validación de requisitos de contraseña
    if (errors.password || errors.confirmPassword) {
      Alert.alert(
        "Error",
        "Verifica que la contraseña cumpla con los requisitos."
      );
      return;
    }

    setLoading(true);

    try {
      // Recuperar el token de pre-registro obtenido en la validación previa
      const token = await AsyncStorage.getItem("preRegisterToken");
      if (!token) {
        Alert.alert("Error", "No se encontró el token de validación.");
        setLoading(false);
        return;
      }

      // Enviar la petición de registro al servidor
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

      if (response.data.success) {
        // Obtener y guardar el token de activación
        const activationToken = response.data.token;
        console.log("Activation Token recibido:", activationToken);
        await AsyncStorage.setItem("activationToken", activationToken);

        // Enviar correo de activación
        await sendActivationEmail(email, activationToken);
        console.log("Correo de activación enviado.");

        // Mostrar mensaje de éxito y redirigir
        Alert.alert(
          "Registro exitoso",
          "Tu cuenta ha sido creada correctamente. Se ha enviado un correo de activación.",
          [{ text: "Continuar", onPress: navigateToHome }]
        );
      } else {
        Alert.alert("Error", response.data.message || "Error inesperado.");
      }
    } catch (error) {
      // Manejo de errores de Axios y otros tipos de errores
      if (axios.isAxiosError(error)) {
        console.error(
          "Error al registrarse:",
          error.response?.data || error.message
        );
      } else {
        console.error("Error al registrarse:", error);
      }

      // Formateo del mensaje de error para mostrar al usuario
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.detail || error.message
        : "Ocurrió un error inesperado.";
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Renderiza los requisitos de contraseña
   */
  const renderPasswordRequirements = () => (
    <View style={styles.validationContainer}>
      <Text style={styles.validationText}>
        <AntDesign name="exclamationcircle" size={14} color={colors.gray} /> Al
        menos 12 caracteres
      </Text>
      <Text style={styles.validationText}>
        <AntDesign name="exclamationcircle" size={14} color={colors.gray} /> Al
        menos 1 número
      </Text>
      <Text style={styles.validationText}>
        <AntDesign name="exclamationcircle" size={14} color={colors.gray} />{" "}
        Mayúsculas y minúsculas
      </Text>
      <Text style={styles.validationText}>
        <AntDesign name="exclamationcircle" size={14} color={colors.gray} />{" "}
        Minimo un caracter especial
      </Text>
    </View>
  );

  /**
   * Renderiza el formulario de registro
   */
  const renderForm = () => (
    <View style={styles.formContainer}>
      <Text style={[typography.semibold.big, { color: colors.darkGray }]}>
        Registrarse
      </Text>
      <Text style={[typography.medium.regular, { color: colors.gray }]}>
        Por favor, proporcione la siguiente información para confirmar su
        registro en el sistema.
      </Text>

      {/* Email Input */}
      <View style={styles.inputContainer}>
        <CustomInput
          placeholder="Correo Electrónico"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={handleEmailChange}
          placeholderTextColor={emailError ? colors.error : colors.gray}
          style={[emailError && styles.errorInput]}
        />
        {emailError && <Text style={styles.errorText}>Correo inválido</Text>}
      </View>

      {/* Nueva Contraseña */}
      <View style={styles.inputContainer}>
        <CustomInput
          placeholder="Contraseña nueva"
          value={newPassword}
          onChangeText={(text) => handlePasswordChange(text, setNewPassword)}
          secureTextEntry
          style={errors.password ? styles.errorInput : undefined}
          placeholderTextColor={errors.password ? colors.error : colors.gray}
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
            handleConfirmPasswordChange(text, newPassword, setConfirmPassword)
          }
          secureTextEntry
          style={errors.confirmPassword ? styles.errorInput : undefined}
          placeholderTextColor={
            errors.confirmPassword ? colors.error : colors.gray
          }
        />
        {errors.confirmPassword && confirmPassword.length > 0 && (
          <Text style={styles.errorText}>Las contraseñas no coinciden.</Text>
        )}
      </View>

      {renderPasswordRequirements()}
    </View>
  );

  /**
   * Renderiza el botón de registro
   */
  const renderFooter = () => (
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
  );

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
              {renderForm()}
              {renderFooter()}
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
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
  flex: {
    flex: 1,
  },
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
