import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { colors } from "@/config/theme";
import { typography } from "@/config/typography";
import { getUserData } from "@/services/auth";
import { Svg, Circle, Text as SvgText } from "react-native-svg";
import { usePermission } from "@/context/PermissionContext";

// Opciones del menú para usuarios normales
const menuItems = [
  {
    id: 1,
    label: "Mis predios y lotes",
    route: "/properties/myProperties",
    image: require("../../assets/images/properties.png"),
  },
  {
    id: 2,
    label: "Mis facturas y pagos",
    route: "/home/payments",
    image: require("../../assets/images/bills.png"),
  },
  {
    id: 3,
    label: "Mi consumo",
    route: "/home/consumption",
    image: require("../../assets/images/consumption.png"),
  },
  {
    id: 4,
    label: "Reportar fallos",
    route: "/reports/seeReports",
    image: require("../../assets/images/reports.png"),
  },
];

const getInitials = (name: string) => {
  if (!name) return "";
  const parts = name.split(" ");
  return parts.length > 1
    ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    : parts[0][0].toUpperCase();
};

export default function HomeScreen() {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [loading, setLoading] = useState(true);

  const { hasPermission, isLoaded } = usePermission();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = await getUserData();
        if (user) {
          setUsername(`${user.name} ${user.first_last_name}`);
          setProfileImage(user.profile_picture || null);
        } else {
          setUsername("Usuario");
        }
      } catch (error) {
        console.error("Error al obtener datos del usuario:", error);
        setUsername("Usuario");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const renderUserAvatar = () => {
    if (loading) {
      return (
        <ActivityIndicator
          size="small"
          color={colors.gray}
          style={{ marginRight: 15 }}
        />
      );
    }

    return (
      <View style={{ marginRight: 15 }}>
        <Svg width={50} height={50} viewBox="0 0 45 45">
          <Circle cx="22.5" cy="22.5" r="22.5" fill={colors.primary} />
          <SvgText
            x="50%"
            y="50%"
            textAnchor="middle"
            dy=".35em"
            fontSize="16"
            fontWeight="bold"
            fill="white"
          >
            {getInitials(username || "Usuario")}
          </SvgText>
        </Svg>

        {profileImage && (
          <Image
            source={{ uri: profileImage }}
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
        <View style={styles.welcomeSection}>
          {renderUserAvatar()}
          <View>
            <Text style={styles.welcomeText}>¡Bienvenido!</Text>
            <Text style={styles.username}>{username || "Usuario"}</Text>
          </View>
        </View>

        <Text style={styles.categoryTitle}>Explora las categorías</Text>

        {isLoaded ? (
          hasPermission("Ver reportes asignados") ? (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push("/maintenance/assignedReports")}
            >
              <Image
                source={require("../../assets/images/reports.png")}
                style={styles.cardImage}
              />
              <View style={styles.cardContent}>
                <Text style={styles.cardText}>Reportes asignados</Text>
                <Feather name="chevron-right" size={24} color="#595959" />
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.categoriesContainer}>
              {menuItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => router.push(item.route)}
                  style={styles.card}
                >
                  <Image source={item.image} style={styles.cardImage} />
                  <View style={styles.cardContent}>
                    <Text style={styles.cardText}>{item.label}</Text>
                    <Feather name="chevron-right" size={24} color="#595959" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.base,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  welcomeSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 10,
    shadowColor: "#B0B0B0",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 22.5,
  },
  welcomeText: {
    ...typography.bold.large,
  },
  username: {
    color: colors.gray,
    ...typography.regular.big,
  },
  categoryTitle: {
    ...typography.semibold.large,
    marginTop: 20,
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%",
  },
  card: {
    width: "48%",
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 10,
    marginTop: 20,
    alignItems: "center",
    shadowColor: colors.border,
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 2,
    elevation: 3,
  },
  cardImage: {
    width: 120,
    height: 90,
    marginBottom: 20,
    resizeMode: "contain",
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 5,
  },
  cardText: {
    color: colors.darkGray,
    ...typography.bold.regular,
    flex: 1,
  },
});
