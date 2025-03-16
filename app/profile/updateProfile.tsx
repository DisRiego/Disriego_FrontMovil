import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { typography } from "@/config/typography";
import { colors } from "@/config/theme";
import CustomInput from "@/components/CustomInput";
import { SafeAreaView } from "react-native-safe-area-context";
import { Svg, Circle, Text as SvgText } from "react-native-svg";
import DropdownPicker from "@/components/Dropdown";
import { getUserData } from "@/services/auth";
import CustomHeader from "@/components/CustomHeader";

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
  const [selectedGender, setSelectedGender] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [user, setUser] = useState<{
    name: string;
    email: string;
    profile_picture?: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const profilePicture = user?.profile_picture || null;

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
        setSelectedGender(userData.gender_name || "");
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <CustomHeader title="Ver perfil" backRoute="/(tabs)/profile" />

          <View style={styles.pictureContainer}>
            {profilePicture && !imageLoaded ? (
              // Mientras la imagen carga, muestra el círculo de color sin iniciales
              <Svg height="60" width="60" style={{ marginBottom: 8 }}>
                <Circle
                  cx="30"
                  cy="30"
                  r="30"
                  fill={getColorFromName(user?.name || "Usuario")}
                />
              </Svg>
            ) : profilePicture ? (
              // Si hay imagen y cargó correctamente, se muestra
              <Image
                source={{ uri: profilePicture }}
                style={styles.profileImage}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageLoaded(false)}
              />
            ) : (
              // Si no hay imagen, se muestra el círculo de color con las iniciales
              <Svg
                height="45"
                width="45"
                style={{ marginRight: 15, marginBottom: 12 }}
              >
                <Circle
                  cx="22"
                  cy="22"
                  r="22"
                  fill={
                    loading
                      ? colors.base
                      : getColorFromName(user?.name || "Usuario")
                  }
                />
                {!loading && user?.name && (
                  <SvgText
                    x="22"
                    y="27"
                    textAnchor="middle"
                    fontSize="14"
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
              <Text style={styles.label}>Dirección</Text>
              <CustomInput
                placeholder="Dirección"
                value={direccion}
                onChangeText={setDireccion}
              />
            </View>

            <View style={{ width: "100%" }}>
              <Text style={styles.label}>Teléfono</Text>
              <CustomInput
                placeholder="Teléfono"
                value={telefono}
                onChangeText={(text) => {
                  const numericValue = text.replace(/[^0-9]/g, "");
                  setTelefono(numericValue);
                }}
                keyboardType="numeric"
              />
            </View>

            <View style={{ width: "100%" }}>
              <Text style={styles.label}>Género</Text>
              <DropdownPicker
                selectedValue={selectedGender}
                onValueChange={(itemValue) => setSelectedGender(itemValue)}
                options={[
                  { label: "Masculino", value: "Masculino" },
                  { label: "Femenino", value: "Femenino" },
                  { label: "Otro", value: "Otro" },
                ]}
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
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 24,
  },
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
    alignItems: "flex-start",
    justifyContent: "flex-start",
    backgroundColor: colors.base,
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
    justifyContent: "center",
    marginVertical: 20,
  },
});

export default UpdateProfile;
