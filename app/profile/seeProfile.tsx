import React, { useEffect, useState } from "react";
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
import { useRouter } from "expo-router";
import { Svg, Circle, Text as SvgText } from "react-native-svg";
import { getUserData } from "@/services/auth";
import { fetchLocationNames } from "@/services/location";
import CustomInput from "@/components/CustomInput";
import CustomHeader from "@/components/CustomHeader";
import { colors } from "@/config/theme";
import { typography } from "@/config/typography";
import type { User } from "@/services/auth";

const SeeProfile = () => {
  const router = useRouter();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userInitials, setUserInitials] = useState("");
  const [userData, setUserData] = useState<User | null>(null);
  const [locationText, setLocationText] = useState("");

  const getInitials = (name: string) => {
    if (!name || name.trim().length === 0) return "";
    const parts = name.trim().split(" ");
    return parts.length > 1
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : parts[0][0].toUpperCase();
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getUserData();
        if (data) {
          const initials = getInitials(`${data.name} ${data.first_last_name}`);
          setUserInitials(initials);
          setUserData(data);
        }

        if (data?.country && data?.department && data?.city) {
          try {
            const locationNames = await fetchLocationNames(
              data.country,
              data.department,
              data.city
            );
            setLocationText(
              `${locationNames.country}, ${locationNames.department}, ${locationNames.city}`
            );
          } catch (locError) {
            console.warn(
              "Error obteniendo localización (token expirado):",
              locError
            );
            setLocationText("Ubicación no disponible");
          }
        }
      } catch (error) {
        console.error("Error al cargar datos del perfil:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const renderAvatar = () => {
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

        {userData?.profile_picture && (
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
          <CustomHeader title="Ver perfil" backRoute="/(tabs)/profile" />

          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loaderText}>Cargando datos...</Text>
            </View>
          ) : (
            <>
              <View style={styles.pictureContainer}>
                {renderAvatar()}
                <Text style={styles.username}>
                  {userData?.name} {userData?.first_last_name}
                </Text>
              </View>

              <View style={styles.formContainer}>
                <View style={styles.dataContainer}>
                  <Text style={styles.title}>Datos personales</Text>

                  <Text style={styles.label}>Documento de Identidad</Text>
                  <View style={{ flexDirection: "row", gap: 10 }}>
                    <View style={{ flex: 2 }}>
                      <CustomInput
                        placeholder="Tipo"
                        value={userData?.type_document_name ?? ""}
                        editable={false}
                      />
                    </View>
                    <View style={{ flex: 7 }}>
                      <CustomInput
                        placeholder="Número"
                        value={userData?.document_number?.toString() ?? ""}
                        editable={false}
                      />
                    </View>
                  </View>

                  <Text style={styles.label}>Fecha de Nacimiento</Text>
                  <CustomInput
                    placeholder="Fecha"
                    value={formatDate(userData?.birthday ?? "")}
                    editable={false}
                  />

                  <Text style={styles.label}>Fecha de Expedición</Text>
                  <CustomInput
                    placeholder="Fecha"
                    value={formatDate(userData?.date_issuance_document ?? "")}
                    editable={false}
                  />

                  <Text style={styles.label}>Género</Text>
                  <CustomInput
                    placeholder="Género"
                    value={userData?.gender_name ?? ""}
                    editable={false}
                  />
                </View>

                <View style={styles.dataContainer}>
                  <Text style={styles.title}>Datos de contacto</Text>

                  <Text style={styles.label}>Correo Electrónico</Text>
                  <CustomInput
                    placeholder="Correo"
                    value={userData?.email ?? ""}
                    editable={false}
                  />

                  <Text style={styles.label}>Teléfono</Text>
                  <CustomInput
                    placeholder="Teléfono"
                    value={userData?.phone ?? ""}
                    editable={false}
                  />
                </View>

                <View style={styles.dataContainer}>
                  <Text style={styles.title}>Ubicación</Text>

                  <Text style={styles.label}>Dirección</Text>
                  <CustomInput
                    placeholder="Dirección"
                    value={userData?.address ?? ""}
                    editable={false}
                  />

                  <Text style={styles.label}>Localización</Text>
                  <CustomInput
                    placeholder="Localización"
                    value={locationText}
                    editable={false}
                  />
                </View>
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

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
    gap: 12,
    width: "100%",
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  label: {
    marginBottom: 4,
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
    marginVertical: 10,
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
