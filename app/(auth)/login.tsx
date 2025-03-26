import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  Alert,
  StyleSheet,
  SafeAreaView,
  Image,
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
import LoginButton from "@/components/LoginButton";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Eye, EyeOff } from "lucide-react-native";
import axios from "axios";
import { API_URL } from "@/services/config";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const checkFirstLogin = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const isFirstLogin = await AsyncStorage.getItem("isFirstLogin");

        console.log("Token almacenado:", token);
        console.log("Es primer login:", isFirstLogin);

        // Si hay token pero no se ha establecido isFirstLogin, considerarlo primer login
        if (token && (isFirstLogin === null || isFirstLogin === undefined)) {
          await AsyncStorage.setItem("isFirstLogin", "true");
          router.replace("/completeInfo");
          return;
        }

        // Si hay token y ya no es primer login, redirigir al home
        if (token && isFirstLogin === "false") {
          router.replace("(tabs)/home");
        }
      } catch (error) {
        console.error("Error al verificar el primer login:", error);
      }
    };

    checkFirstLogin();
  }, [router]);

  // Función para enviar correo de activación
  const sendActivationEmail = async (
    email: string,
    activationToken: string
  ) => {
    try {
      console.log("Token de activación a usar:", activationToken);

      // URL de activación que se incluirá en el correo
      const activationUrl = `http://localhost:5173/signup/${activationToken}`;

      // Configuración del servicio de correo EmailJS
      const payload = {
        service_id: "service_c35ss8k", // ID del servicio EmailJS
        template_id: "template_redcikh", // ID de la plantilla EmailJS
        user_id: "hMGKOWPvqqS5l9Qsf", // Clave pública de EmailJS
        accessToken: "Qm3WiVQBa3J59N-sE7iKa", // Clave privada de EmailJS
        template_params: {
          to_name: "Usuario",
          to_email: email,
          message: `Para activar tu cuenta, haz clic en el siguiente enlace: ${activationUrl}`,
          reply_to: email,
        },
      };

      console.log("Correo a enviar:", JSON.stringify(payload, null, 2));

      // Envío del correo a través de la API de EmailJS
      const emailResponse = await fetch(
        "https://api.emailjs.com/api/v1.0/email/send",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const responseText = await emailResponse.text();
      console.log("Respuesta del servidor de correo:", responseText);

      if (!emailResponse.ok) {
        throw new Error(responseText);
      }

      console.log("Correo enviado exitosamente.");
      return true;
    } catch (error) {
      console.error("Error al enviar el correo:", error);
      return false;
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Faltan campos por completar.");
      return;
    }

    setLoading(true);
    try {
      const token = await login(email, password);
      console.log("Token obtenido:", token);

      // Obtener datos de usuario completos
      const userDataString = await AsyncStorage.getItem("userData");
      const userData = userDataString ? JSON.parse(userDataString) : null;

      console.log("Datos de usuario completos:", userData);
      console.log("first_login_complete:", userData?.first_login_complete);

      if (token) {
        const firstLoginComplete = await AsyncStorage.getItem(
          "first_login_complete"
        );

        if (firstLoginComplete === "false") {
          router.replace("/completeInfo");
        } else {
          router.replace("(tabs)/home");
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error de login:", error.message);
      } else {
        console.error("Error de login:", error);
      }

      // Manejar caso específico de cuenta no activada
      if (
        error instanceof Error &&
        error.message.includes("Cuenta no activada")
      ) {
        // Obtener el token de activación desde AsyncStorage que el servicio de auth debió guardar
        const activationToken = await AsyncStorage.getItem("activation_token");

        if (activationToken) {
          // Intentar enviar el correo de activación
          const emailSent = await sendActivationEmail(email, activationToken);

          if (emailSent) {
            Alert.alert(
              "Cuenta no activada",
              "Se ha enviado un correo con el enlace de activación a su dirección de email. Por favor, revise su bandeja de entrada."
            );
          } else {
            Alert.alert(
              "Error al enviar correo",
              "No se pudo enviar el correo de activación. Inténtelo de nuevo más tarde."
            );
          }
        } else {
          Alert.alert(
            "Error de activación",
            "No se encontró el token de activación. Por favor, intente registrarse nuevamente."
          );
        }
      } else if (
        error instanceof Error &&
        error.message.includes("Cuenta inactiva o bloqueada")
      ) {
        Alert.alert(
          "Cuenta bloqueada",
          "Su cuenta está inactiva o bloqueada. Por favor contacte con soporte."
        );
      } else {
        Alert.alert("Error", "Correo o contraseña incorrectos.");
        setEmailError(true);
        setPasswordError(true);
      }
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
                    onPress={() => router.push("/register")}
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

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.base },
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
