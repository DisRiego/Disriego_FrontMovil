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
import { API_URL } from "@env";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Pantalla de validación para el pre-registro de usuarios
 * Permite al usuario validar sus datos antes de completar el registro
 */
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

  /**
   * Mapeo de tipos de documento a sus IDs correspondientes en el backend
   */
  const documentTypeIdMap: { [key: string]: number } = {
    "C.C": 1,
    "T.I": 3,
    "C.E": 4,
  };

  /**
   * Maneja la selección de fecha en el DateTimePicker
   * @param event Evento del cambio de fecha
   * @param selectedDate Fecha seleccionada por el usuario
   */
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) setDateIssuanceDocument(selectedDate);
  };

  /**
   * Navega a la pantalla de inicio de sesión
   */
  const navigateToLogin = () => {
    router.push("/login");
  };

  /**
   * Navega a la pantalla de registro después de una validación exitosa
   */
  const navigateToRegister = () => {
    router.push("/register");
  };

  /**
   * Valida y envía los datos del formulario al servidor
   * Guarda el token recibido en AsyncStorage si la validación es exitosa
   */
  async function handleValidation() {
    // Validación de campos obligatorios
    if (!documentType || !documentNumber.trim() || !dateIssuanceDocument) {
      Alert.alert(
        "Error",
        "Por favor, completa todos los campos obligatorios."
      );
      return;
    }

    setLoading(true);

    // Obtiene el ID del tipo de documento seleccionado
    const documentTypeId = documentTypeIdMap[documentType];

    // Formatea la fecha para el envío al servidor
    const formattedDate = new Date(dateIssuanceDocument);
    formattedDate.setHours(0, 0, 0, 0); // Asegura que sea medianoche en la zona horaria local
    const dateToSend = formattedDate.toISOString().split("T")[0] + "T00:00:00";

    try {
      // Envía la solicitud de validación al servidor
      const response = await axios.post(
        `${API_URL}/users/pre-register/validate`,
        {
          document_type_id: documentTypeId,
          document_number: documentNumber,
          date_issuance_document: dateToSend,
        }
      );

      if (response.data.success) {
        // Guarda el token recibido en AsyncStorage
        const token = response.data.token;
        await AsyncStorage.setItem("preRegisterToken", token);

        // Muestra mensaje de éxito y navega a la pantalla de registro
        Alert.alert("Éxito", "Validación exitosa.", [
          {
            text: "Continuar",
            onPress: navigateToRegister,
          },
        ]);
      } else {
        Alert.alert("Error", response.data.message || "Error inesperado.");
      }
    } catch (error: any) {
      console.error("Error en la validación:", error.response?.data || error);

      // Manejo de mensajes de error
      const errorMessage =
        error.response?.data?.detail ||
        error.message ||
        "Ocurrió un error inesperado.";

      if (errorMessage) {
        Alert.alert(
          "Error",
          "Este usuario ya completó el pre-registro. Por favor, inicie sesión o restablezca su contraseña."
        );
      } else {
        Alert.alert("Error", "Error desconocido. Inténtalo de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  }

  // Opciones para el selector de tipo de documento
  const documentTypeOptions = [
    { label: "Tipo de documento", value: "" },
    { label: "Cédula de Ciudadanía", value: "C.C" },
    { label: "Cédula de Extranjería", value: "C.E" },
    { label: "Tarjeta de Identidad", value: "T.I" },
  ];

  /**
   * Renderiza el formulario de validación
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

      {/* Selector de tipo de documento */}
      <View style={styles.inputContainer}>
        <DropdownPicker
          selectedValue={documentType}
          onValueChange={setDocumentType}
          options={documentTypeOptions}
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
            onChange={handleDateChange}
          />
        )}
      </View>
    </View>
  );

  /**
   * Renderiza el pie de página con botón de validación y enlace a inicio de sesión
   */
  const renderFooter = () => (
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
        <Text style={styles.link} onPress={navigateToLogin}>
          {" "}
          Inicia sesión aquí
        </Text>
      </Text>
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
            </ScrollView>
          </KeyboardAvoidingView>

          {renderFooter()}
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
    paddingBottom: 24,
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
  footerContainer: {
    width: "100%",
    paddingTop: 24,
    paddingBottom: 32,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  link: {
    ...typography.bold.regular,
    color: colors.accent,
  },
  flex: {
    flex: 1,
  },
});
