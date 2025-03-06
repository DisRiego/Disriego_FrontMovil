import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { typography } from "@/config/typography";
import { colors } from "@/config/theme";
import Button from "@/components/Button";
import CustomInput from "@/components/CustomInput";
import { SafeAreaView } from "react-native-safe-area-context";

const updatePassword = () => {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const validatePassword = (password: string) => {
    return (
      password.length >= 12 &&
      /\d/.test(password) &&
      /(?=.*[a-z])(?=.*[A-Z])/.test(password)
    );
  };

  const handleSaveChanges = () => {
    if (!validatePassword(newPassword) || newPassword !== confirmPassword) {
      Alert.alert("Error", "Su contraseña no cumple con las especificaciones");
    } else {
      console.log("Contraseña actualizada correctamente");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
        style={styles.container}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
          >
            <Stack.Screen options={{ headerShown: false }} />

            <View style={styles.customHeader}>
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/profile")}
                style={styles.backButton}
              >
                <AntDesign name="left" size={22} color="black" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Actualizar contraseña</Text>
            </View>

            <Text
              style={[
                typography.medium.regular,
                { color: colors.gray, paddingBottom: 0 },
              ]}
            >
              Actualiza tu contraseña ingresando los datos correspondientes a
              continuación.
            </Text>
            <View>
              <Text style={styles.label}>Contraseña actual</Text>
              <CustomInput
                placeholder="Contraseña actual"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
              />
            </View>
            <View>
              <Text style={styles.label}>Contraseña nueva</Text>
              <CustomInput
                placeholder="Contraseña nueva"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />
            </View>
            <View>
              <Text style={styles.label}>Confirmar contraseña</Text>
              <CustomInput
                placeholder="Confirmar contraseña"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>
            <View style={styles.validationContainer}>
              <Text style={styles.validationText}>
                <AntDesign name="exclamationcircle" size={14} color="#595959" />{" "}
                Al menos 12 caracteres
              </Text>
              <Text style={styles.validationText}>
                <AntDesign name="exclamationcircle" size={14} color="#595959" />{" "}
                Al menos 1 número
              </Text>
              <Text style={styles.validationText}>
                <AntDesign name="exclamationcircle" size={14} color="#595959" />{" "}
                Mayúsculas y minúsculas
              </Text>
            </View>

            <View style={styles.buttonContainer}>
              <Button text="Guardar cambios" onPress={handleSaveChanges} />
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.base,
  },
  container: {
    flex: 1,
    backgroundColor: "#F9F9FA",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  customHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 36,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    ...typography.medium.big,
    color: colors.darkGray,
    marginRight: 40,
  },
  label: {
    marginBottom: 8,
    ...typography.medium.medium,
    color: colors.gray,
  },
  validationContainer: {
    marginLeft: 5,
  },
  validationText: {
    ...typography.medium.regular,
    marginBottom: 4,
    flexDirection: "row",
    alignItems: "center",
    color: colors.gray,
  },
  buttonContainer: {
    alignItems: "center",
    marginTop: 20,
  },
});

export default updatePassword;
