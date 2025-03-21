import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { typography } from "@/config/typography";
import { colors } from "@/config/theme";
import CustomInput from "@/components/CustomInput";
import { SafeAreaView } from "react-native-safe-area-context";
import DropdownPicker from "@/components/Dropdown";
import { getUserData } from "@/services/auth";
import CustomHeader from "@/components/CustomHeader";
import { getCountries, getStates, getCities } from "@/services/location";
import Button from "@/components/Button";
import { API_URL } from "@/services/config";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Svg, Circle, Text as SvgText } from "react-native-svg";
import * as ImagePicker from "expo-image-picker";

type User = {
  id: string;
  name: string;
  first_last_name: string;
  address?: string;
  phone?: string;
  country?: string;
  department?: string;
  city?: string;
};

// Función para obtener iniciales del nombre
const getInitials = (name?: string) => {
  if (!name || name.trim().length === 0) return "";
  const parts = name.split(" ");
  return parts.length > 1
    ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    : parts[0][0].toUpperCase();
};

// Función para obtener color basado en el nombre
const getColorFromName = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `hsl(${hash % 360}, 60%, 50%)`;
};

const UpdateProfile = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userData, countryData] = await Promise.all([
          getUserData(),
          getCountries(),
        ]);
        setCountries(countryData);
        if (userData) {
          setUser(userData);
          setDireccion(userData.address || "");
          setTelefono(userData.phone || "");
          setSelectedCountry(userData.country || "");
          setSelectedState(userData.department || "");
          setSelectedCity(userData.city || "");

          if (userData.country) {
            const statesData = await getStates(userData.country);
            setStates(statesData);

            if (userData.department) {
              const citiesData = await getCities(
                userData.country,
                userData.department
              );
              setCities(citiesData);
            }
          }
        }
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSaveChanges = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) throw new Error("No se encontró el token de autenticación.");

      await axios.put(
        `${API_URL}/users/edit-profile/${user.id}`,
        {
          address: direccion,
          phone: telefono,
          country: selectedCountry,
          department: selectedState,
          city: selectedCity,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Perfil actualizado correctamente");
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      alert("Hubo un problema al actualizar el perfil");
    } finally {
      setLoading(false);
    }
  };

  const countryOptions = useMemo(
    () => countries.map(({ name, iso2 }) => ({ label: name, value: iso2 })),
    [countries]
  );
  const stateOptions = useMemo(
    () => states.map(({ name, iso2 }) => ({ label: name, value: iso2 })),
    [states]
  );
  const cityOptions = useMemo(
    () => cities.map(({ name, id }) => ({ label: name, value: id })),
    [cities]
  );

  const handleImagePicker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Se necesita permiso para acceder a la galería.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const image = result.assets[0].uri;
      setImageUri(image); // Actualiza el estado de la imagen
      await uploadImage(image); // Esto asegura que la imagen se suba solo después de la actualización del estado
    }
  };

  const uploadImage = async (imageUri: string) => {
    if (!user) return;

    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) throw new Error("No se encontró el token de autenticación.");

      const formData = new FormData();
      const imageFile: any = {
        uri: imageUri,
        name: `profile_${user.id}.jpg`,
        type: "image/jpeg",
      };

      formData.append("profile_picture", imageFile);

      setUploadingImage(true); // Inicia la carga de la imagen

      const response = await axios.put(
        `${API_URL}/users/update-photo/${user.id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        alert("Imagen de perfil actualizada correctamente");
      } else {
        throw new Error("Error en la actualización de la imagen.");
      }
    } catch (error) {
      console.error("Error al subir imagen:", error);
      alert("Hubo un problema al actualizar la imagen");
    } finally {
      setUploadingImage(false); // Finaliza la carga de la imagen
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <CustomHeader title="Actualizar perfil" backRoute="/(tabs)/profile" />

          {/* Avatar y nombre del usuario */}
          <View style={styles.pictureContainer}>
            <TouchableOpacity onPress={handleImagePicker} disabled={loading}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.profileImage} />
              ) : (
                <Svg width={60} height={60}>
                  <Circle
                    cx="30"
                    cy="30"
                    r="30"
                    fill={getColorFromName(user?.name || "Usuario")}
                  />
                  {!loading && user?.name && (
                    <SvgText
                      x="30"
                      y="35"
                      textAnchor="middle"
                      fontSize="16"
                      fill="white"
                      fontWeight="bold"
                    >
                      {getInitials(user.name)}
                    </SvgText>
                  )}
                </Svg>
              )}
            </TouchableOpacity>
            <Text style={styles.username}>
              {user?.name} {user?.first_last_name}
            </Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.label}>Dirección</Text>
            <CustomInput
              placeholder="Dirección"
              value={direccion}
              onChangeText={setDireccion}
              editable={!loading}
            />

            <Text style={styles.label}>País</Text>
            <DropdownPicker
              selectedValue={selectedCountry}
              onValueChange={setSelectedCountry}
              options={countryOptions}
              disabled={loading}
            />

            <Text style={styles.label}>Departamento</Text>
            <DropdownPicker
              selectedValue={selectedState}
              onValueChange={setSelectedState}
              options={stateOptions}
              disabled={loading || !selectedCountry}
            />

            <Text style={styles.label}>Ciudad</Text>
            <DropdownPicker
              selectedValue={selectedCity}
              onValueChange={setSelectedCity}
              options={cityOptions}
              disabled={loading || !selectedState}
            />

            <Text style={styles.label}>Teléfono</Text>
            <CustomInput
              placeholder="Teléfono"
              value={telefono}
              onChangeText={(text) => setTelefono(text.replace(/[^0-9]/g, ""))}
              keyboardType="numeric"
              editable={!loading}
            />
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

      {/* Modal de carga */}
      <Modal transparent={true} visible={uploadingImage} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.modalText}>Cargando imagen...</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.base },
  scrollContainer: { flexGrow: 1, paddingBottom: 24 },
  container: { flex: 1, alignItems: "center", backgroundColor: colors.base },
  formContainer: { width: "100%", padding: 20 },
  label: { marginBottom: 8, ...typography.medium.regular, color: colors.gray },
  footerContainer: { width: "100%", padding: 20, alignItems: "center" },
  pictureContainer: { alignItems: "center", marginVertical: 20 },
  username: { color: colors.darkGray, ...typography.medium.medium },
  profileImage: { width: 60, height: 60, borderRadius: 30 },

  // Estilos para el Modal
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.darkGray,
  },
});

export default UpdateProfile;
