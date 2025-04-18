import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Svg, Circle, Text as SvgText } from "react-native-svg";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Componentes personalizados
import { typography } from "@/config/typography";
import { colors } from "@/config/theme";
import CustomInput from "@/components/CustomInput";
import DropdownPicker from "@/components/Dropdown";
import CustomHeader from "@/components/CustomHeader";
import Button from "@/components/Button";

// Servicios
import { getUserData } from "@/services/auth";
import { getCountries, getStates, getCities } from "@/services/location";
import { API_URL } from "@/services/config";

// Tipos
type User = {
  id: string;
  name: string;
  first_last_name: string;
  address?: string;
  phone?: string;
  country?: string;
  department?: string;
  city?: string;
  profile_picture?: string;
};

/**
 * Obtiene las iniciales del nombre del usuario para mostrar en el avatar
 * @param name - Nombre completo del usuario
 * @returns Iniciales en mayúscula
 */
const getInitials = (name: string) => {
  if (!name || name.trim().length === 0) return "";
  const parts = name.split(" ");
  const initials =
    parts.length > 1
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : parts[0][0].toUpperCase();

  return initials;
};

/**
 * Genera un color aleatorio pero determinista basado en el nombre del usuario
 * @param name - Nombre del usuario
 * @returns Color en formato HSL
 */
const getColorFromName = (name = "Usuario") => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `hsl(${hash % 360}, 60%, 50%)`;
};

/**
 * Componente principal para la actualización del perfil de usuario
 */
