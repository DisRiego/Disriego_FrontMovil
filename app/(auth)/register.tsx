import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { useState } from "react";
import { useRouter, Stack } from "expo-router";
import { colors } from "@/config/theme";
import { typography } from "@/config/typography";
import Button from "@/components/Button";
import DropdownPicker from "@/components/Dropdown";
import CustomInput from "@/components/CustomInput";
import Header from "@/components/Header";

export default function RegisterScreen() {
  const router = useRouter();
  const [documentType, setDocumentType] = useState("CC");

  function handleRegister(): void {
    throw new Error("Function not implemented.");
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />
      <View style={styles.container}>
        <View style={styles.formContainer}>
          <Text style={[typography.semibold.big, { color: colors.darkGray }]}>
            Registrarse
          </Text>
          <Text style={[typography.medium.regular, { color: colors.gray }]}>
            Por favor, proporcione la siguiente información para confirmar su
            registro en el sistema.
          </Text>
          <View style={styles.inputRow}>
            <View style={{ width: "30%" }}>
              <DropdownPicker
                selectedValue={documentType}
                onValueChange={setDocumentType}
                options={[
                  { label: "Cedula Ciudadanía", value: "C.C" },
                  { label: "Tarjeta Identidad", value: "T.I" },
                  { label: "Pasaporte", value: "Pasaporte" },
                ]}
              />
            </View>
            <CustomInput
              placeholder="No. de Identificación *"
              style={{ width: "65%" }}
            />
          </View>

          <CustomInput placeholder="Fecha de Expedición *" />
        </View>

        <View style={styles.footerContainer}>
          <Button text={"Registrarse"} onPress={handleRegister} />

          <Text style={[typography.medium.regular, { color: colors.gray }]}>
            ¿Tienes una cuenta?
            <Text style={styles.link} onPress={() => router.push("/login")}>
              {" "}
              Inicia sesión aquí
            </Text>
          </Text>
        </View>
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
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: colors.base,
  },
  formContainer: {
    flex: 1,
    gap: 16,
    width: "100%",
    paddingTop: 24,
    paddingHorizontal: 20,
    alignItems: "flex-start",
    justifyContent: "flex-start",
    backgroundColor: colors.base,
  },
  footerContainer: {
    width: "100%",
    marginTop: 2,
    paddingTop: 24,
    paddingBottom: 32,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  inputRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },
  link: {
    ...typography.bold.regular,
    color: colors.accent,
  },
});
