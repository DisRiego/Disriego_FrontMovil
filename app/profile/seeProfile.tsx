import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  Image,
  StyleSheet,
  StatusBar,
  Platform,
} from "react-native";
import React, { useEffect, useState } from "react";
import { colors } from "@/config/theme";
import { useRouter } from "expo-router";
import { Svg, Circle, Text as SvgText } from "react-native-svg";
import { getUserData } from "@/services/auth";
import CustomInput from "@/components/CustomInput";
import CustomHeader from "@/components/CustomHeader";
import { typography } from "@/config/typography";
import { fetchLocationNames } from "@/services/location";

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

const SeeProfile = () => {
  const router = useRouter();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [loading, setLoading] = useState(true);

  // Estado unificado para los datos del usuario
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    profile_picture: null,
    address: "",
    phone: "",
    gender_name: "",
    type_document_name: "",
    document_number: "",
    birthday: "",
    date_issuance_document: "",
    country: "",
    department: "",
    city: "",
  });

  const formatDate = (dateString: string) => {
    if (!dateString) return "No disponible";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const data = await getUserData();
      if (data) {
        const locationNames = await fetchLocationNames(
          data.country,
          data.department,
          data.city
        );

        setUserData({
          name: `${data.name} ${data.first_last_name}`,
          email: data.email,
          profile_picture: data.profile_picture || null,
          address: data.address || "",
          phone: data.phone || "",
          gender_name: data.gender_name || "",
          type_document_name: data.type_document_name || "",
          document_number: data.document_number?.toString() || "",
          birthday: data.birthday || "No disponible",
          date_issuance_document: formatDate(data.date_issuance_document),
          country: locationNames.country,
          department: locationNames.department,
          city: locationNames.city,
        });
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* Encabezado */}
          <CustomHeader title="Ver perfil" backRoute="/(tabs)/profile" />

          {/* Avatar del usuario */}
          <View style={styles.pictureContainer}>
            {userData.profile_picture && !imageLoaded ? (
              <Svg height="60" width="60" style={{ marginBottom: 8 }}>
                <Circle
                  cx="30"
                  cy="30"
                  r="30"
                  fill={getColorFromName(userData.name || "Usuario")}
                />
              </Svg>
            ) : userData.profile_picture ? (
              <Image
                source={{ uri: userData.profile_picture }}
                style={styles.profileImage}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageLoaded(false)}
              />
            ) : (
              <Svg width={60} height={60} style={{ marginBottom: 12 }}>
                <Circle
                  cx="28"
                  cy="28"
                  r="28"
                  fill={loading ? colors.base : getColorFromName(userData.name)}
                />
                {!loading && userData.name && (
                  <SvgText
                    x="30"
                    y="33"
                    textAnchor="middle"
                    fontSize="16"
                    fill="white"
                    fontWeight="bold"
                  >
                    {getInitials(userData.name)}
                  </SvgText>
                )}
              </Svg>
            )}

            <Text style={styles.username}>{userData.name}</Text>
          </View>

          {/* Datos del usuario */}
          <View style={styles.formContainer}>
            <View style={styles.dataContainer}>
              <Text style={styles.title}>Datos personales</Text>
              <View>
                <Text style={styles.label}>Documento de Identidad</Text>
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <View style={{ flex: 2 }}>
                    <CustomInput
                      placeholder="Tipo"
                      value={userData.type_document_name}
                      editable={false}
                    />
                  </View>
                  <View style={{ flex: 7 }}>
                    <CustomInput
                      placeholder="Número"
                      value={userData.document_number}
                      editable={false}
                    />
                  </View>
                </View>
              </View>

              <View>
                <Text style={styles.label}>Fecha de Nacimiento</Text>
                <CustomInput
                  placeholder="Fecha de Nacimiento"
                  value={userData.birthday}
                  editable={false}
                />
              </View>

              <View>
                <Text style={styles.label}>Fecha de Expedición</Text>
                <CustomInput
                  placeholder="Fecha de Expedición"
                  value={userData.date_issuance_document}
                  editable={false}
                />
              </View>

              <View>
                <Text style={styles.label}>Género</Text>
                <CustomInput
                  placeholder="Género"
                  value={userData.gender_name}
                  editable={false}
                />
              </View>
            </View>

            <View style={styles.dataContainer}>
              <Text style={styles.title}>Datos de contacto</Text>
              <View>
                <Text style={styles.label}>Correo Electrónico</Text>
                <CustomInput
                  placeholder="Correo Electrónico"
                  value={userData.email}
                  editable={false}
                />
              </View>

              <View>
                <Text style={styles.label}>Teléfono</Text>
                <CustomInput
                  placeholder="Teléfono"
                  value={userData.phone}
                  editable={false}
                />
              </View>
            </View>

            <View style={styles.dataContainer}>
              <Text style={styles.title}>Ubicación</Text>
              <View>
                <Text style={styles.label}>Dirección</Text>
                <CustomInput
                  placeholder="Dirección"
                  value={userData.address}
                  editable={false}
                />
              </View>
              <View>
                <Text style={styles.label}>Localización </Text>
                <CustomInput
                  placeholder="Localización"
                  value={`${userData.country}, ${userData.department}, ${userData.city}`}
                  editable={false}
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.base,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  container: {
    flex: 1,
    paddingBottom: 16,
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
  label: {
    marginBottom: 8,
    ...typography.medium.regular,
    color: colors.gray,
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
    marginVertical: 20,
  },
  title: {
    ...typography.semibold.large,
    marginVertical: 2,
  },
  dataContainer: {
    gap: 8,
    marginBottom: 1,
  },
});

export default SeeProfile;
