import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AntDesign } from "@expo/vector-icons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { typography } from "@/config/typography";
import { colors } from "@/config/theme";
import Button from "@/components/Button";
import DropdownPicker from "@/components/Dropdown";
import CustomInput from "@/components/CustomInput";

const UpdateProfile = () => {
  const router = useRouter();
  const [selectedGender, setSelectedGender] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.container}>
              <View style={styles.customHeader}>
                <TouchableOpacity
                  onPress={() => router.push("/(tabs)/profile")}
                  style={styles.backButton}
                >
                  <AntDesign name="left" size={22} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Editar Datos</Text>
              </View>

              <View style={styles.content}>
                <Image
                  source={{
                    uri: "https://randomuser.me/api/portraits/women/43.jpg",
                  }}
                  style={styles.avatar}
                />
                <Text style={styles.name}>Laura Martinez</Text>

                <Text style={styles.label}>Dirección</Text>
                <View style={styles.inputWithIcon}>
                  <CustomInput
                    placeholder="Cll 44 #24-41"
                    value={direccion}
                    onChangeText={setDireccion}
                  />
                  <TouchableOpacity style={styles.editIcon} onPress={() => {}}>
                    <MaterialIcons name="edit" size={24} color="black" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.label}>Teléfono</Text>
                <View style={styles.inputWithIcon}>
                  <CustomInput
                    placeholder="3124447777"
                    value={telefono}
                    onChangeText={(text) => {
                      const numericValue = text.replace(/[^0-9]/g, ""); // Filtra solo números
                      setTelefono(numericValue);
                    }}
                    keyboardType="numeric"
                  />
                  <TouchableOpacity style={styles.editIcon} onPress={() => {}}>
                    <MaterialIcons name="edit" size={24} color="black" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.label}>Género</Text>
                <DropdownPicker
                  selectedValue={selectedGender}
                  onValueChange={(itemValue) => setSelectedGender(itemValue)}
                  options={[
                    { label: "Masculino", value: "Masculino" },
                    { label: "Femenino", value: "Femenino" },
                    { label: "Otro", value: "Otro" },
                  ]}
                />
              </View>

              <View style={styles.buttonContainer}>
                <Button text="Actualizar" onPress={() => {}} />
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

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
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 20,
    backgroundColor: "#F9F9FA",
  },
  customHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    ...typography.medium.big,
    color: colors.darkGray,
    marginRight: 40,
  },
  content: {
    flex: 1,
  },
  name: {
    textAlign: "center",
    marginBottom: 20,
    ...typography.medium.medium,
    color: colors.darkGray,
  },
  label: {
    marginBottom: 5,
    ...typography.medium.medium,
    color: colors.gray,
  },
  inputWithIcon: {
    position: "relative",
    marginBottom: 15,
  },
  editIcon: {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: [{ translateY: -10 }],
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 50,
    alignSelf: "center",
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "#ccc",
  },
  buttonContainer: {
    alignItems: "center",
    marginTop: 20,
  },
});

export default UpdateProfile;
