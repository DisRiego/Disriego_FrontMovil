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
import { API_URL } from "@/services/config";
import axios from "axios";
import { getUserData } from "@/services/users";

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

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);

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

  const fetchStates = async (countryCode: string) => {
    setSelectedState("");
    setSelectedCity("");
    setCities([]);
    try {
      const data = await getStates(countryCode);
      setStates(data);

      const code = await getCountryPhoneCode(countryCode);
      setPhoneCode(code);
    } catch (error) {
      console.error("Error al obtener departamentos:", error);
    }
  };

  const fetchCities = async (countryCode: string, stateCode: string) => {
    setSelectedCity("");
    try {
      const data = await getCities(countryCode, stateCode);
      setCities(data);
    } catch (error) {
      console.error("Error al obtener ciudades:", error);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
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
      const userData = await getUserData();
      if (!userData) {
        throw new Error("No se pudo obtener el ID del usuario.");
      }

      const formData = new FormData();
      formData.append("user_id", userData.id.toString()); // ID del usuario extraído del token
      formData.append("country", selectedCountry);
      formData.append("department", selectedState);
      formData.append("city", selectedCity);
      formData.append("address", direccion);
      formData.append("phone", telefono);

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

                <Text style={styles.label}>Dirección</Text>
                <CustomInput
                  placeholder="Dirección"
                  value={direccion}
                  onChangeText={setDireccion}
                />

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

                <Text style={styles.label}>Teléfono</Text>
                <CustomInput
                  placeholder="Teléfono"
                  value={telefono}
                  onChangeText={(text) =>
                    setTelefono(text.replace(/[^0-9]/g, ""))
                  }
                  keyboardType="numeric"
                />

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
