import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  Image,
  StyleSheet,
  StatusBar,
  Platform,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { Svg, Circle, Text as SvgText } from "react-native-svg";
import { getUserData } from "@/services/auth";
import { fetchLocationNames } from "@/services/location";
import CustomInput from "@/components/CustomInput";
import CustomHeader from "@/components/CustomHeader";
import { colors } from "@/config/theme";
import { typography } from "@/config/typography";

/**
 * Componente SeeProfile - Muestra la información del perfil del usuario
 * Permite visualizar datos personales, de contacto y ubicación
 */
const SeeProfile = () => {
  const router = useRouter();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userInitials, setUserInitials] = useState("");

  /**
   * Obtiene las iniciales del nombre del usuario para mostrar en el avatar
   * @param name - Nombre completo del usuario
   * @returns Iniciales en mayúscula
   */
  const getInitials = (name: string) => {
    if (!name || name.trim().length === 0) return "";
    const parts = name.split(" ");
    return parts.length > 1
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : parts[0][0].toUpperCase();
  };

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

  /**
   * Carga los datos del usuario desde el backend
   */
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await getUserData();
        if (data) {
          const locationNames = await fetchLocationNames(
            data.country,
            data.department,
            data.city
          );

          const fullName = `${data.name} ${data.first_last_name}`;
          const initials = getInitials(fullName);
          setUserInitials(initials);

          setUserData({
            name: fullName,
            email: data.email,
            profile_picture: data.profile_picture || null,
            address: data.address || "",
            phone: data.phone || "",
            gender_name: data.gender_name || "",
            type_document_name: data.type_document_name || "",
            document_number: data.document_number?.toString() || "",
            birthday: formatDate(data.birthday),
            date_issuance_document: formatDate(data.date_issuance_document),
            country: locationNames.country,
            department: locationNames.department,
            city: locationNames.city,
          });
        }
      } catch (error) {
        console.error("Error al cargar datos del perfil:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Función para renderizar el avatar
  const renderAvatar = () => {
    // Mostrar indicador de carga si está cargando
    if (loading) {
      return (
        <ActivityIndicator
          size="small"
          color={colors.gray}
          style={{ width: 60, height: 60 }}
        />
      );
    }

    return (
      <View>
        {/* Base SVG con iniciales */}
        <Svg width={60} height={60} viewBox="0 0 60 60">
          <Circle
            cx="30"
            cy="30"
            r="30"
            fill={loading ? colors.base : colors.primary}
          />
          <SvgText
            x="50%"
            y="50%"
            textAnchor="middle"
            dy=".35em"
            fontSize="18"
            fontWeight="bold"
            fill="white"
          >
            {userInitials}
          </SvgText>
        </Svg>

        {/* Imagen de perfil encima del Svg */}
        {userData.profile_picture && (
          <Image
            source={{ uri: userData.profile_picture }}
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
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* Encabezado */}
          <CustomHeader title="Ver perfil" backRoute="/(tabs)/profile" />

          {/* Indicador de carga */}
          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loaderText}>Cargando datos...</Text>
            </View>
          ) : (
            <>
              {/* Avatar del usuario */}
              <View style={styles.pictureContainer}>
                {renderAvatar()}
                <Text style={styles.username}>{userData.name}</Text>
              </View>

              {/* Datos del usuario */}
              <View style={styles.formContainer}>
                {/* Sección de datos personales */}
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

                {/* Sección de datos de contacto */}
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

                {/* Sección de ubicación */}
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
                    <Text style={styles.label}>Localización</Text>
                    <CustomInput
                      placeholder="Localización"
                      value={`${userData.country}, ${userData.department}, ${userData.city}`}
                      editable={false}
                    />
                  </View>
                </View>
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

/**
 * Formatea la fecha en formato español
 * @param dateString - Fecha en formato ISO
 * @returns Fecha formateada (ej: 25 de marzo de 2025)
 */
const formatDate = (dateString: string | number | Date) => {
  if (!dateString) return "No disponible";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.base,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  scrollContainer: {
    flexGrow: 1,
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
    marginTop: 8,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
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

export default SeeProfile;
