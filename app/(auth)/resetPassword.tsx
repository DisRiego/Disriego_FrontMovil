import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { colors } from "../../config/theme";
import { typography } from "../../config/typography";
import Button from "../../components/Button";
import CustomInput from "../../components/CustomInput";
import Header from "../../components/Header";
import { MaterialIcons } from "@expo/vector-icons";

export default function ResetPasswordScreen() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const router = useRouter(); // Instanciar el router

  const isPasswordLongEnough = newPassword.length >= 12;
  const hasNumber = /\d/.test(newPassword);
  const hasUppercase = /[A-Z]/.test(newPassword);

  const passwordsMatch = newPassword === confirmPassword; // Verificación de coincidencia de contraseñas
  const isFormValid = passwordsMatch && isPasswordLongEnough && hasNumber && hasUppercase;

  const handleConfirm = () => {
    if (isFormValid) {
      // Redirigir a la pantalla de éxito si las contraseñas son válidas
      router.push("/updatePasswordSuccess");
    } else {
      // Redirigir a la pantalla de error si las contraseñas no coinciden o no cumplen los requisitos
      router.push("/updatePasswordError");
    }
  };

  return (
    
      <View style={styles.container}>
        <Header />
        <View style={styles.formContainer}>
          <Text style={[typography.semibold.big, { color: colors.darkGray }]}>Restablecer contraseña</Text>
          <Text style={[typography.medium.regular, { color: "#666" }]}>
            Ingresa tu nueva contraseña y confirmala para completar el proceso
          </Text>

          <View style={styles.inputContainer}>
            <CustomInput
              placeholder="Nueva Contraseña"
              secureTextEntry={!showPassword}
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <MaterialIcons 
                name={showPassword ? "visibility-off" : "visibility"} 
                size={24} 
                color={colors.gray} 
              />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <CustomInput
              placeholder="Confirmar Contraseña"
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeIcon}
            >
              <MaterialIcons 
                name={showConfirmPassword ? "visibility-off" : "visibility"} 
                size={24} 
                color={colors.gray} 
              />
            </TouchableOpacity>
          </View>

          <View style={styles.passwordRequirements}>
            <View style={styles.requirementRow}>
              <MaterialIcons 
                name={isPasswordLongEnough ? "check-circle" : "error"} 
                size={20} 
                color={isPasswordLongEnough ? colors.secondary : colors.error} 
              />
              <Text style={[typography.medium.regular, styles.requirementText, isPasswordLongEnough && styles.valid]}>
                Al menos 12 caracteres
              </Text>
            </View>

            <View style={styles.requirementRow}>
              <MaterialIcons 
                name={hasNumber ? "check-circle" : "error"} 
                size={20} 
                color={hasNumber ? colors.secondary : colors.error} 
              />
              <Text style={[typography.medium.regular, styles.requirementText, hasNumber && styles.valid]}>
                Al menos 1 número
              </Text>
            </View>

            <View style={styles.requirementRow}>
              <MaterialIcons 
                name={hasUppercase ? "check-circle" : "error"} 
                size={20} 
                color={hasUppercase ? colors.secondary : colors.error} 
              />
              <Text style={[typography.medium.regular, styles.requirementText, hasUppercase && styles.valid]}>
                Mayúsculas y minúsculas
              </Text>
            </View>
          </View>

          {/* Mensaje de error cuando las contraseñas no coinciden */}
          {!passwordsMatch && (
            <Text style={styles.errorText}>Las contraseñas no coinciden</Text>
          )}


        </View>

        {/* Footer fijo */}
        <View style={styles.footerContainer}>
        <Button text="Confirmar" onPress={handleConfirm} />
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
  inputContainer: {
    position: "relative",
    width: "100%",
    marginBottom: 20,
  },
  passwordRequirements: {
    marginTop: 10,
    marginBottom: 20,
    alignSelf: "flex-start",
    marginLeft: 10,
  },
  requirementRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  requirementText: {
    fontSize: 12,
    color: colors.gray,
    marginLeft: 8,
  },
  valid: {
    color: colors.secondary, // Cambia el color a verde cuando el requisito sea válido
  },
  errorText: {
    fontSize: 14,
    color: colors.error, // Mensaje en rojo si las contraseñas no coinciden
    marginTop: 10,
  },
  footerContainer: {
    width: "100%",
    marginTop: 20,
    paddingTop: 24,
    paddingBottom: 32,
    paddingHorizontal: 20,
    alignItems: "center",
    position: "absolute", // Asegura que el footer quede fijo en la parte inferior
    bottom: 20,
  },
  link: {
    ...typography.bold.regular,
    color: colors.accent,
  },
  eyeIcon: {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: [{ translateY: -12 }],
  },
});
