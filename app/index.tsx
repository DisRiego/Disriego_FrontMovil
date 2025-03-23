// Importaciones de React y sus hooks
import React, { useEffect, useState } from "react";

// Importaciones de componentes nativos
import {
  View,
  Text,
  Image,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from "react-native";

// Importaciones de navegación
import { useRouter } from "expo-router";

// Importaciones de componentes personalizados
import NavigationButton from "@/components/NavigationButton";

// Importaciones de configuración y servicios
import { colors } from "@/config/theme";
import { typography } from "@/config/typography";
import { getToken } from "@/services/auth";

/**
 * WelcomeScreen - Pantalla de bienvenida de la aplicación
 * Verifica el estado de autenticación y muestra diferentes opciones según el resultado
 * @returns {JSX.Element|null} Componente de pantalla de bienvenida o null mientras verifica autenticación
 */
export default function WelcomeScreen() {
  // Inicialización del router para navegación
  const router = useRouter();

  // Estado para controlar si el usuario está autenticado
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Efecto para verificar la autenticación al cargar la pantalla
  useEffect(() => {
    /**
     * Verifica si existe un token de autenticación válido
     */
    const checkAuth = async () => {
      const token = await getToken();
      setIsAuthenticated(!!token);
    };

    checkAuth();
  }, []);

  /**
   * Maneja la acción de continuar para usuarios autenticados
   * Redirige al usuario a la pantalla principal
   */
  const handleContinue = () => {
    router.replace("/(tabs)/home");
  };

  // Muestra nada mientras se verifica el estado de autenticación
  if (isAuthenticated === null) {
    return null;
  }

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

          {/* Mensaje condicional según estado de autenticación */}
          <Text style={styles.subtitle}>
            {isAuthenticated
              ? "¡Ya estás autenticado! Haz clic en 'Continuar' para acceder."
              : "Para acceder a todas las funcionalidades, por favor regístrate o inicia sesión con tu cuenta."}
          </Text>

          {/* Renderizado condicional de botones según estado de autenticación */}
          {isAuthenticated ? (
            // Botón de Continuar cuando está autenticado
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
              {/* Botón de Registro para usuarios no autenticados */}
              <NavigationButton
                text="Registrarse"
                color={colors.base}
                textColor={colors.gray}
                borderColor={colors.border}
                route="/validation"
              />

              {/* Botón de Inicio de Sesión para usuarios no autenticados */}
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
 * Estilos para los componentes de la pantalla de bienvenida
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