const UpdateProfile = () => {
  const router = useRouter();

  // Estados para control de carga
  const [loading, setLoading] = useState(true);
  const [savingChanges, setSavingChanges] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Estados para datos del usuario
  const [user, setUser] = useState<User | null>(null);
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);

  // Estados para ubicación
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  /**
   * Carga inicial de datos del usuario y países
   */
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

          // Si el usuario tiene una imagen de perfil, establecerla
          if (userData.profile_picture) {
            setImageUri(userData.profile_picture);
          }

          // Carga de estados y ciudades si el usuario ya tiene un país seleccionado
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

  /**
   * Memoriza las opciones para los dropdowns para evitar recálculos innecesarios
   */
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

  /**
   * Maneja el cambio de país y actualiza los estados
   */
  const handleCountryChange = useCallback(async (countryCode: string) => {
    try {
      setSelectedCountry(countryCode);
      setSelectedState("");
      setSelectedCity("");
      setCities([]);

      if (countryCode) {
        const statesData = await getStates(countryCode);
        setStates(statesData);
      } else {
        setStates([]);
      }
    } catch (error) {
      console.error("Error al cargar estados:", error);
      setStates([]);
    }
  }, []);

  /**
   * Maneja el cambio de estado/departamento y actualiza las ciudades
   */
  const handleStateChange = useCallback(
    async (stateCode: string) => {
      try {
        setSelectedState(stateCode);
        setSelectedCity("");

        if (selectedCountry && stateCode) {
          const citiesData = await getCities(selectedCountry, stateCode);
          setCities(citiesData);
        } else {
          setCities([]);
        }
      } catch (error) {
        console.error("Error al cargar ciudades:", error);
        setCities([]);
      }
    },
    [selectedCountry]
  );

  /**
   * Guarda los cambios del perfil en el servidor
   */
  const handleSaveChanges = async () => {
    if (!user) return;
    setSavingChanges(true);

    // Validar campos obligatorios
    if (
      !direccion.trim() ||
      !telefono.trim() ||
      !selectedCountry ||
      !selectedState ||
      !selectedCity
    ) {
      Alert.alert("Error", "No se pueden enviar los campos vacíos.");
      setSavingChanges(false);
      return;
    }

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

      Alert.alert("Éxito", "Perfil actualizado correctamente.");
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      Alert.alert(
        "Error",
        "No se pudo actualizar la imagen. Inténtalo de nuevo."
      );
    } finally {
      setSavingChanges(false);
    }
  };

  /**
   * Abre el selector de imágenes y verifica permisos
   */
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
      setImageUri(image);
      setImageLoaded(true);
      await uploadImage(image);
    }
  };

  /**
   * Sube la imagen seleccionada al servidor
   * @param imageUri - URI de la imagen seleccionada
   */
  const uploadImage = async (imageUri: string) => {
    if (!user) return;

    try {
      setUploadingImage(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) throw new Error("No se encontró el token de autenticación.");

      const formData = new FormData();
      const imageFile: any = {
        uri: imageUri,
        name: `profile_${user.id}.jpg`,
        type: "image/jpeg",
      };

      formData.append("profile_picture", imageFile);

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
        Alert.alert("Éxito", "Imagen de perfil actualizada correctamente.");
      } else {
        throw new Error("Error en la actualización de la imagen.");
      }
    } catch (error) {
      console.error("Error al subir imagen:", error);
      alert("Hubo un problema al actualizar la imagen");
      setImageLoaded(false);
    } finally {
      setUploadingImage(false);
    }
  };

  /**
   * Renderiza el avatar del usuario con imagen o iniciales
   */
  const renderAvatar = () => {
    // Mostrar indicador de carga mientras se obtienen los datos del usuario
    if (loading) {
      return (
        <View style={styles.avatarContainer}>
          <ActivityIndicator size="small" color={colors.gray} />
        </View>
      );
    }

    return (
      <View style={styles.avatarContainer}>
        {/* Base SVG avatar con iniciales */}
        <Svg width={60} height={60} viewBox="0 0 60 60">
          <Circle cx="30" cy="30" r="30" fill={colors.primary} />
          <SvgText
            x="50%"
            y="50%"
            textAnchor="middle"
            dy=".35em"
            fontSize="16"
            fontWeight="bold"
            fill="white"
          >
            {getInitials(`${user?.name || ""} ${user?.first_last_name || ""}`)}
          </SvgText>
        </Svg>

        {/* Cargar la imagen en segundo plano solo si hay una URL disponible */}
        {imageUri && (
          <Image
            source={{ uri: imageUri }}
            style={[
              styles.profileImage,
              {
                position: "absolute",
                top: 0,
                left: 0,
                opacity: imageLoaded ? 1 : 0,
              },
            ]}
            onLoad={() => setImageLoaded(true)}
            onError={() => console.error("Error loading profile image")}
          />
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <CustomHeader title="Actualizar perfil" backRoute="/(tabs)/profile" />

        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Indicador de carga como en SeeProfile */}
          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loaderText}>Cargando datos...</Text>
            </View>
          ) : (
            <>
              {/* Avatar y nombre del usuario */}
              <View style={styles.pictureContainer}>
                <TouchableOpacity
                  onPress={handleImagePicker}
                  disabled={uploadingImage}
                >
                  {uploadingImage ? (
                    <View style={styles.avatarContainer}>
                      <ActivityIndicator size="small" color={colors.primary} />
                    </View>
                  ) : (
                    renderAvatar()
                  )}
                </TouchableOpacity>
                <Text style={styles.username}>
                  {user?.name} {user?.first_last_name}
                </Text>
              </View>

              {/* Formulario de actualización */}
              <View style={styles.formContainer}>
                <View>
                  <Text style={styles.label}>Dirección</Text>
                  <CustomInput
                    placeholder="Dirección"
                    value={direccion}
                    onChangeText={setDireccion}
                  />
                </View>

                <View>
                  <Text style={styles.label}>País</Text>
                  <DropdownPicker
                    selectedValue={selectedCountry}
                    onValueChange={handleCountryChange}
                    options={countryOptions}
                  />
                </View>

                <View>
                  <Text style={styles.label}>Departamento</Text>
                  <DropdownPicker
                    selectedValue={selectedState}
                    onValueChange={handleStateChange}
                    options={stateOptions}
                    disabled={!selectedCountry}
                  />
                </View>

                <View>
                  <Text style={styles.label}>Ciudad</Text>
                  <DropdownPicker
                    selectedValue={selectedCity}
                    onValueChange={setSelectedCity}
                    options={cityOptions}
                    disabled={!selectedState}
                  />
                </View>

                <View>
                  <Text style={styles.label}>Teléfono</Text>
                  <CustomInput
                    placeholder="Teléfono"
                    value={telefono}
                    onChangeText={(text) =>
                      setTelefono(text.replace(/[^0-9]/g, ""))
                    }
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* Botón para guardar cambios */}
              <View style={styles.footerContainer}>
                <Button
                  text={
                    savingChanges ? (
                      <ActivityIndicator size={28} color="white" />
                    ) : (
                      "Guardar cambios"
                    )
                  }
                  onPress={handleSaveChanges}
                  disabled={savingChanges}
                />
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

/**
 * Estilos para el componente
 */
const styles = StyleSheet.create({
  // Contenedores principales
  safeArea: {
    flex: 1,
    backgroundColor: colors.base,
  },
  container: {
    flex: 1,
    backgroundColor: colors.base,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 16,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  formContainer: {
    flex: 1,
    gap: 16,
    width: "100%",
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  label: {
    marginBottom: 8,
    ...typography.medium.regular,
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
  pictureContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  username: {
    color: colors.darkGray,
    ...typography.medium.medium,
    marginTop: 8,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    position: "relative",
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    minHeight: 300,
  },
  loaderText: {
    marginTop: 12,
    ...typography.regular.medium,
    color: colors.darkGray,
  },
});

export default UpdateProfile;
