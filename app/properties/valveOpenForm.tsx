import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Alert,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import DropdownPicker from "@/components/Dropdown";
import { typography } from "@/config/typography";
import { colors } from "@/config/theme";
import Button from "@/components/Button";
import CustomHeader from "@/components/CustomHeader";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function App() {
  const router = useRouter();
  const insets = useSafeAreaInsets(); // Aquí usamos el hook
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [volumen, setVolumen] = useState("");
  const [fechaApertura, setFechaApertura] = useState<Date | null>(null);
  const [fechaCierre, setFechaCierre] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState<{
    type: string;
    visible: boolean;
    mode: "date" | "time";
  }>({ type: "", visible: false, mode: "date" });

  const opciones = [
    { label: "Seleccione una opción", value: "1" },
    { label: "Apertura programada con limite de agua", value: "opcion1" },
    { label: "Apertura programada sin limite de agua", value: "opcion2" },
  ];

  const handleConfirm = () => {
    if (!selectedOption || selectedOption === "1") {
      Alert.alert("Atención", "Por favor, seleccione una opción válida.");
      return;
    }

    if (
      selectedOption === "opcion1" &&
      (!volumen || !fechaApertura || !fechaCierre)
    ) {
      Alert.alert("Faltan datos", "Por favor, complete todos los campos.");
      return;
    }

    if (selectedOption === "opcion2" && (!fechaApertura || !fechaCierre)) {
      Alert.alert(
        "Faltan datos",
        "Por favor, ingrese las fechas de apertura y cierre."
      );
      return;
    }

    if (fechaApertura && fechaCierre && fechaCierre <= fechaApertura) {
      Alert.alert(
        "Fechas inválidas",
        "La fecha y hora de cierre debe ser posterior a la de apertura."
      );
      return;
    }

    console.log("Formulario completo:", {
      opcion: selectedOption,
      volumen: selectedOption === "opcion1" ? volumen : "No aplica",
      fechaApertura: fechaApertura?.toLocaleString(),
      fechaCierre: fechaCierre?.toLocaleString(),
    });

    Alert.alert(
      "Éxito",
      "Se ha enviado su solicitud de apertura correctamente."
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.base }}>
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: insets.top }]}
        keyboardShouldPersistTaps="handled"
      >
        <CustomHeader
          title="Solicitud de apertura"
          backRoute={() => router.push("properties/detailsLot")}
        />

        <Text style={styles.subtitle}>
          Por favor, complete el siguiente formulario y luego de la confirmar
          para enviar su solicitud.
        </Text>

        <View style={{ marginBottom: 20 }}>
          <Text style={styles.label}>Opciones de apertura</Text>
          <DropdownPicker
            options={opciones}
            selectedValue={selectedOption}
            onValueChange={setSelectedOption}
          />
        </View>

        {selectedOption === "opcion1" && (
          <>
            <Text style={styles.label}>Volumen de agua</Text>
            <TextInput
              placeholder="Volumen de agua (m³)"
              placeholderTextColor={colors.darkGray}
              style={styles.input}
              value={volumen}
              onChangeText={setVolumen}
              keyboardType="numeric"
            />
          </>
        )}

        {(selectedOption === "opcion1" || selectedOption === "opcion2") && (
          <>
            <Text style={styles.label}>Fecha y hora de apertura</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() =>
                setShowPicker({ type: "apertura", visible: true, mode: "date" })
              }
            >
              <Text>
                {fechaApertura
                  ? fechaApertura.toLocaleString()
                  : "Seleccionar fecha y hora"}
              </Text>
            </TouchableOpacity>
            {showPicker.type === "apertura" && showPicker.visible && (
              <DateTimePicker
                value={fechaApertura || new Date()}
                mode={showPicker.mode}
                display="default"
                minimumDate={new Date()}
                onChange={(event, date) => {
                  if (event.type === "dismissed") {
                    setShowPicker({ type: "", visible: false, mode: "date" });
                    return;
                  }

                  if (showPicker.mode === "date") {
                    setFechaApertura(date || new Date());
                    setShowPicker({
                      type: "apertura",
                      visible: true,
                      mode: "time",
                    });
                  } else {
                    const finalDate = new Date(fechaApertura || new Date());
                    finalDate.setHours(date?.getHours() || 0);
                    finalDate.setMinutes(date?.getMinutes() || 0);
                    setFechaApertura(finalDate);
                    setShowPicker({ type: "", visible: false, mode: "date" });
                  }
                }}
              />
            )}

            <Text style={styles.label}>Fecha y hora de cierre</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() =>
                setShowPicker({ type: "cierre", visible: true, mode: "date" })
              }
            >
              <Text>
                {fechaCierre
                  ? fechaCierre.toLocaleString()
                  : "Seleccionar fecha y hora"}
              </Text>
            </TouchableOpacity>
            {showPicker.type === "cierre" && showPicker.visible && (
              <DateTimePicker
                value={fechaCierre || new Date()}
                mode={showPicker.mode}
                display="default"
                minimumDate={new Date()}
                onChange={(event, date) => {
                  if (event.type === "dismissed") {
                    setShowPicker({ type: "", visible: false, mode: "date" });
                    return;
                  }

                  if (showPicker.mode === "date") {
                    setFechaCierre(date || new Date());
                    setShowPicker({
                      type: "cierre",
                      visible: true,
                      mode: "time",
                    });
                  } else {
                    const finalDate = new Date(fechaCierre || new Date());
                    finalDate.setHours(date?.getHours() || 0);
                    finalDate.setMinutes(date?.getMinutes() || 0);
                    setFechaCierre(finalDate);
                    setShowPicker({ type: "", visible: false, mode: "date" });
                  }
                }}
              />
            )}
          </>
        )}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button text="Confirmar" onPress={handleConfirm} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    backgroundColor: colors.base,
    flexGrow: 1,
    paddingBottom: 30,
  },
  subtitle: {
    ...typography.regular.large,
    color: colors.gray,
    marginBottom: 20,
  },
  label: {
    ...typography.medium.medium,
    color: colors.darkGray,
    marginBottom: 5,
  },
  input: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: colors.white,
    justifyContent: "center",
    ...typography.regular.large,
  },
  buttonContainer: {
    marginTop: 10,
    paddingHorizontal: 20,
    backgroundColor: colors.base,
  },
});
