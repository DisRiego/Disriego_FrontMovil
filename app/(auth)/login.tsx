import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  Alert,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
} from "react-native";
import { login } from "@/services/auth";
import { colors } from "@/config/theme";
import { typography } from "@/config/typography";
import Button from "@/components/Button";
import CustomInput from "@/components/CustomInput";
import Header from "@/components/Header";
// import LoginButton from "@/components/LoginButton";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Eye, EyeOff } from "lucide-react-native";

/**
 * Pantalla de inicio de sesión que permite a los usuarios acceder a su cuenta
 * Verifica si ya hay una sesión activa y redirecciona según corresponda
 */
export default function LoginScreen() {
  const router = useRouter();

  // Estados para los campos del formulario
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Estados para manejo de errores
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  // Estado para controlar la carga durante la petición
  const [loading, setLoading] = useState(false);

  /**
   * Verifica si existe una sesión activa al cargar la pantalla
   * Redirecciona al usuario según su estado de registro
   */
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const firstLogin = await AsyncStorage.getItem("first_login");

        console.log(
          "Token almacenado:",
          token ? token : "No hay token guardado"
        );
        console.log("First Login:", firstLogin);

        if (token) {
          if (firstLogin === "false") {
            router.replace("/completeInfo");
          } else {
            router.replace("(tabs)/home");
          }
        }
      } catch (error) {
        console.error("Error al verificar el estado de sesión:", error);
      }
    };

    checkLoginStatus();
  }, [router]);

  /**
   * Maneja el proceso de inicio de sesión
   * Valida campos, realiza la petición y redirecciona según el resultado
   */
  const handleLogin = async () => {
    // Validación de campos
    if (!email || !password) {
      Alert.alert(
        "Error",
        "Por favor, completa todos los campos obligatorios."
      );
      return;
    }

    setLoading(true);
    try {
      // Llamada al servicio de autenticación
      const { token, first_login } = await login(email, password);

      if (token) {
        Alert.alert("Éxito", "Inicio de sesión exitoso.");
        router.replace(first_login ? "/completeInfo" : "(tabs)/home");
      } else {
        throw new Error("Credenciales incorrectas.");
      }
    } catch (error) {
      Alert.alert("Error", "Correo o contraseña incorrectos.");
      setEmailError(true);
      setPasswordError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />
      <View style={styles.container}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
              {/* Contenedor del formulario */}
              <View style={styles.formContainer}>
                <Text
                  style={[typography.semibold.big, { color: colors.darkGray }]}
                >
                  Iniciar Sesión
                </Text>
                <Text
                  style={[typography.medium.regular, { color: colors.gray }]}
                >
                  Por favor, introduce tu correo y contraseña para acceder a tu
                  cuenta.
                </Text>

                {/* Input de correo electrónico */}
                <CustomInput
                  placeholder="Correo Electrónico"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setEmailError(false);
                  }}
                  placeholderTextColor={emailError ? colors.error : colors.gray}
                  style={[emailError && styles.inputError]}
                />

                {/* Input de contraseña con toggle para mostrar/ocultar */}
                <CustomInput
                  placeholder="Contraseña"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setPasswordError(false);
                  }}
                  placeholderTextColor={
                    passwordError ? colors.error : colors.gray
                  }
                  style={[passwordError && styles.inputError]}
                  iconRight={
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff size={20} color={colors.border} />
                      ) : (
                        <Eye size={20} color={colors.border} />
                      )}
                    </TouchableOpacity>
                  }
                />

                {/* Enlace para recuperar contraseña */}
                <View style={styles.forgotPasswordContainer}>
                  <Text
                    style={[typography.medium.regular, { color: colors.gray }]}
                  >
                    ¿Olvidaste la contraseña?
                    <Text
                      style={[typography.medium.regular, styles.link]}
                      onPress={() => router.push("/forgotPassword")}
                    >
                      {" "}
                      Haz clic aquí
                    </Text>
                  </Text>
                </View>

                {/* 
                Sección de inicio de sesión con proveedores (Google/Outlook)
                Actualmente desactivada
                
                <Image
                  source={require("../../assets/images/divisor.png")}
                  style={styles.divisor}
                />

                <View style={styles.loginWrapper}>
                  <LoginButton
                    text="Ingresa con Google"
                    icon={require("../../assets/images/googleLogo.png")}
                    onPress={() => console.log("Google Login")}
                  />
                  <LoginButton
                    text="Ingresa con Outlook"
                    icon={require("../../assets/images/outlookLogo.png")}
                    onPress={() => console.log("Outlook Login")}
                  />
                </View>
                */}
              </View>

              {/* Pie de página con botón de inicio de sesión y enlace de registro */}
              <View style={styles.footerContainer}>
                <Button
                  text={
                    loading ? (
                      <ActivityIndicator size={28} color={colors.primary} />
                    ) : (
                      "Iniciar Sesión"
                    )
                  }
                  onPress={handleLogin}
                  disabled={loading}
                />
                <Text
                  style={[typography.medium.regular, { color: colors.gray }]}
                >
                  ¿No tienes una cuenta?
                  <Text
                    style={styles.link}
                    onPress={() => router.push("/validation")}
                  >
                    {" "}
                    Regístrate aquí
                  </Text>
                </Text>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </View>
    </SafeAreaView>
  );
}

/**
 * Estilos para los componentes de la pantalla de inicio de sesión
 */
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.base,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: colors.base,
  },
  formContainer: {
    flex: 1,
    gap: 14,
    width: "100%",
    paddingTop: 24,
    paddingHorizontal: 20,
    alignItems: "flex-start",
  },
  forgotPasswordContainer: {
    width: "100%",
    alignItems: "center",
    marginVertical: 4,
  },
  loginWrapper: {
    marginTop: 4,
    width: "100%",
  },
  footerContainer: {
    width: "100%",
    marginTop: 2,
    paddingTop: 24,
    paddingBottom: 32,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  link: {
    ...typography.bold.regular,
    color: colors.accent,
  },
  divisor: {
    width: "100%",
    height: 18,
    resizeMode: "contain",
  },
  inputError: {
    borderColor: colors.error,
  },
});
