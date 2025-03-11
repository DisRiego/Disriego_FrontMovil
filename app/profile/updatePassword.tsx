import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { router, useRouter } from "expo-router";
import { typography } from "@/config/typography";
import { colors } from "@/config/theme";
import Button from "@/components/Button";
import CustomInput from "@/components/CustomInput";
import { SafeAreaView } from "react-native-safe-area-context";
import { usePasswordValidation } from "@/hooks/passwordValidation";

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

  const handleSaveChanges = () => {
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

    console.log("Contraseña actualizada correctamente");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.customHeader}>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/profile")}
              style={styles.backButton}
            >
              <AntDesign name="left" size={22} color={colors.gray} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Actualizar contraseña</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={[typography.medium.medium, { color: colors.gray }]}>
              Ingresa los datos requeridos a continuación para actualizar tu
              contraseña
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
                style={errors.confirmPassword ? styles.errorInput : undefined}
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
            />
          </View>
        </ScrollView>
      </View>
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
  customHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: colors.base,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    ...typography.medium.big,
    color: colors.darkGray,
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
    paddingBottom: 32,
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
