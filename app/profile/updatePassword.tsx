import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";
import axios from "axios";
import { AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { typography } from "@/config/typography";
import { colors } from "@/config/theme";
import Button from "@/components/Button";
import CustomInput from "@/components/CustomInput";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { usePasswordValidation } from "@/hooks/passwordValidation";
import { API_URL } from "@/services/config";
import { getUserData } from "@/services/auth";
import CustomHeader from "@/components/CustomHeader";

const UpdatePassword = () => {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    errors,
    validatePassword,
    handlePasswordChange,
    handleConfirmPasswordChange,
  } = usePasswordValidation();

  const handleSaveChanges = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert("Error", "Todos los campos son obligatorios.");
      return;
    }

    if (!validatePassword(newPassword)) {
      Alert.alert("Error", "La nueva contraseña no cumple con los requisitos.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    try {
      const user = await getUserData(); // Obtenemos el usuario desde el token
      if (!user) {
        Alert.alert("Error", "No se pudo obtener la información del usuario.");
        setLoading(false);
        return;
      }

      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "No se encontró un token de autenticación.");
        setLoading(false);
        return;
      }

      await axios.post(
        `${API_URL}/users/${user.id}/change-password`, // Usamos user.id en la URL
        {
          old_password: currentPassword,
          new_password: newPassword,
          confirm_password: confirmPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      Alert.alert("Éxito", "Contraseña actualizada correctamente.");
      router.push("/(tabs)/profile");
    } catch (error) {
      Alert.alert(
        "Error",
        (error as any).response?.data?.message ||
          "No se pudo actualizar la contraseña."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
              <CustomHeader
                title="Actualizar contraseña"
                backRoute="/(tabs)/profile"
              />

              <View style={styles.formContainer}>
                <Text style={[typography.regular.big, { color: colors.gray }]}>
                  Ingresa los datos requeridos a continuación para actualizar tu
                  contraseña.
                </Text>

                <View style={{ width: "100%" }}>
                  <Text style={styles.label}>Contraseña actual</Text>
                  <CustomInput
                    placeholder="Contraseña actual"
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    secureTextEntry
                  />
                </View>

                <View style={{ width: "100%" }}>
                  <Text style={styles.label}>Contraseña nueva</Text>
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

                <View style={{ width: "100%" }}>
                  <Text style={styles.label}>Confirmar contraseña</Text>
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
                      "Guardar cambios"
                    )
                  }
                  onPress={handleSaveChanges}
                  disabled={loading}
                />
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.base,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: colors.base,
  },
  formContainer: {
    flex: 1,
    gap: 16,
    width: "100%",
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: "flex-start",
    justifyContent: "flex-start",
    backgroundColor: colors.base,
  },
  label: {
    marginBottom: 8,
    ...typography.medium.regular,
    color: colors.gray,
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
    paddingBottom: 8,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  errorInput: {
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    ...typography.medium.regular,
  },
});

export default UpdatePassword;
