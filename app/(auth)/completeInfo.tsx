import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  Alert,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  TouchableOpacity,
  Image,
} from "react-native";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { colors } from "@/config/theme";
import { typography } from "@/config/typography";
import Button from "@/components/Button";
import CustomInput from "@/components/CustomInput";
import DropdownPicker from "@/components/Dropdown";
import Header from "@/components/Header";
import {
  getCountries,
  getStates,
  getCities,
  getCountryPhoneCode,
} from "@/services/location";
import { API_URL } from "@env";
import { getUserData } from "@/services/auth";

/**
 * Pantalla para completar información del perfil de usuario
 * Se muestra después del primer inicio de sesión para recolectar datos adicionales
 */
export default function CompleteInfo() {
  const router = useRouter();

  // Estados para los campos del formulario
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);

  // Estados para los selectores de ubicación
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  // Estados para las opciones de los selectores
  const [countries, setCountries] = useState<{ name: string; iso2: string }[]>(
    []
  );
  const [states, setStates] = useState<{ name: string; iso2: string }[]>([]);
  const [cities, setCities] = useState<{ name: string; id: string }[]>([]);
  const [phoneCode, setPhoneCode] = useState("");

  // Estado para controlar la carga durante peticiones
  const [loading, setLoading] = useState(false);

  /**
   * Carga la lista de países al iniciar la pantalla
   */
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const data = await getCountries();
        setCountries(data);
      } catch (error) {
        console.error("Error al obtener países:", error);
      }
    };

    fetchCountries();
  }, []);

  /**
   * Obtiene los estados/departamentos para un país seleccionado
   * @param countryCode Código ISO del país seleccionado
   */
  const fetchStates = async (countryCode: string) => {
    // Reinicia los campos dependientes
    setSelectedState("");
    setSelectedCity("");
    setCities([]);

    try {
      // Obtiene los estados del país seleccionado
      const data = await getStates(countryCode);
      setStates(data);

      // Obtiene el código telefónico del país seleccionado
      const code = await getCountryPhoneCode(countryCode);
      setPhoneCode(code);
    } catch (error) {
      console.error("Error al obtener departamentos:", error);
    }
  };

  /**
   * Obtiene las ciudades para un estado/departamento seleccionado
   * @param countryCode Código ISO del país seleccionado
   * @param stateCode Código ISO del estado seleccionado
   */
  const fetchCities = async (countryCode: string, stateCode: string) => {
    setSelectedCity("");
    try {
      const data = await getCities(countryCode, stateCode);
      setCities(data);
    } catch (error) {
      console.error("Error al obtener ciudades:", error);
    }
  };

  /**
   * Abre el selector de imágenes para elegir una foto de perfil
   */
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Mantiene relación de aspecto cuadrada
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      const uriParts = result.assets[0].uri.split("/");
      setImageName(uriParts[uriParts.length - 1]);
    }
  };

  /**
   * Maneja el envío del formulario con los datos del usuario
   * Realiza la validación y envía los datos al backend
   */
  const handleRegister = async () => {
    // Validación de campos obligatorios
    if (
      !direccion ||
      !selectedCountry ||
      !selectedState ||
      !selectedCity ||
      !telefono
    ) {
      Alert.alert("Error", "Por favor completa todos los campos.");
      return;
    }

    setLoading(true);

    try {
      // Obtiene los datos del usuario actual
      const userData = await getUserData();
      if (!userData) {
        throw new Error("No se pudo obtener el ID del usuario.");
      }

      // Prepara los datos para enviar al servidor
      const formData = new FormData();
      formData.append("user_id", userData.id.toString());
      formData.append("country", selectedCountry);
      formData.append("department", selectedState);
      formData.append("city", selectedCity);
      formData.append("address", direccion);
      formData.append("phone", telefono);

      // Añade la imagen de perfil si se seleccionó una
      if (imageUri && imageName) {
        formData.append("profile_picture", {
          uri: imageUri,
          name: imageName,
          type: "image/jpeg",
        } as any);
      }

      console.log(
        "Enviando datos al backend:",
        Object.fromEntries(formData as any)
      );

      // Realiza la petición POST al servidor
      const response = await axios.post(
        `${API_URL}/users/first-login-register`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      console.log("Respuesta del servidor:", response.data);
      Alert.alert("Éxito", "Registro completado correctamente.");
      router.push("/home");
    } catch (error) {
      console.error("Error al registrar:", error);
      Alert.alert(
        "Error",
        "Ocurrió un problema al registrarse. Inténtalo de nuevo."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />
      <View style={styles.container}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
              {/* Formulario de datos del perfil */}
              <View style={styles.formContainer}>
                <Text
                  style={[typography.semibold.big, { color: colors.darkGray }]}
                >
                  Completa tu perfil
                </Text>
                <Text
                  style={[typography.medium.regular, { color: colors.gray }]}
                >
                  Ingresa tus datos y asegúrate de que sean correctos.
                </Text>

                {/* Campo de dirección */}
                <Text style={styles.label}>Dirección</Text>
                <CustomInput
                  placeholder="Dirección"
                  value={direccion}
                  onChangeText={setDireccion}
                />

                {/* Selector de país */}
                <Text style={styles.label}>País</Text>
                <DropdownPicker
                  selectedValue={selectedCountry}
                  onValueChange={(value) => {
                    setSelectedCountry(value);
                    fetchStates(value);
                  }}
                  options={[
                    { label: "Selecciona una opción", value: "" },
                    ...countries.map((c) => ({ label: c.name, value: c.iso2 })),
                  ]}
                />

                {/* Selector de departamento/estado */}
                <Text style={styles.label}>Departamento</Text>
                <DropdownPicker
                  selectedValue={selectedState}
                  onValueChange={(value) => {
                    setSelectedState(value);
                    fetchCities(selectedCountry, value);
                  }}
                  options={[
                    { label: "Selecciona una opción", value: "" },
                    ...states.map((s) => ({ label: s.name, value: s.iso2 })),
                  ]}
                  disabled={!selectedCountry}
                />

                {/* Selector de ciudad */}
                <Text style={styles.label}>Ciudad</Text>
                <DropdownPicker
                  selectedValue={selectedCity}
                  onValueChange={setSelectedCity}
                  options={[
                    { label: "Selecciona una opción", value: "" },
                    ...cities.map((c) => ({ label: c.name, value: c.id })),
                  ]}
                  disabled={!selectedState}
                />

                {/* Campo de teléfono */}
                <Text style={styles.label}>Teléfono</Text>
                <CustomInput
                  placeholder="Teléfono"
                  value={telefono}
                  onChangeText={(text) =>
                    setTelefono(text.replace(/[^0-9]/g, ""))
                  }
                  keyboardType="numeric"
                />

                {/* Sección de imagen de perfil */}
                <Text style={styles.subtitle}>
                  Subir foto de perfil (Opcional)
                </Text>
                {imageUri && (
                  <Image
                    source={{ uri: imageUri }}
                    style={styles.profileImage}
                  />
                )}
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={pickImage}
                >
                  <Text style={styles.uploadText}>
                    {imageName ? "Cambiar imagen" : "Subir imagen"}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Pie de página con botón de registro */}
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
        </TouchableWithoutFeedback>
      </View>
    </SafeAreaView>
  );
}

/**
 * Estilos para los componentes de la pantalla CompleteInfo
 */
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
    gap: 14,
    width: "100%",
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 8,
    alignItems: "flex-start",
  },
  footerContainer: {
    width: "100%",
    marginTop: 2,
    paddingTop: 24,
    paddingBottom: 24,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  label: {
    marginBottom: 8,
    ...typography.medium.regular,
    color: colors.gray,
  },
  subtitle: {
    ...typography.medium.regular,
    color: colors.gray,
    textAlign: "left",
  },
  imageUploadContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 15,
    paddingVertical: 8,
    paddingHorizontal: 10,
    color: colors.gray,
    backgroundColor: colors.white,
    ...typography.medium.regular,
    justifyContent: "space-between",
  },
  imagePickerButton: {
    flex: 1,
  },
  uploadButton: {
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    alignItems: "center",
    paddingHorizontal: 18,
    backgroundColor: colors.base,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginTop: 10,
  },
  uploadText: {
    ...typography.medium.regular,
    color: colors.gray,
  },
  fileName: {
    marginTop: 5,
    textAlign: "center",
    color: colors.primary,
    ...typography.medium.regular,
  },
});
