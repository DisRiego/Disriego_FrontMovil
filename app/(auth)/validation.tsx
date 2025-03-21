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
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { colors } from "@/config/theme";
import { typography } from "@/config/typography";
import Button from "@/components/Button";
import CustomInput from "@/components/CustomInput";
import Header from "@/components/Header";
import DropdownPicker from "@/components/Dropdown";
import DateTimePicker from "@react-native-community/datetimepicker";
import { API_URL } from "@/services/config";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage

export default function ValidationScreen() {
  const router = useRouter();

  const [documentType, setDocumentType] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [dateIssuanceDocument, setDateIssuanceDocument] = useState<Date | null>(
    null
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleValidation() {
    if (!documentType || !documentNumber.trim() || !dateIssuanceDocument) {
      Alert.alert(
        "Error",
        "Por favor, completa todos los campos obligatorios."
      );
      return;
    }

    setLoading(true); // Inicia el estado de carga

    const documentTypeIdMap: { [key: string]: number } = {
      "C.C": 1,
      "C.E": 2,
      "T.I": 3,
    };

    const documentTypeId = documentTypeIdMap[documentType];

    try {
      const response = await axios.post(
        `${API_URL}/users/pre-register/validate`,
        {
          document_type_id: documentTypeId,
          document_number: documentNumber,
          date_issuance_document:
            dateIssuanceDocument.toISOString().split("T")[0] + "T00:00:00",
        }
      );

      if (response.data.success) {
        const token = response.data.token; // Obtén el token
        await AsyncStorage.setItem("authToken", token); // Guarda el token en AsyncStorage

        Alert.alert("Éxito", "Validación exitosa.", [
          {
            text: "Continuar",
            onPress: () => router.push("/register"), // Redirige al registro
          },
        ]);
      } else {
        Alert.alert("Error", response.data.message || "Error inesperado.");
      }
    } catch (error: any) {
      console.error("Error en la validación:", error.response?.data || error);
      const errorMessage =
        error.response?.data?.detail ||
        error.message ||
        "Ocurrió un error inesperado.";

      if (errorMessage) {
        Alert.alert("Error", errorMessage);
      } else {
        Alert.alert("Error", "Error desconocido. Inténtalo de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  }

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

                {/* Selector de tipo de documento */}
                <View style={styles.inputContainer}>
                  <DropdownPicker
                    selectedValue={documentType}
                    onValueChange={setDocumentType}
                    options={[
                      { label: "Tipo de documento", value: "" },
                      { label: "Cédula de Ciudadanía", value: "C.C" },
                      { label: "Cédula de Extranjería", value: "C.E" },
                      { label: "Tarjeta de Identidad", value: "T.I" },
                    ]}
                  />
                </View>

                {/* Campo de número de identificación */}
                <View style={styles.inputContainer}>
                  <CustomInput
                    placeholder="No. de Identificación"
                    value={documentNumber}
                    onChangeText={setDocumentNumber}
                    keyboardType="numeric"
                  />
                </View>

                {/* Selector de fecha de expedición */}
                <View style={styles.inputContainer}>
                  <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                    <CustomInput
                      placeholder="Fecha de Expedición"
                      value={
                        dateIssuanceDocument
                          ? dateIssuanceDocument.toLocaleDateString()
                          : ""
                      }
                      editable={false} // El usuario no escribe, solo selecciona
                    />
                  </TouchableOpacity>
                  {showDatePicker && (
                    <DateTimePicker
                      value={dateIssuanceDocument || new Date()}
                      mode="date"
                      display={Platform.OS === "ios" ? "spinner" : "default"}
                      maximumDate={new Date()} // Evita fechas futuras
                      onChange={(event, selectedDate) => {
                        setShowDatePicker(false);
                        if (selectedDate) setDateIssuanceDocument(selectedDate);
                      }}
                    />
                  )}
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>

          {/* Botón de registro y enlace a iniciar sesión */}
          <View style={styles.footerContainer}>
            <Button
              text={
                loading ? (
                  <ActivityIndicator size={28} color={colors.primary} />
                ) : (
                  "Validar"
                )
              }
              onPress={handleValidation}
              disabled={loading}
            />
            <Text style={[typography.medium.regular, { color: colors.gray }]}>
              ¿Tienes una cuenta?
              <Text style={styles.link} onPress={() => router.push("/login")}>
                {" "}
                Inicia sesión aquí
              </Text>
            </Text>
          </View>
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
  inputContainer: { width: "100%" },
  footerContainer: {
    width: "100%",
    paddingTop: 24,
    paddingBottom: 32,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  link: { ...typography.bold.regular, color: colors.accent },
  flex: { flex: 1 },
});
