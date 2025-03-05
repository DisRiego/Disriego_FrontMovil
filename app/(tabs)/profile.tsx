import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/config/theme";
import { typography } from "@/config/typography";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const Profile = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={[typography.semibold.big, styles.title]}>Mi perfil</Text>

        {/* Información del usuario */}
        <View style={styles.userInfo}>
          <Image
            source={{
              uri: "https://randomuser.me/api/portraits/women/43.jpg",
            }}
            style={styles.avatar}
          />
          <View style={styles.userDetails}>
            <Text style={styles.name}>Laura Martinez</Text>
            <Text style={styles.email}>laura55@gmail.com</Text>
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
                <Text style={styles.optionTitle}>Actualiza la contraseña</Text>
                <Text style={styles.optionDescription}>
                  Cambia o actualiza tu contraseña
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color={colors.gray} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Sección preferencias */}
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

            <TouchableOpacity
              style={styles.option}
              onPress={() => router.replace("/login")}
            >
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
    justifyContent: "flex-start",
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
