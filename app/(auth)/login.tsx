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

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        console.log(
          "Token almacenado:",
          token ? token : "No hay token guardado"
        );

        // Si hay token almacenado, redirigir al home
        if (token) {
          router.replace("(tabs)/home");
        }
      } catch (error) {
        console.error("Error al verificar el token:", error);
      }
    };

    checkToken();
  }, [router]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Faltan campos por completar.");
      return;
    }

    setLoading(true);
    try {
      const token = await login(email, password);
      console.log("Token obtenido:", token);

      if (token) {
        await AsyncStorage.setItem("token", token);
        Alert.alert("Éxito", "Inicio de sesión exitoso.");
        router.replace("(tabs)/home");
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
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.formContainer}>
            <Text style={[typography.semibold.big, { color: colors.darkGray }]}>
              Iniciar Sesión
            </Text>
            <Text style={[typography.medium.regular, { color: colors.gray }]}>
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
              placeholderTextColor={passwordError ? colors.error : colors.gray}
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
              <Text style={[typography.medium.regular, { color: colors.gray }]}>
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
            <Text style={[typography.medium.regular, { color: colors.gray }]}>
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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.base },
  scrollContainer: { flexGrow: 1 },
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
  loginWrapper: { marginTop: 4, width: "100%" },
  footerContainer: {
    width: "100%",
    marginTop: 2,
    paddingTop: 24,
    paddingBottom: 32,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  link: { ...typography.bold.regular, color: colors.accent },
  divisor: { width: "100%", height: 18, resizeMode: "contain" },
  inputError: { borderColor: colors.error },
});
