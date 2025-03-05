import React, { useState } from "react";
import {
  View,
  Text,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { colors } from "../../config/theme";
import { typography } from "../../config/typography";
import Button from "../../components/Button";
import CustomInput from "../../components/CustomInput";
import DropdownPicker from "@/components/Dropdown";
import Header from "../../components/Header";
import { TextInput } from "react-native";

export default function completeInfo() {
  const router = useRouter();
  const [birthday, setBirthday] = useState<Date | null>(null);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [typePerson, setTypePerson] = useState("");
  const [gender, setGender] = useState("");
  const [imageName, setImageName] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleNext = async () => {
    if (!birthday || !phone || !address || typePerson === "" || gender === "") {
      Alert.alert(
        "Campos incompletos",
        "Por favor, completa todos los campos obligatorios antes de continuar."
      );
      return;
    }

    try {
      // Simula el envío de datos al backend
      const response = await fakeApiCall();

      if ((response as { success: boolean }).success) {
        router.push("/updateSuccess");
      } else {
        router.push("/updateError");
      }
    } catch (error) {
      console.error("Error al actualizar:", error);
      router.push("/updateError");
    }
  };

  // Simulación de una API
  const fakeApiCall = async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true }); // true: éxito, false: error
      }, 1500);
    });
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const uriParts = result.assets[0].uri.split("/");
      setImageName(uriParts[uriParts.length - 1]);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.formContainer}>
            <Text style={styles.title}>Completa tu perfil</Text>
            <Text style={styles.subtitle}>
              Para continuar, por favor ingresa los siguientes datos y asegúrate
              de que tu información sea correcta.
            </Text>

            {/* Fecha de nacimiento */}
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={styles.dateInput}
            >
              <Text style={styles.dateText}>
                {birthday
                  ? birthday.toLocaleDateString()
                  : "fecha de nacimiento *"}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={birthday || new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                maximumDate={new Date()} // Evita fechas futuras
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) setBirthday(selectedDate);
                }}
              />
            )}

            <CustomInput
              placeholder="Teléfono *"
              keyboardType="phone-pad"
              value={phone}
              style={styles.input}
              onChangeText={(text) => {
                if (text.length <= 10) {
                  setPhone(text);
                }
              }}
            />

            <TextInput
              placeholder="Dirección de correspondencia *"
              value={address}
              multiline={true}
              maxLength={128}
              onChangeText={setAddress}
              style={[styles.input, styles.addressInput]}
            />

            <DropdownPicker
              selectedValue={typePerson}
              onValueChange={(value) => setTypePerson(value)}
              options={[
                { label: "Tipo de persona *", value: "" },
                { label: "Natural", value: "Natural" },
                { label: "Jurídico", value: "Juridico" },
              ]}
            />

            <DropdownPicker
              selectedValue={gender}
              onValueChange={(value) => setGender(value)}
              options={[
                { label: "Género *", value: "" },
                { label: "Femenino", value: "Femenino" },
                { label: "Masculino", value: "Masculino" },
                { label: "Otro", value: "Otro" },
              ]}
            />

            {/* Seccion de imagen */}
            <Text style={styles.subtitle}>
              Subir una foto de perfil (Opcional)
            </Text>
            <View style={styles.imageUploadContainer}>
              <Text style={styles.uploadText}>
                {imageName
                  ? "Imagen seleccionada"
                  : "Selecciona la imagen aquí"}
              </Text>
              <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                <Text style={styles.uploadText}>Subir</Text>
              </TouchableOpacity>
            </View>

            {imageName && <Text style={styles.fileName}>{imageName}</Text>}
          </View>

          {/* Botón de siguiente */}
          <View style={styles.footerContainer}>
            <Button text="Siguiente" onPress={handleNext} />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.base,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 16,
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
    paddingHorizontal: 20,
    alignItems: "flex-start",
    justifyContent: "flex-start",
    backgroundColor: colors.base,
  },
  inputRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },
  title: {
    ...typography.semibold.big,
    alignSelf: "flex-start",
  },
  subtitle: {
    ...typography.medium.regular,
    color: colors.gray,
    textAlign: "left",
  },
  footerContainer: {
    width: "100%",
    marginTop: 2,
    paddingTop: 32,
    paddingBottom: 8,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  uploadButton: {
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    alignItems: "center",
    paddingHorizontal: 18,
    backgroundColor: colors.base,
  },
  uploadText: {
    ...typography.medium.regular,
    color: colors.gray,
  },
  fileName: {
    marginTop: 5,
    textAlign: "center",
    color: colors.primary,
    ...typography.medium.regular,
  },
  dateInput: {
    width: "100%",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 15,
    backgroundColor: colors.white,
    justifyContent: "center",
  },
  dateText: {
    color: colors.gray,
    ...typography.medium.regular,
  },
  imageUploadContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 15,
    paddingVertical: 8,
    paddingHorizontal: 10,
    color: colors.gray,
    backgroundColor: colors.white,
    ...typography.medium.regular,
    justifyContent: "space-between",
  },
  imagePickerButton: {
    flex: 1,
  },

  disabledButton: {
    backgroundColor: colors.base,
  },
  disabledText: {
    color: colors.gray,
  },
  addressInput: {
    minHeight: 50,
    maxHeight: 100,
    textAlignVertical: "top",
    minWidth: "100%",
    flexShrink: 1,
  },

  input: {
    height: 50,
    padding: 15,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 15,
    backgroundColor: colors.white,
    ...typography.medium.regular,
    color: colors.gray,
  },
});
