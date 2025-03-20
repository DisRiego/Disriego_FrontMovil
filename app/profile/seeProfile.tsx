import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  Image,
} from "react-native";
import React, { useEffect, useState } from "react";
import { colors } from "@/config/theme";
import { useRouter } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import { typography } from "@/config/typography";
import { Svg, Circle, Text as SvgText } from "react-native-svg";
import { getUserData } from "@/services/auth";
import CustomInput from "@/components/CustomInput";
import CustomHeader from "@/components/CustomHeader";

const getInitials = (name?: string) => {
  if (!name || name.trim().length === 0) return "";
  const parts = name.split(" ");
  return parts.length > 1
    ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    : parts[0][0].toUpperCase();
};

const getColorFromName = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `hsl(${hash % 360}, 60%, 50%)`;
};

const SeeProfile = () => {
  const router = useRouter();
  const [selectedGender, setSelectedGender] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [correo, setCorreo] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState("");
  const [user, setUser] = useState<{
    name: string;
    email: string;
    profile_picture?: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const profilePicture = user?.profile_picture || null;
  const [birthday, setBirthday] = useState("No disponible");

  useEffect(() => {
    const fetchUserData = async () => {
      const userData = await getUserData();
      if (userData) {
        setUser({
          name: `${userData.name} ${userData.first_last_name}`,
          email: userData.email,
          profile_picture: userData.profile_picture || null,
        });

        setDireccion(userData.address || "");
        setTelefono(userData.phone || "");
        setSelectedGender(userData.gender_name || "");
        setTipoDocumento(userData.type_document_name || "");
        setNumeroDocumento(userData.document_number?.toString() || "");
        setCorreo(userData.email || "");
        setBirthday(userData.birthday || "No disponible");
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Encabezado reutilizable */}
          <CustomHeader title="Ver perfil" backRoute="/(tabs)/profile" />
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
            <View style={{ width: "100%" }}>
              <Text style={styles.label}>Tipo de Documento</Text>
              <CustomInput
                placeholder="Tipo de Documento"
                value={tipoDocumento}
                editable={false}
              />
            </View>

            <View style={{ width: "100%" }}>
              <Text style={styles.label}>Número de Documento</Text>
              <CustomInput
                placeholder="Número de Documento"
                value={numeroDocumento}
                editable={false}
              />
            </View>

            {/*<View style={{ width: "100%" }}>
              <Text style={styles.label}>Fecha de Nacimiento</Text>
              <CustomInput
                placeholder="Fecha de Nacimiento"
                value={birthday}
                editable={false}
              />
            </View>*/}

            <View style={{ width: "100%" }}>
              <Text style={styles.label}>Correo Electrónico</Text>
              <CustomInput
                placeholder="Correo Electrónico"
                value={correo}
                editable={false}
              />
            </View>

            <View style={{ width: "100%" }}>
              <Text style={styles.label}>Dirección</Text>
              <CustomInput
                placeholder="Dirección"
                value={direccion}
                editable={false}
              />
            </View>

            <View style={{ width: "100%" }}>
              <Text style={styles.label}>Teléfono</Text>
              <CustomInput
                placeholder="Teléfono"
                value={telefono}
                editable={false}
              />
            </View>

            <View style={{ width: "100%" }}>
              <Text style={styles.label}>Género</Text>
              <CustomInput
                placeholder="Género"
                value={selectedGender}
                editable={false}
              />
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
    alignItems: "flex-start",
    justifyContent: "flex-start",
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
});

export default SeeProfile;
