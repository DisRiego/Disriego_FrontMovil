import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { logout, getUserData } from "@/services/auth";
import { colors } from "@/config/theme";
import { typography } from "@/config/typography";
import { Svg, Circle, Text as SvgText } from "react-native-svg";

/**
 * Obtiene las iniciales del nombre del usuario
 */
const getInitials = (name: string) => {
  if (!name) return ""; // 'U' de usuario
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
  const color = `hsl(${hash % 360}, 60%, 50%)`; // Genera un color único
  return color;
};

const Profile = () => {
  const [user, setUser] = useState<{
    name: string;
    email: string;
    profile_picture?: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const userData = await getUserData();
      if (userData) {
        setUser({
          name: `${userData.name} ${userData.first_last_name}`,
          email: userData.email,
          profile_picture: userData.profile_picture || null,
        });
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={[typography.semibold.big, styles.title]}>Mi perfil</Text>

        {/* Información del usuario */}
        <View style={styles.userInfo}>
          {user ? (
            user.profile_picture ? (
              <Image
                source={{ uri: user.profile_picture }}
                style={styles.avatar}
              />
            ) : (
              <Svg width={50} height={50} viewBox="0 0 50 50">
                <Circle
                  cx="25"
                  cy="25"
                  r="25"
                  fill={getColorFromName(user?.name || "")}
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
                  {getInitials(user?.name || "")}
                </SvgText>
              </Svg>
            )
          ) : (
            // Mostrar un círculo gris como placeholder
            <Svg width={50} height={50} viewBox="0 0 50 50">
              <Circle cx="25" cy="25" r="25" fill={colors.base} />
            </Svg>
          )}

          <View style={styles.userDetails}>
            {loading ? (
              <ActivityIndicator size="small" color={colors.gray} />
            ) : (
              <>
                <Text style={styles.name}>{user?.name || "Usuario"}</Text>
                <Text style={styles.email}>
                  {user?.email || "email@ejemplo.com"}
                </Text>
              </>
            )}
          </View>
          <TouchableOpacity>
            <Ionicons name="eye" size={28} color={colors.gray} />
          </TouchableOpacity>
        </View>

        {/* Sección General */}
        <View style={styles.generalContainer}>
          <Text style={styles.sectionTitle}>General</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.option}
              onPress={() => router.push("/profile/updateProfile")}
            >
              <Ionicons
                name="person-circle-outline"
                size={26}
                color={colors.gray}
              />
              <View style={styles.textContainer}>
                <Text style={styles.optionTitle}>Editar Datos</Text>
                <Text style={styles.optionDescription}>
                  Cambia o actualiza tu información personal
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color={colors.gray} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.option}
              onPress={() => router.push("/profile/updatePassword")}
            >
              <Ionicons
                name="lock-closed-outline"
                size={24}
                color={colors.gray}
              />
              <View style={styles.textContainer}>
                <Text style={styles.optionTitle}>Actualizar contraseña</Text>
                <Text style={styles.optionDescription}>
                  Cambia o actualiza tu contraseña
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color={colors.gray} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Sección Preferencias */}
        <View style={styles.generalContainer}>
          <Text style={styles.sectionTitle}>Preferencias</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.option}
              onPress={() => router.push("/profile/accesibility")}
            >
              <Ionicons
                name="hand-left-outline"
                size={24}
                color={colors.gray}
              />
              <View style={styles.textContainer}>
                <Text style={styles.optionTitle}>Accesibilidad</Text>
                <Text style={styles.optionDescription}>
                  Cambia tus preferencias según necesites
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color={colors.gray} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.option} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={24} color={colors.gray} />
              <View style={styles.textContainer}>
                <Text style={styles.optionTitle}>Cerrar sesión</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.base,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    color: colors.darkGray,
    marginBottom: 24,
    textAlign: "center",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  userDetails: {
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
  },
  email: {
    fontSize: 14,
    color: "gray",
  },
  generalContainer: {
    marginTop: 24,
  },
  sectionTitle: {
    ...typography.semibold.medium,
    color: colors.darkGray,
    marginBottom: 8,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 15,
    paddingVertical: 8,
    paddingHorizontal: 12,
    shadowColor: colors.gray,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
    marginVertical: 2,
  },
  optionTitle: {
    ...typography.medium.regular,
    color: colors.darkGray,
  },
  optionDescription: {
    ...typography.regular.medium,
    color: colors.gray,
  },
});

export default Profile;
