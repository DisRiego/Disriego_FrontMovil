import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeContainer}>
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
          Para acceder a todas las funcionalidades de la aplicación, por favor
          regístrate o inicia sesión con tu cuenta.
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  logo: {
    width: 130, // Logo más pequeño
    height: 33,
    resizeMode: "contain",
    marginBottom: 25,
  },
  image: {
    width: 400, // Imagen más grande
    height: 350,
    resizeMode: "contain",
    marginBottom: 15,
  },
  title: {
    fontSize: 27,
    fontFamily: "RobotoSemiBold",
    textAlign: "center",
    marginBottom: 5,
  },
  brand: {
    color: "#2A6041",
  },
  subtitle: {
    fontSize: 15,
    fontFamily: "RobotoRegular",
    textAlign: "center",
    color: "#666",
    marginBottom: 25,
    paddingHorizontal: 15,
  },
  registerButton: {
    width: "90%",
    padding: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "#fff",
    shadowColor: "#ccc",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  registerText: {
    color: "#595959",
    fontSize: 18,
    fontFamily: "RobotoSemiBold",
  },
  loginButton: {
    width: "90%",
    padding: 15,
    backgroundColor: "#C3E37C",
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#C3E37C",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  loginText: {
    color: "#2A6041",
    fontSize: 18,
    fontFamily: "RobotoSemiBold",
  },
});
