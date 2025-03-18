import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Image } from "react-native";
import { useRouter } from "expo-router";
import { typography } from "@/config/typography";
import { colors } from "@/config/theme";
import CustomInput from "@/components/CustomInput";
import { SafeAreaView } from "react-native-safe-area-context";
import DropdownPicker from "@/components/Dropdown";
import { getUserData } from "@/services/auth";
import CustomHeader from "@/components/CustomHeader";
import { Svg, Circle, Text as SvgText } from "react-native-svg";
import {
  getCountries,
  getStates,
  getCities,
  getCountryPhoneCode,
} from "@/services/location";

/**
 * Obtiene las iniciales del nombre del usuario
 */
const getInitials = (name?: string) => {
  if (!name || name.trim().length === 0) return "";
  const parts = name.split(" ");
  return parts.length > 1
    ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    : parts[0][0].toUpperCase();
};

/**
 * Genera un color basado en el nombre del usuario
 */
const getColorFromName = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `hsl(${hash % 360}, 60%, 50%)`;
};

const UpdateProfile = () => {
  const router = useRouter();
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [user, setUser] = useState<{
    name: string;
    email: string;
    profile_picture?: string | null;
  } | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const profilePicture = user?.profile_picture || null;
  const [loading, setLoading] = useState(true);

  // Estados para País, Estado, Ciudad y Código de País
  const [countries, setCountries] = useState<{ name: string; iso2: string }[]>(
    []
  );
  const [states, setStates] = useState<{ name: string; iso2: string }[]>([]);
  const [cities, setCities] = useState<{ name: string; id: string }[]>([]);
  const [phoneCode, setPhoneCode] = useState("");

  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      const userData = await getUserData();
      if (userData) {
        setUser({
          name: `${userData.name} ${userData.first_last_name}`,
          email: userData.email,
          profile_picture: userData.profile_picture || null,
        });

        // Asignar datos a los campos de entrada
        setDireccion(userData.address || "");
        setTelefono(userData.phone || "");
      }
      setLoading(false);
    };

    const fetchCountries = async () => {
      const data = await getCountries();
      setCountries(data);
    };

    fetchUserData();
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <CustomHeader title="Actualizar perfil" backRoute="/(tabs)/profile" />
          <View style={styles.pictureContainer}>
            {profilePicture && !imageLoaded ? (
              <Svg height="60" width="60" style={{ marginBottom: 8 }}>
                <Circle
                  cx="30"
                  cy="30"
                  r="30"
                  fill={getColorFromName(user?.name || "Usuario")}
                />
              </Svg>
            ) : profilePicture ? (
              <Image
                source={{ uri: profilePicture }}
                style={styles.profileImage}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageLoaded(false)}
              />
            ) : (
              <Svg
                width={60}
                height={60}
                style={{ marginRight: 15, marginBottom: 12 }}
              >
                <Circle
                  cx="28"
                  cy="28"
                  r="28"
                  fill={
                    loading
                      ? colors.base
                      : getColorFromName(user?.name || "Usuario")
                  }
                />
                {!loading && user?.name && (
                  <SvgText
                    x="30"
                    y="33"
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

            <View>
              <Text style={styles.username}>{user?.name}</Text>
            </View>
          </View>

          <View style={styles.formContainer}>
            {/* 📌 Dirección */}
            <View style={{ width: "100%" }}>
              <Text style={styles.label}>Dirección</Text>
              <CustomInput
                placeholder="Dirección"
                value={direccion}
                onChangeText={setDireccion}
              />
            </View>

            {/* 📌 País */}
            <View style={{ width: "100%" }}>
              <Text style={styles.label}>País</Text>
              <DropdownPicker
                selectedValue={selectedCountry}
                onValueChange={(value) => {
                  setSelectedCountry(value);
                  fetchStates(value);
                }}
                options={countries.map((country) => ({
                  label: country.name,
                  value: country.iso2,
                }))}
              />
            </View>

            {/* 📌 Departamento */}
            <View style={{ width: "100%" }}>
              <Text style={styles.label}>Departamento</Text>
              <DropdownPicker
                selectedValue={selectedState}
                onValueChange={(value) => {
                  setSelectedState(value);
                  fetchCities(selectedCountry, value);
                }}
                options={states.map((state) => ({
                  label: state.name,
                  value: state.iso2,
                }))}
                disabled={!selectedCountry}
              />
            </View>

            {/* 📌 Ciudad */}
            <View style={{ width: "100%" }}>
              <Text style={styles.label}>Ciudad</Text>
              <DropdownPicker
                selectedValue={selectedCity}
                onValueChange={setSelectedCity}
                options={cities.map((city) => ({
                  label: city.name,
                  value: city.id,
                }))}
                disabled={!selectedState}
              />
            </View>

            {/* 📌 Teléfono con prefijo */}
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
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.base },
  scrollContainer: { flexGrow: 1, paddingBottom: 24 },
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
  },
  username: {
    color: colors.darkGray,
    ...typography.medium.medium,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 10,
  },
  pictureContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  label: { marginBottom: 8, ...typography.medium.regular, color: colors.gray },
});

export default UpdateProfile;
