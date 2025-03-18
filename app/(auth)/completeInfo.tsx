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
} from "react-native";
import { colors } from "@/config/theme";
import { typography } from "@/config/typography";
import * as ImagePicker from "expo-image-picker";
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

export default function CompleteInfo() {
  const router = useRouter();
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");

  const [countries, setCountries] = useState<{ name: string; iso2: string }[]>(
    []
  );
  const [states, setStates] = useState<{ name: string; iso2: string }[]>([]);
  const [cities, setCities] = useState<{ name: string; id: string }[]>([]);
  const [phoneCode, setPhoneCode] = useState("");

  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageName, setImageName] = useState<string | null>(null);

  useEffect(() => {
    const fetchCountries = async () => {
      const data = await getCountries();
      setCountries(data);
    };

    fetchCountries();
  }, []);

  const fetchStates = async (countryCode: string) => {
    setSelectedState("");
    setSelectedCity("");
    setCities([]);

    const data = await getStates(countryCode);
    setStates(data);

    const code = await getCountryPhoneCode(countryCode);
    setPhoneCode(code);
  };

  const fetchCities = async (countryCode: string, stateCode: string) => {
    setSelectedCity("");
    const data = await getCities(countryCode, stateCode);
    setCities(data);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const uriParts = result.assets[0].uri.split("/");
      setImageName(uriParts[uriParts.length - 1]);
    }
  };

  const handleRegister = async () => {
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
      const payload = {
        direccion,
        pais: selectedCountry,
        departamento: selectedState,
        ciudad: selectedCity,
        telefono: `+${phoneCode}${telefono}`,
      };

      console.log("Datos a enviar:", payload);

      // Aquí puedes hacer la solicitud al backend con Axios:
      // await axios.post("URL_DEL_BACKEND", payload);

      setTimeout(() => {
        setLoading(false);
        Alert.alert("Éxito", "Registro completado correctamente.");
        router.push("/home");
      }, 2000);
    } catch (error) {
      setLoading(false);
      Alert.alert(
        "Error",
        "Ocurrió un problema al registrarse. Inténtalo de nuevo."
      );
      console.error(error);
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
              <View style={styles.formContainer}>
                <Text
                  style={[typography.semibold.big, { color: colors.darkGray }]}
                >
                  Completa tu perfil
                </Text>
                <Text
                  style={[typography.medium.regular, { color: colors.gray }]}
                >
                  Por favor, ingresa los siguientes datos y asegúrate de que tu
                  información sea correcta.
                </Text>

                <View style={{ width: "100%" }}>
                  <Text style={styles.label}>Dirección</Text>
                  <CustomInput
                    placeholder="Dirección"
                    value={direccion}
                    onChangeText={setDireccion}
                  />
                </View>

                <View style={{ width: "100%" }}>
                  <Text style={styles.label}>País</Text>
                  <DropdownPicker
                    selectedValue={selectedCountry}
                    onValueChange={(value) => {
                      setSelectedCountry(value);
                      fetchStates(value);
                    }}
                    options={[
                      { label: "Selecciona una opción", value: "" }, // Opción predeterminada
                      ...countries.map((country) => ({
                        label: country.name,
                        value: country.iso2,
                      })),
                    ]}
                  />
                </View>

                <View style={{ width: "100%" }}>
                  <Text style={styles.label}>Departamento</Text>
                  <DropdownPicker
                    selectedValue={selectedState}
                    onValueChange={(value) => {
                      setSelectedState(value);
                      fetchCities(selectedCountry, value);
                    }}
                    options={[
                      { label: "Selecciona una opción", value: "" },
                      ...states.map((state) => ({
                        label: state.name,
                        value: state.iso2,
                      })),
                    ]}
                    disabled={!selectedCountry}
                  />
                </View>

                <View style={{ width: "100%" }}>
                  <Text style={styles.label}>Ciudad</Text>
                  <DropdownPicker
                    selectedValue={selectedCity}
                    onValueChange={setSelectedCity}
                    options={[
                      { label: "Selecciona una opción", value: "" },
                      ...cities.map((city) => ({
                        label: city.name,
                        value: city.id,
                      })),
                    ]}
                    disabled={!selectedState}
                  />
                </View>

                <View style={{ width: "100%" }}>
                  <Text style={styles.label}>Teléfono</Text>
                  <CustomInput
                    placeholder="Teléfono"
                    value={telefono}
                    onChangeText={(text) =>
                      setTelefono(text.replace(/[^0-9]/g, ""))
                    }
                    keyboardType="numeric"
                    prefix={`+${phoneCode}`}
                  />
                </View>

                {/* Seccion de imagen */}
                <Text style={styles.subtitle}>
                  Subir una foto de perfil (Opcional)
                </Text>
                <View style={styles.imageUploadContainer}>
                  <Text style={styles.uploadText}>
                    {imageName
                      ? "Imagen seleccionada"
                      : "Selecciona la imagen aquí"}
                  </Text>
                  <TouchableOpacity
                    style={styles.uploadButton}
                    onPress={pickImage}
                  >
                    <Text style={styles.uploadText}>Subir</Text>
                  </TouchableOpacity>
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
        </TouchableWithoutFeedback>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.base },
  scrollContainer: { flexGrow: 1 },
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
  label: { marginBottom: 8, ...typography.medium.regular, color: colors.gray },
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
