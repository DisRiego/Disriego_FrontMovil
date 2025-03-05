import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { colors } from "@/config/theme";
import { typography } from "@/config/typography";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView contentContainerStyle={{ height: "100%" }}>
        <View style={styles.container}>
          {/* Logo más pequeño */}
          <Image
            source={require("../assets/images/logo.png")}
            style={styles.logo}
          />

          {/* Imagen principal más grande */}
          <Image
            source={require("../assets/images/welcome.png")}
            style={styles.image}
          />

          <Text style={styles.title}>
            Bienvenido a <Text style={styles.brand}>DisRiego!</Text>
          </Text>

          <Text style={styles.subtitle}>
            Para acceder a todas las funcionalidades, por favor regístrate o
            inicia sesión con tu cuenta.
          </Text>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => router.push("/register")}
          >
            <Text style={styles.registerText}>Registrarse</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.loginText}>Iniciar Sesión</Text>
          </TouchableOpacity>
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
    width: 400,
    height: 350,
    resizeMode: "contain",
    marginBottom: 15,
  },
  title: {
    ...typography.bold.big,
    fontSize: 27,
    textAlign: "center",
    marginBottom: 5,
  },
  brand: {
    color: colors.primary,
  },
  subtitle: {
    ...typography.medium.regular,
    color: colors.gray,
    textAlign: "center",
    paddingHorizontal: 15,
    marginBottom: 25,
  },
  registerButton: {
    width: "90%",
    padding: 15,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 15,
    backgroundColor: colors.base,
    shadowColor: colors.border,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    marginBottom: 20,
  },
  registerText: {
    ...typography.semibold.large,
    color: colors.gray,
  },
  loginButton: {
    width: "90%",
    padding: 15,
    alignItems: "center",
    borderRadius: 15,
    backgroundColor: colors.tertiary,
    shadowColor: colors.tertiary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  loginText: {
    ...typography.semibold.large,
    color: colors.primary,
  },
});
