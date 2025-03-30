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

/**
 * WelcomeScreen
 * Pantalla de bienvenida de la aplicación.
 * Verifica el estado de autenticación y muestra diferentes opciones según el resultado.
 *
 * @returns {JSX.Element|null} Componente de pantalla de bienvenida o null mientras verifica autenticación.
 */
export default function WelcomeScreen() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  /**
   * Verifica si existe un token de autenticación válido.
   * Actualiza el estado local `isAuthenticated`.
   */
  useEffect(() => {
    const checkAuth = async () => {
      const token = await getToken();
      setIsAuthenticated(!!token);
    };

    checkAuth();
  }, []);

  /**
   * Redirige al usuario autenticado a la pantalla principal (home).
   */
  const handleContinue = () => {
    router.replace("/(tabs)/home");
  };

  if (isAuthenticated === null) return null;

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView contentContainerStyle={{ height: "100%" }}>
        <View style={styles.container}>
          {/* Logo de la aplicación */}
          <Image
            source={require("../assets/images/logo.png")}
            style={styles.logo}
          />

          {/* Imagen principal de bienvenida */}
          <Image
            source={require("../assets/images/welcome.png")}
            style={styles.image}
          />

          {/* Título de bienvenida */}
          <Text style={styles.title}>¡Bienvenido a DisRiego!</Text>

          {/* Subtítulo según autenticación */}
          <Text style={styles.subtitle}>
            {isAuthenticated
              ? "¡Ya estás autenticado! Haz clic en 'Continuar' para acceder."
              : "Para acceder a todas las funcionalidades, por favor regístrate o inicia sesión con tu cuenta."}
          </Text>

          {/* Botones condicionales */}
          {isAuthenticated ? (
            <NavigationButton
              text="Continuar"
              color={colors.tertiary}
              textColor={colors.primary}
              borderColor={colors.secondary}
              onPress={handleContinue}
              route="/(tabs)/home"
            />
          ) : (
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

/**
 * Estilos para los componentes de la pantalla de bienvenida.
 */
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
