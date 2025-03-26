import React, { useState, useEffect } from "react";
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
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ValidationScreen() {
  const router = useRouter();

  // Estado para los campos del formulario
  const [documentType, setDocumentType] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [dateIssuanceDocument, setDateIssuanceDocument] = useState<Date | null>(
    null
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  // Estado para los tipos de documentos cargados desde el backend
  const [documentTypes, setDocumentTypes] = useState<
    { label: string; value: string }[]
  >([]);
  const [loadingDropdown, setLoadingDropdown] = useState(true);

  // Función para obtener los tipos de documentos desde el backend
  const fetchDocumentTypes = async () => {
    try {
      const response = await axios.get(`${API_URL}/users/type-documents`);
      if (response.data.success) {
        // Mapear los datos al formato requerido por el dropdown
        const formattedData = response.data.data.map(
          (item: { id: number; name: string }) => ({
            label: item.name,
            value: String(item.id),
          })
        );

        setDocumentTypes([
          { label: "Selecciona un tipo de documento", value: "" },
          ...formattedData,
        ]);
      }
    } catch (error) {
      console.error("Error al obtener tipos de documentos:", error);
    } finally {
      setLoadingDropdown(false);
    }
  };

  // Cargar los tipos de documentos al montar el componente
  useEffect(() => {
    fetchDocumentTypes();
  }, []);

  // Maneja la selección de fecha en el DateTimePicker
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) setDateIssuanceDocument(selectedDate);
  };

  // Maneja la validación y el envío de datos al backend
  async function handleValidation() {
    if (!documentType || documentType === "") {
      Alert.alert(
        "Error",
        "Por favor, selecciona un tipo de documento válido."
      );
      return;
    }

    if (!documentNumber.trim() || !dateIssuanceDocument) {
      Alert.alert(
        "Error",
        "Por favor, completa todos los campos obligatorios."
      );
      return;
    }

    setLoading(true);

    const formattedDate = new Date(dateIssuanceDocument);
    formattedDate.setHours(0, 0, 0, 0);
    const dateToSend = formattedDate.toISOString().split("T")[0] + "T00:00:00";

    try {
      const response = await axios.post(
        `${API_URL}/users/pre-register/validate`,
        {
          document_type_id: parseInt(documentType), // Convertimos a número el valor seleccionado
          document_number: documentNumber,
          date_issuance_document: dateToSend,
        }
      );

      if (response.data.success) {
        await AsyncStorage.setItem("preRegisterToken", response.data.token);
        Alert.alert("Éxito", "Validación exitosa.", [
          { text: "Continuar", onPress: () => router.push("/register") },
        ]);
      } else {
        Alert.alert("Error", response.data.message || "Error inesperado.");
      }
    } catch (error: any) {
      console.error("Error en la validación:", error.response?.data || error);
      Alert.alert(
        "Error",
        "Este usuario ya completó el pre-registro. Por favor, inicie sesión o restablezca su contraseña."
      );
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
                    options={documentTypes}
                    disabled={loadingDropdown} // Desactiva mientras carga
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
                      editable={false}
                    />
                  </TouchableOpacity>
                  {showDatePicker && (
                    <DateTimePicker
                      value={dateIssuanceDocument || new Date()}
                      mode="date"
                      display={Platform.OS === "ios" ? "spinner" : "default"}
                      maximumDate={new Date()}
                      onChange={handleDateChange}
                    />
                  )}
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>

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
