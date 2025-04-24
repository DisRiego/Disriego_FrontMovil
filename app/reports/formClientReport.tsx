import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  StatusBar,
  Platform,
  Alert,
} from "react-native";
import DropdownPicker from "@/components/Dropdown";
import { colors } from "@/config/theme";
import Button from "@/components/Button";
import CustomHeader from "@/components/CustomHeader";
import { router } from "expo-router";
import { typography } from "@/config/typography";

export default function ReportFailureForm() {
  const [predio, setPredio] = useState("");
  const [lote, setLote] = useState("");
  const [fallo, setFallo] = useState("");
  const [observacion, setObservacion] = useState("");
  const [loading, setLoading] = useState(false);

  const predios = [
    { label: "Seleccione el predio", value: "" },
    { label: "Predio 1", value: "predio1" },
    { label: "Predio 2", value: "predio2" },
  ];

  const lotes = [
    { label: "Seleccione el lote", value: "" },
    { label: "Lote A", value: "loteA" },
    { label: "Lote B", value: "loteB" },
  ];

  const posiblesFallos = [
    { label: "Seleccione el posible fallo", value: "" },
    { label: "Fallo en la tubería", value: "tuberia" },
    { label: "Fallo en la válvula", value: "valvula" },
    { label: "Fallo en el medidor", value: "medidor" },
    { label: "Fallo en el controlador", value: "controlador" },
    { label: "Fallo en la antena", value: "antena" },
    { label: "Fallo en el software", value: "software" },
    {
      label: "Fallo en el suministro de energía a los dispositivos",
      value: "energia",
    },
  ];

  const handleSubmit = () => {
    if (!predio || !lote || !fallo || !observacion) {
      Alert.alert(
        "Formulario incompleto",
        "Por favor, completa todos los campos antes de continuar."
      );
      return;
    }

    Alert.alert(
      "¿Está seguro de realizar la siguiente acción?",
      "¿Estás seguro que deseas reportar el fallo?",
      [
        {
          text: "Cancelar",
          onPress: () => console.log("Reporte no enviado"),
          style: "cancel",
        },
        {
          text: "Confirmar",
          onPress: () => {
            setLoading(true);
            setTimeout(() => {
              console.log({ predio, lote, fallo, observacion });
              setLoading(false);
            }, 1000);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader
        title="Reportar fallo"
        backRoute={() => router.push("/reports/seeReports")}
      />

      <ScrollView contentContainerStyle={styles.form}>
        <View style={styles.innerForm}>
          <Text style={styles.subtitle}>
            Por favor, complete el siguiente formularios y luego de a confirmar
            para enviar su reporte.
          </Text>

          <Text style={styles.label}>Predio afectado</Text>
          <DropdownPicker
            selectedValue={predio}
            onValueChange={(value) => setPredio(value)}
            options={predios}
          />

          <Text style={styles.label}>Lote afectado</Text>
          <DropdownPicker
            selectedValue={lote}
            onValueChange={(value) => setLote(value)}
            options={lotes}
          />

          <Text style={styles.label}>Posible fallo</Text>
          <DropdownPicker
            selectedValue={fallo}
            onValueChange={(value) => setFallo(value)}
            options={posiblesFallos}
          />

          <Text style={styles.label}>Observaciones *</Text>
          <TextInput
            style={styles.textArea}
            multiline
            placeholder="Observación"
            value={observacion}
            onChangeText={setObservacion}
          />

          <View style={styles.buttonContainer}>
            <Button text="Confirmar" onPress={handleSubmit} loading={loading} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  form: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 3,
  },
  innerForm: {
    flex: 1,
    justifyContent: "space-between",
  },
  buttonContainer: {
    marginTop: 110,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 2,
    textAlign: "center",
  },
  subtitle: {
    ...typography.regular.large,
    marginBottom: 1,
    color: colors.gray,
  },
  label: {
    marginBottom: 6,
    marginTop: 16,
    ...typography.medium.regular,
    color: colors.gray,
  },
  textArea: {
    height: 90,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 15,
    padding: 10,
    backgroundColor: colors.white,
    textAlignVertical: "top",
  },
});
