import React, { useEffect, useState } from "react";
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
import { useLotContext } from "@/context/LotContext";
import { API_URL, API_URL_MAINT } from "@/services/config";

export default function ReportFailureForm() {
  const [predio, setPredio] = useState("");
  const [lote, setLote] = useState("");
  const [fallo, setFallo] = useState("");
  const [observacion, setObservacion] = useState("");
  const [loading, setLoading] = useState(false);
  const [prediosOptions, setPrediosOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [tiposFallo, setTiposFallo] = useState<
    { label: string; value: string }[]
  >([]);

  const { fetchPropertiesByUser, refreshLotsByProperty, lots } =
    useLotContext();

  // Cargar predios
  useEffect(() => {
    const loadPredios = async () => {
      const data = await fetchPropertiesByUser();
      const options = data.map((item) => ({
        label: item.name,
        value: item.id,
      }));
      setPrediosOptions([
        { label: "Seleccione el predio", value: "" },
        ...options,
      ]);
    };
    loadPredios();
  }, []);

  // Cargar lotes al cambiar predio
  useEffect(() => {
    if (predio) {
      refreshLotsByProperty(predio);
    }
  }, [predio]);

  // Cargar tipos de fallo desde backend
  useEffect(() => {
    const fetchFailureTypes = async () => {
      try {
        const res = await fetch(`${API_URL_MAINT}/maintenance/failure-types`);
        const data = await res.json();

        if (data.success) {
          const mapped = data.data.map((item: any) => ({
            label: item.name,
            value: item.id.toString(),
          }));
          setTiposFallo([
            { label: "Seleccione el posible fallo", value: "" },
            ...mapped,
          ]);
        } else {
          Alert.alert("Error", "No se pudieron obtener los tipos de fallo.");
        }
      } catch (error) {
        console.error("Error al cargar tipos de fallo:", error);
        Alert.alert("Error", "Hubo un problema al cargar los tipos de fallo.");
      }
    };

    fetchFailureTypes();
  }, []);

  const lotesOptions = [
    { label: "Seleccione el lote", value: "" },
    ...lots.map((l) => ({ label: l.name, value: l.id })),
  ];

  const handleSubmit = async () => {
    if (!predio || !lote || !fallo || !observacion) {
      Alert.alert(
        "Formulario incompleto",
        "Por favor, completa todos los campos."
      );
      return;
    }

    Alert.alert("¿Está seguro?", "¿Deseas reportar el fallo?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Confirmar",
        onPress: async () => {
          try {
            setLoading(true);

            const payload = {
              lot_id: Number(lote),
              type_failure_id: Number(fallo),
              description_failure: observacion.trim(),
            };

            console.log("Payload a enviar:", payload);

            const response = await fetch(
              `${API_URL_MAINT}/maintenance/reports`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
              }
            );

            const result = await response.json();

            if (result.success) {
              Alert.alert("Éxito", "El reporte fue enviado correctamente.");
              router.push("/reports/seeReports");
            } else {
              Alert.alert(
                "Error",
                result.message || "No se pudo enviar el reporte."
              );
            }
          } catch (error) {
            console.error("Error al enviar el reporte:", error);
            Alert.alert("Error", "Hubo un problema al enviar el reporte.");
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
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
            Por favor, complete el siguiente formulario y confirme para enviar
            su reporte.
          </Text>

          <Text style={styles.label}>Predio afectado</Text>
          <DropdownPicker
            selectedValue={predio}
            onValueChange={(value) => {
              setPredio(value);
              setLote(""); // reinicia el lote si cambia de predio
            }}
            options={prediosOptions}
          />

          <Text style={styles.label}>Lote afectado</Text>
          <DropdownPicker
            selectedValue={lote}
            onValueChange={setLote}
            options={lotesOptions}
          />

          <Text style={styles.label}>Posible fallo</Text>
          <DropdownPicker
            selectedValue={fallo}
            onValueChange={setFallo}
            options={tiposFallo}
          />

          <Text style={styles.label}>Observaciones (opcional)</Text>
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
    ...typography.regular.large,
    textAlignVertical: "top",
  },
});
