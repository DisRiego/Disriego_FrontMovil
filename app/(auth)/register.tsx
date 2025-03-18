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

  const handleRegister = () => {
    Keyboard.dismiss();

    // Verificar si hay campos vacíos
    if (!email || !newPassword || !confirmPassword) {
      Alert.alert(
        "Error",
        "Por favor, completa todos los campos obligatorios."
      );
      return;
    }

    // Validar el email
    if (!validateEmail(email)) {
      setEmailError(true);
      Alert.alert("Error", "El correo ingresado no es válido.");
      return;
    }

    // Validar errores de contraseña
    if (errors.password || errors.confirmPassword) {
      Alert.alert(
        "Error",
        "Verifica que la contraseña cumpla con los requisitos."
      );
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        "Registro exitoso",
        "Tu cuenta ha sido creada correctamente.",
        [{ text: "OK", onPress: () => router.push("/home") }]
      );
    }, 2000);
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
