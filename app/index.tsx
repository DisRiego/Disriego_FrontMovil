import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import NavigationButton from "@/components/NavigationButton";
import { colors } from "@/config/theme";
import { typography } from "@/config/typography";
import { getToken } from "@/services/auth";

export default function WelcomeScreen() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await getToken();
      setIsAuthenticated(!!token);

      if (token) {
        router.replace("/(tabs)/home");
      }
    };

    checkAuth();
  }, [router]);

  if (isAuthenticated === null) return null;

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView contentContainerStyle={{ height: "100%" }}>
        <View style={styles.container}>
          <Image
            source={require("../assets/images/logo.png")}
            style={styles.logo}
          />
          <Image
            source={require("../assets/images/welcome.png")}
            style={styles.image}
          />
          <Text style={styles.title}>¡Bienvenido a DisRiego!</Text>
          <Text style={styles.subtitle}>
            Para acceder a todas las funcionalidades, por favor regístrate o
            inicia sesión con tu cuenta.
          </Text>
          {!isAuthenticated && (
            <>
              <NavigationButton
                text="Registrarse"
                color={colors.base}
                textColor={colors.gray}
                borderColor={colors.border}
                route="/validation"
              />
              <NavigationButton
                text="Iniciar Sesión"
                color={colors.tertiary}
                textColor={colors.primary}
                borderColor={colors.tertiary}
                route="/login"
              />
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  logo: {
    width: 130,
    height: 33,
    resizeMode: "contain",
    marginBottom: 25,
  },
  image: {
    width: 300,
    height: 320,
    resizeMode: "contain",
    marginBottom: 15,
  },
  title: {
    ...typography.bold.big,
    fontSize: 27,
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    ...typography.regular.large,
    color: colors.gray,
    textAlign: "center",
    paddingHorizontal: 24,
    marginBottom: 50,
  },
});
